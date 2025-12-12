import fs from 'fs/promises';
import path from 'path';

const URL_FILE = path.join(process.cwd(), 'public', 'url.txt');

export async function readRepositoryUrls(): Promise<string[]> {
  try {
    const content = await fs.readFile(URL_FILE, 'utf-8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
  } catch (error) {
    console.error('Error reading url.txt:', error);
    return [];
  }
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export function generateProxyUrl(originalUrl: string, baseUrl: string): string {
  try {
    const url = new URL(originalUrl);
    const path = encodeURIComponent(url.pathname);
    return `${baseUrl}/api/proxy/${url.hostname}${path}`;
  } catch (error) {
    // If URL is invalid, encode the whole string
    return `${baseUrl}/api/proxy/${encodeURIComponent(originalUrl)}`;
  }
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}