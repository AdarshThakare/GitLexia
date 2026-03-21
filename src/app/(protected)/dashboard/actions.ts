"use server";

import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;

  const result = await db.$queryRaw<
    { fileName: string; sourceCode: string; summary: string }[]
  >`
    SELECT "fileName" , "sourceCode" , "summary" , 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > .5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC LIMIT 10
    `;

  let context = "";

  for (const doc of result) {
    context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode.slice(0, 2000)}\n summary of file: ${doc.summary}\n\n`;
  }

  const { textStream } = await streamText({
    model: google("gemini-2.5-flash"),
    prompt: `
        You are a AI code assistant who answers questions about the codebase. Your target audience is a technical intern who is a beginner. You are a brand new, powerful, human-like AI assistant.
        
        The traits of AI include expert knowledge, helpfulness, cleverness ad articulateness.
        AI is a well-behaved and well-mannered individual.
        AI is always friendly, kind ans inspiring, ans is eager to provide vivid and thoughtful responses to the user.
        AI has the sum of all the knowledge in their brain, and is able to accurately answer nearly any question about any topic in elaborate details.
        If the question is asking about the code or a specific file. AI will provide the detailed answer, giving step by step instructions explaining the sokution.
        
        START CONTEXT BLOCK
        ${context}
        END CONTEXT BLOCK
        
        START QUESTION
        ${question}
        END QUESTION
        
        AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
        If the context does not provide the answer to the question, the AI assistant will say, "I'm sorry,but I don't know the answer instead of random quessing and providing incorrect results.
        AI assistant will not apologise for previous responses but instead it will indicate new information was gained.
        AI assistant will not invent anything that is not drawn directly from the context.
        
        Answer in markdown syntax, with code snippets wherever needed. Be as detailed as possible when aswering.`,
  });

  return {
    output: textStream,
    fileReferences: result,
  };
}
