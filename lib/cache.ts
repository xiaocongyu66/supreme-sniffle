import fs from 'fs/promises';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'cache.json');
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION || '3600', 10) * 1000;

export interface CachedRelease {
  repository: string;
  releases: any[];
  timestamp: number;
}

export interface CacheData {
  releases: CachedRelease[];
  lastUpdated: number;
}

let cache: CacheData | null = null;

export async function loadCache(): Promise<CacheData> {
  if (cache) return cache;

  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    cache = JSON.parse(data);
    
    // Check if cache is expired
    if (Date.now() - cache.lastUpdated > CACHE_DURATION) {
      cache = null;
      return { releases: [], lastUpdated: 0 };
    }
    
    return cache;
  } catch (error) {
    return { releases: [], lastUpdated: 0 };
  }
}

export async function saveCache(data: CacheData): Promise<void> {
  cache = data;
  await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2));
}

export async function updateReleaseCache(
  repository: string,
  releases: any[]
): Promise<void> {
  const cache = await loadCache();
  const existingIndex = cache.releases.findIndex(r => r.repository === repository);
  
  if (existingIndex >= 0) {
    cache.releases[existingIndex] = {
      repository,
      releases,
      timestamp: Date.now(),
    };
  } else {
    cache.releases.push({
      repository,
      releases,
      timestamp: Date.now(),
    });
  }
  
  cache.lastUpdated = Date.now();
  await saveCache(cache);
}

export async function getCachedReleases(repository: string): Promise<any[]> {
  const cache = await loadCache();
  const cached = cache.releases.find(r => r.repository === repository);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.releases;
  }
  
  return [];
}

export function clearCache(): void {
  cache = null;
}