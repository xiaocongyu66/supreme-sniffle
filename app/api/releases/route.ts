import { NextRequest, NextResponse } from 'next/server';
import { getReleases, parseGitHubUrl } from '@/lib/github';
import { getCachedReleases, updateReleaseCache } from '@/lib/cache';
import { readRepositoryUrls } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.API_KEY;
    
    // Check API key if set
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const repo = searchParams.get('repo');
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (repo) {
      // Get releases for specific repository
      let releases = [];
      
      if (!forceRefresh) {
        releases = await getCachedReleases(repo);
      }
      
      if (forceRefresh || releases.length === 0) {
        releases = await getReleases(repo);
        await updateReleaseCache(repo, releases);
      }
      
      return NextResponse.json({
        repository: repo,
        releases,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Get releases for all repositories in url.txt
      const urls = await readRepositoryUrls();
      const results = await Promise.all(
        urls.map(async (url) => {
          try {
            const releases = await getCachedReleases(url);
            return {
              repository: url,
              releases,
              cached: releases.length > 0,
            };
          } catch (error) {
            return {
              repository: url,
              error: 'Failed to fetch releases',
              releases: [],
              cached: false,
            };
          }
        })
      );
      
      return NextResponse.json({
        repositories: results,
        count: urls.length,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error in releases API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}