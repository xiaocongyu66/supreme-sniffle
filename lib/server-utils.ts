import fs from 'fs/promises';
import path from 'path';

// 这些函数只在服务端使用，不会被客户端导入

const URL_FILE = path.join(process.cwd(), 'public', 'url.txt');

export async function readRepositoryUrls(): Promise<string[]> {
  try {
    const content = await fs.readFile(URL_FILE, 'utf-8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        // 过滤空行和注释
        if (!line || line.startsWith('#')) return false;
        
        // 基本验证
        return line.includes('/') || line.includes('github.com');
      })
      .map(line => {
        // 规范化URL
        if (!line.includes('://') && line.includes('github.com')) {
          return `https://${line}`;
        }
        return line;
      });
  } catch (error: any) {
    console.error('Error reading url.txt:', error.message);
    return getDefaultRepositories();
  }
}

function getDefaultRepositories(): string[] {
  return [
    'https://github.com/vercel/next.js',
    'https://github.com/tailwindlabs/tailwindcss'
  ];
}