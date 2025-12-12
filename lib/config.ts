import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

const URL_FILE = path.join(process.cwd(), 'public', 'url.txt');

export interface AppConfig {
  repositoryUrls: string[];
  cacheDuration: number;
  refreshInterval: number;
}

/**
 * 读取配置文件，支持多种来源：
 * 1. 远程URL（环境变量 CONFIG_URL）
 * 2. 本地文件 public/url.txt
 * 3. 默认仓库列表
 */
export async function getRepositoryUrls(): Promise<string[]> {
  const configUrl = process.env.CONFIG_URL;
  
  // 1. 优先使用远程配置
  if (configUrl) {
    try {
      console.log(`Fetching config from remote URL: ${configUrl}`);
      const response = await axios.get(configUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'GitHub-Releases-Proxy/1.0',
        },
      });
      
      const urls = parseUrls(response.data);
      if (urls.length > 0) {
        console.log(`Loaded ${urls.length} repositories from remote config`);
        return urls;
      }
    } catch (error: any) {
      console.warn(`Failed to fetch remote config: ${error.message}. Falling back to local file.`);
    }
  }
  
  // 2. 使用本地文件
  try {
    const content = await fs.readFile(URL_FILE, 'utf-8');
    const urls = parseUrls(content);
    if (urls.length > 0) {
      console.log(`Loaded ${urls.length} repositories from local file`);
      return urls;
    }
  } catch (error: any) {
    console.warn(`Failed to read local config: ${error.message}. Using default repositories.`);
  }
  
  // 3. 使用默认配置
  return getDefaultRepositories();
}

function parseUrls(content: string): string[] {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      // 过滤空行和注释
      if (!line || line.startsWith('#')) return false;
      
      // 基本验证：包含斜杠或github.com
      return line.includes('/') || line.includes('github.com');
    })
    .map(line => {
      // 规范化URL
      if (!line.includes('://') && line.includes('github.com')) {
        return `https://${line}`;
      }
      return line;
    });
}

function getDefaultRepositories(): string[] {
  return [
    'https://github.com/vercel/next.js',
    'https://github.com/tailwindlabs/tailwindcss',
    'https://github.com/nodejs/node'
  ];
}

/**
 * 获取应用配置
 */
export async function getConfig(): Promise<AppConfig> {
  const repositoryUrls = await getRepositoryUrls();
  
  return {
    repositoryUrls,
    cacheDuration: parseInt(process.env.CACHE_DURATION || '3600', 10),
    refreshInterval: parseInt(process.env.REFRESH_INTERVAL || '3600000', 10),
  };
}