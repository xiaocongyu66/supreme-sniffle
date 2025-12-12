import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API_BASE = process.env.GITHUB_API_BASE || 'https://api.github.com';

const githubApi = axios.create({
  baseURL: GITHUB_API_BASE,
  headers: {
    Authorization: GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : undefined,
    'User-Agent': 'GitHub-Releases-Proxy',
  },
});

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  published_at: string;
  assets: {
    id: number;
    name: string;
    size: number;
    download_count: number;
    browser_download_url: string;
    created_at: string;
    updated_at: string;
  }[];
}

export interface RepositoryInfo {
  owner: string;
  repo: string;
}

export async function getReleases(repoUrl: string): Promise<GitHubRelease[]> {
  try {
    const { owner, repo } = parseGitHubUrl(repoUrl);
    const response = await githubApi.get<GitHubRelease[]>(
      `/repos/${owner}/${repo}/releases`
    );
    return response.data.filter(release => !release.draft);
  } catch (error) {
    console.error(`Error fetching releases for ${repoUrl}:`, error);
    throw error;
  }
}

export function parseGitHubUrl(url: string): RepositoryInfo {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length >= 2) {
      return {
        owner: pathParts[0],
        repo: pathParts[1],
      };
    }
    
    // Handle raw GitHub URLs
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      };
    }
    
    throw new Error('Invalid GitHub URL');
  } catch (error) {
    // If URL parsing fails, assume it's in format "owner/repo"
    const parts = url.split('/');
    if (parts.length >= 2) {
      return {
        owner: parts[0],
        repo: parts[1].replace(/\.git$/, ''),
      };
    }
    throw new Error('Invalid GitHub repository format');
  }
}

export async function getFileContent(url: string): Promise<Buffer> {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: {
      Authorization: process.env.GITHUB_TOKEN 
        ? `token ${process.env.GITHUB_TOKEN}` 
        : undefined,
    },
  });
  return response.data;
}