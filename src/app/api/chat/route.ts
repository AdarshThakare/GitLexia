import { convertToModelMessages, streamText } from "ai";
import { google } from "@/lib/gemini";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Find the latest user message to use for RAG
    // Manually handle both string content and the new parts format for backward compatibility
    const getUserMessageText = (m: any) => {
      if (typeof m.content === 'string') return m.content;
      if (Array.isArray(m.parts)) {
        return m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
      }
      return "";
    };

    const lastUserMessage = (messages as any[])
      .slice()
      .reverse()
      .find((m) => m.role === "user");

    const query = getUserMessageText(lastUserMessage || {});

    let context = "";

    // Perform vector search if a query exists
    if (query) {
      const queryVector = await generateEmbedding(query);
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

      for (const doc of result) {
        context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode.slice(0, 2000)}\n summary of file: ${doc.summary}\n\n`;
      }
    }

    const systemPromptMessage: any = {
      role: "system",
      content: `
        You are GitLexia Intelligence, a high-performance AI code assistant. You are engaged in a continuous, multi-turn technical dialogue with a developer about their codebase.
        
        Traits: Expert, articulate, helpful, and highly accurate.
        
        OPERATING INSTRUCTIONS:
        1. Access the CONTEXT BLOCK below for relevant codebase snippets.
        2. If the current CONTEXT BLOCK doesn't contain the answer but previous messages in the chat history do, use the history.
        3. Provide detailed, step-by-step technical explanations including code snippets where appropriate.
        4. Refer to files by their full names as provided in the context.
        5. If you cannot find the answer in the provided context or history, say "I'm sorry, I don't have enough context to answer that accurately," rather than guessing.
        
        --- START CONTEXT BLOCK ---
        ${context}
        --- END CONTEXT BLOCK ---
        
        Remember: This is a consistent dialogue. Maintain awareness of previous knowledge and answers.
      `,
    };

    // Sanitize messages: AI SDK v6 convertToModelMessages expects 'parts' array.
    // Ensure all messages have parts for resilience against old message formats.
    const sanitizedMessages = messages.map((m: any) => {
      if (Array.isArray(m.parts)) return m;
      return {
        ...m,
        parts: [{ type: 'text', text: m.content || "" }]
      };
    });

    const modelMessages = await convertToModelMessages(sanitizedMessages);
    const payloadMessages: any[] = [systemPromptMessage, ...modelMessages];

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      messages: payloadMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
