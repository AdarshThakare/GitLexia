import { octokit } from "./github";

async function fetchWithRetry(fetcher: () => Promise<any>, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetcher();
      if (response.status === 200) {
        return response.data;
      }
      if (response.status === 202) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
      throw new Error(`Unexpected status code: ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error("Failed to fetch repository statistics after retries");
}

function parseGithubUrl(url: string) {
  const [OWNER, REPO] = url.split("/").slice(-2);
  if (!OWNER || !REPO) {
    throw new Error("Invalid Github Url");
  }
  return { owner: OWNER, repo: REPO };
}

export async function getContributorStats(githubUrl: string) {
  const { owner, repo } = parseGithubUrl(githubUrl);
  return fetchWithRetry(() =>
    octokit.rest.repos.getContributorsStats({
      owner,
      repo,
    })
  );
}

export async function getCommitActivity(githubUrl: string) {
  const { owner, repo } = parseGithubUrl(githubUrl);
  return fetchWithRetry(() =>
    octokit.rest.repos.getCommitActivityStats({
      owner,
      repo,
    })
  );
}

export async function getPunchCard(githubUrl: string) {
  const { owner, repo } = parseGithubUrl(githubUrl);
  return fetchWithRetry(() =>
    octokit.rest.repos.getPunchCardStats({
      owner,
      repo,
    })
  );
}
export async function getLanguages(githubUrl: string) {
  const { owner, repo } = parseGithubUrl(githubUrl);
  return fetchWithRetry(() =>
    octokit.rest.repos.listLanguages({
      owner,
      repo,
    })
  );
}
