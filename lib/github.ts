import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_API_BASE = process.env.GITHUB_API_BASE || 'https://api.github.com';

// 创建一个带超时和重试的axios实例
const githubApi = axios.create({
  baseURL: GITHUB_API_BASE,
  timeout: 30000,
  headers: {
    ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
    'User-Agent': 'GitHub-Releases-Proxy/1.0',
    'Accept': 'application/vnd.github.v3+json',
  },
});

// 请求拦截器，添加重试逻辑
githubApi.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 403 || error.code === 'ECONNABORTED') {
      // 如果是速率限制或超时，等待后重试
      await new Promise(resolve => setTimeout(resolve, 2000));
      return githubApi.request(error.config);
    }
    return Promise.reject(error);
  }
);

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
      `/repos/${owner}/${repo}/releases`,
      {
        params: {
          per_page: 50,
          page: 1,
        }
      }
    );
    
    // 过滤掉草稿版和预发布版
    const releases = response.data.filter(
      release => !release.draft && !release.prerelease
    );
    
    console.log(`Fetched ${releases.length} releases for ${owner}/${repo}`);
    return releases;
  } catch (error: any) {
    console.error(`Error fetching releases for ${repoUrl}:`, error.message);
    
    // 提供友好的错误信息
    if (error.response?.status === 404) {
      throw new Error(`Repository not found: ${repoUrl}`);
    } else if (error.response?.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Consider adding a GITHUB_TOKEN.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    
    throw new Error(`Failed to fetch releases: ${error.message}`);
  }
}

export function parseGitHubUrl(url: string): RepositoryInfo {
  const trimmedUrl = url.trim();
  
  // 移除.git后缀和末尾斜杠
  const cleanUrl = trimmedUrl.replace(/\.git$/, '').replace(/\/$/, '');
  
  // 处理完整URL
  if (cleanUrl.includes('github.com')) {
    const urlParts = cleanUrl.split('/');
    const githubIndex = urlParts.indexOf('github.com');
    
    if (githubIndex >= 0 && urlParts.length >= githubIndex + 3) {
      return {
        owner: urlParts[githubIndex + 1],
        repo: urlParts[githubIndex + 2],
      };
    }
  }
  
  // 处理 "owner/repo" 格式
  const parts = cleanUrl.split('/');
  if (parts.length === 2) {
    return {
      owner: parts[0],
      repo: parts[1],
    };
  }
  
  throw new Error(`Invalid GitHub URL format: ${url}. Expected "owner/repo" or "https://github.com/owner/repo"`);
}

export async function getFileContent(url: string): Promise<Buffer> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60000,
      headers: {
        ...(process.env.GITHUB_TOKEN ? { 
          Authorization: `token ${process.env.GITHUB_TOKEN}` 
        } : {}),
        'User-Agent': 'GitHub-Releases-Proxy/1.0',
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching file from ${url}:`, error.message);
    throw new Error(`Failed to download file: ${error.message}`);
  }
}