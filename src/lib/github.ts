import { db } from "../server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aiSummarizedCommit } from "./gemini";
import dotenv from "dotenv";
import pLimit from "p-limit";
dotenv.config();

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  const [OWNER, REPO] = githubUrl.split("/").slice(-2);

  if (!OWNER || !REPO) {
    throw new Error("Invalid Github Url");
  }

  const { data } = await octokit.rest.repos.listCommits({
    owner: OWNER,
    repo: REPO,
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommits.slice(0, 15).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit?.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));
};

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );

  if (unprocessedCommits.length > 0) {
    await db.commit.createMany({
      data: unprocessedCommits.map((commit) => ({
        projectId: projectId,
        commitHash: commit.commitHash,
        commitMessage: commit.commitMessage,
        commitAuthorName: commit.commitAuthorName,
        commitAuthorAvatar: commit.commitAuthorAvatar,
        commitDate: commit.commitDate,
        summary: "", // Start with no summary
      })),
    });
  }

  const limit = pLimit(5); // Process at most 5 summaries at once
  const summaryPromises = unprocessedCommits.map((commit) =>
    limit(async () => {
      try {
        const summary = await summarizeCommit(githubUrl, commit.commitHash);
        if (summary) {
          await db.commit.update({
            where: {
              projectId_commitHash: {
                projectId: projectId,
                commitHash: commit.commitHash,
              },
            },
            data: { summary },
          });
        }
      } catch (error) {
        console.error(`Error summarizing commit ${commit.commitHash}:`, error);
      }
    }),
  );

  await Promise.allSettled(summaryPromises);

  return { success: true };
};


export async function summarizeCommit(githubUrl: string, commitHash: string) {
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  });

  return (await aiSummarizedCommit(data)) || "";
}
// --------------------
async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true,
    },
  });

  if (!project?.githubUrl) {
    throw new Error("Project has no github URL");
  }

  return { project, githubUrl: project?.githubUrl };
}

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Response[],
) {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
  });
  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommits) => processedCommits.commitHash === commit.commitHash,
      ),
  );

  return unprocessedCommits;
}
