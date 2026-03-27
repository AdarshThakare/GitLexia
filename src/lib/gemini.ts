import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";
import dotenv from "dotenv";
dotenv.config();

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});


import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const retryAiSummarizedCommit = async (diff: string) => {
  const response = await model.generateContent([
    `You are an expert programmer, and you are trying to summarize a git diff.
    Reminders about the git diff format.
    For every file, there are a few metadata lines, like(for example):   
    \`\`\`
    diff --git a/lib/index.js-b/lib/index.js
    index aadf891..bfef603 109644
    ---a/lib/index.js
    +++b/lib/index.js
    \`\`\`
    This means that \lib/index.js was modified in this commit. Note that this is only an example.
    Then there is a specifier of the lines that were modified.
    A line starting with \\ means it was added.
    A line that starting with - means that line was deleted.
    A line that starts with neither + nor - is code given for context and better understanding.
    It is not part of the diff.
    [...]
    EXAMPLE SUMMARY COMMENTS:
    \`\`\`
    * Raised the amount of returned recordings from 10 to 160 packages/server/recordings_api.ts]. [packages/server/constants.ts]
    * Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
    * Moved the octokit initialization to a separate file [src/octokit.ts], [src/index.ts]
    * Added an OpenAI API for completions (packages/utils/apis/openai.ts)
    * Lowered numeric tolerance for test files
    \`\`\`
    Most commits will have less comments than this examples list.
    The last comment does not include the file names.
    because there were more than two relevant files in the hypothetical commit.
    Do not include parts of the example in your summary.
    It is given only as an example of appropriate comments...
    Please summarise the following diff file: \n\n${diff}
     In your answers do not include, Here's the overview of the diffs or Okay , I need to summarize the diff or anything like that. 
     Directly start from the main content and structurize it into 5-7 points and the total number of words in the summary should be maximum 150-200 words.
     Start each point with a sequential ordered numbering like 1., 2., 3., etc. `,

  ]);
  return response.response.text();
};


export const aiSummarizedCommit = async (diff: string) => {
  try {
    const { text } = await generateText({
      model: groq("openai/gpt-oss-20b"),
      prompt: `You are an expert programmer, sand you are trying to summarize a git diff.
      Reminders about the git diff format.
      For every file, there are a few metadata lines, like(for example):   
      \`\`\`
      diff --git a/lib/index.js-b/lib/index.js
      index aadf891..bfef603 109644
      ---a/lib/index.js
      +++b/lib/index.js
      \`\`\`
      This means that \\lib/index.js was modified in this commit. Note that this is only an example.
      Then there is a specifier of the lines that were modified.
      A line starting with + means it was added.
      A line that starting with - means that line was deleted.
      A line that starts with neither + nor - is code given for context and better understanding.
      It is not part of the diff.
      [...]
      EXAMPLE SUMMARY COMMENTS:
      \`\`\`
      * Raised the amount of returned recordings from 10 to 160 packages/server/recordings_api.ts]. [packages/server/constants.ts]
      * Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
      * Moved the octokit initialization to a separate file [src/octokit.ts], [src/index.ts]
      * Added an OpenAI API for completions (packages/utils/apis/openai.ts)
      * Lowered numeric tolerance for test files
      \`\`\`
      Most commits will have less comments than this examples list.
      The last comment does not include the file names.
      because there were more than two relevant files in the hypothetical commit.
      Do not include parts of the example in your summary.
      It is given only as an example of appropriate comments...
      Please summarise the following diff file: \n\n${diff}
     In your answers do not include, Here's the overview of the diffs or Okay , I need to summarize the diff or anything like that. 
     Directly start from the main content and structurize it into 5-7 points and the total number of words in the summary should be maximum 150-200 words. 
     Start each point with a sequential ordered numbering like 1., 2., 3., etc
     `,
    });
    return text;
  } catch (error) {
    console.error("Groq error:", error);
    return "";
  }
};

//FOR THE RAG

export async function summarizeCode(doc: Document) {
  console.log("getting summary for ", doc.metadata.source);
  try {
    const code = doc.pageContent.slice(0, 10000);
    const { text } = await generateText({
      model: groq("qwen/qwen3-32b"),
      prompt: `You are an intelligent software engineer who specializes in onboarding junior software engineers onto projects.
      You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file. Here is the code:
      ---
      ${code}
      ---
      
       In your answers do not include, Here's the overview of the diffs or Okay , I need to summarize the diff or anything like that. 
     Directly start from the main content and structurize it into 5-7 points and the total number of words in the summary should be maximum 100-150 words. `,
    });

    return text || "";
  } catch (error) {
    console.error("Groq summarizeCode error:", error);
    return "";
  }
}

export async function generateEmbedding(summary: string) {
  if (!summary) return new Array(768).fill(0); // Return a zero vector for empty summaries
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-embedding-001",
    });
    const result = await model.embedContent(summary);
    const embedding = result.embedding;
    return embedding.values;
  } catch (error) {
    console.error("Embedding error:", error);
    return new Array(768).fill(0);
  }
}

export const generateMeetingSummary = async (text: string) => {
  const response = await model.generateContent([
    `
You are an AI meeting assistant.

Based on the following meeting transcript, generate:

1. A short professional headline (max 10 words)
2. A concise executive summary in paragraphs

Transcript:
${text}

Respond strictly in JSON format:
{
  "headline": "...",
  "summary": "..."
}
`,
  ]);

  return response.response.text();
};
