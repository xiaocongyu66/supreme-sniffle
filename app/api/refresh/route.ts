import { NextRequest, NextResponse } from 'next/server';
import { getReleases } from '@/lib/github';
import { updateReleaseCache, clearCache } from '@/lib/cache';
import { readRepositoryUrls } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const repo = searchParams.get('repo');
    const clear = searchParams.get('clear') === 'true';
    const force = searchParams.get('force') === 'true';
    
    // Check for API key if set
    const apiKey = process.env.API_KEY;
    const authHeader = request.headers.get('authorization');
    
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (clear) {
      clearCache();
      return NextResponse.json({ message: 'Cache cleared successfully' });
    }

    if (repo) {
      // Refresh specific repository
      const releases = await getReleases(repo);
      await updateReleaseCache(repo, releases);
      
      return NextResponse.json({
        message: 'Cache refreshed successfully',
        repository: repo,
        releaseCount: releases.length,
      });
    } else {
      // Refresh all repositories
      const urls = await readRepositoryUrls();
      const results = await Promise.allSettled(
        urls.map(async (url) => {
          try {
            const releases = await getReleases(url);
            await updateReleaseCache(url, releases);
            return {
              repository: url,
              success: true,
              releaseCount: releases.length,
            };
          } catch (error) {
            return {
              repository: url,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      return NextResponse.json({
        message: 'Refresh completed',
        total: urls.length,
        successful: successful.length,
        failed: failed.length,
        results: results.map(r => r.status === 'fulfilled' ? r.value : null),
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error in refresh API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}