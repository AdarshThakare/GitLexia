import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summarizeCode } from "./gemini";
import { db } from "@/server/db";

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || process.env.GITHUB_TOKEN || "",
    branch: "main",
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
      "node_modules",
      "dist",
      ".next",
      ".git",
      "*.svg",
      "*.png",
      "*.jpg",
      "*.jpeg",
      "*.gif",
      "*.webp",
      "*.ico",
      "*.pdf",
      "*.zip",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });

  const docs = await loader.load();
  return docs;
};

import pLimit from "p-limit";

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  console.log(`Processing ${docs.length} documents for project ${projectId}`);

  const limit = pLimit(5); // Increased concurrency for parallel compute

  await Promise.allSettled(
    docs.map((doc, index) =>
      limit(async () => {
        // Skip files that are likely too large or binary that slipped through
        if (doc.pageContent.length > 50000) {
          console.log(`Skipping large file: ${doc.metadata.source} (${doc.pageContent.length} chars)`);
          return;
        }

        console.log(`Processing document ${index + 1}/${docs.length}: ${doc.metadata.source}`);
        try {
          const summary = await summarizeCode(doc);
          const embedding = await generateEmbedding(summary);

          const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data: {
              summary,
              sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
              fileName: doc.metadata.source,
              projectId,
            },
          });

          await db.$executeRaw`
            UPDATE "SourceCodeEmbedding"
            SET "summaryEmbedding" = ${embedding}::vector 
            WHERE "id" = ${sourceCodeEmbedding.id}`;
        } catch (error) {
          console.error(`Error processing ${doc.metadata.source}:`, error);
        }
      }),
    ),
  );
  console.log("Indexing completed.");
};
