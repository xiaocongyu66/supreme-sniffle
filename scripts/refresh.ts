#!/usr/bin/env tsx

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { parseGitHubUrl } from '@/lib/github';

const URL_FILE = path.join(process.cwd(), 'public', 'url.txt');
const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.API_KEY;

async function readUrls(): Promise<string[]> {
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

async function refreshCache() {
  console.log('Starting cache refresh...');
  
  const urls = await readUrls();
  console.log(`Found ${urls.length} repositories to refresh`);
  
  const headers: Record<string, string> = {};
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  for (const url of urls) {
    try {
      console.log(`Refreshing: ${url}`);
      
      const { owner, repo } = parseGitHubUrl(url);
      const repoPath = `${owner}/${repo}`;
      
      const response = await axios.get(`${BASE_URL}/api/refresh`, {
        params: { repo: repoPath },
        headers,
      });
      
      console.log(`✓ Refreshed ${repoPath}: ${response.data.releaseCount} releases`);
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`✗ Failed to refresh ${url}:`, error);
    }
  }
  
  console.log('Cache refresh completed');
}

// Run refresh
refreshCache().catch(console.error);