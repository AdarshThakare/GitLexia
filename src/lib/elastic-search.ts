import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
dotenv.config();

const ELASTIC_URL = process.env.ELASTICSEARCH_URL;

if (!ELASTIC_URL) {
  throw new Error("ELASTICSEARCH_URL is not defined in environment variables");
}

export const esClient = new Client({
  node: ELASTIC_URL,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY!,
  },
});

/**
 * Ensures global_search index exists with correct mappings
 */
export const ensureGlobalSearchIndex = async () => {
  const exists = await esClient.indices.exists({
    index: "global_search",
  });

  if (!exists) {
    await esClient.indices.create({
      index: "global_search",
      mappings: {
        properties: {
          type: { type: "keyword" },
          projectId: { type: "keyword" },

          title: {
            type: "text",
            analyzer: "standard",
          },

          content: {
            type: "text",
            analyzer: "standard",
          },

          author: {
            type: "text",
          },

          createdAt: {
            type: "date",
          },

          // 🔥 autocomplete field
          suggest: {
            type: "completion",
          },
        },
      },
    });

    console.log("✅ Created global_search index");
  }
};

await ensureGlobalSearchIndex();
