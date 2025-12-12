import { NextRequest, NextResponse } from 'next/server';
import { getReleases } from '@/lib/github';
import { getCachedReleases, updateReleaseCache } from '@/lib/cache';
import { getRepositoryUrls } from '@/lib/config'; // 改为从新模块导入

export const dynamic = 'force-dynamic'; // 强制动态渲染

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const repo = searchParams.get('repo');
    const forceRefresh = searchParams.get('refresh') === 'true';

    // 使用新的配置系统读取仓库URL
    const repositoryUrls = await getRepositoryUrls();
    
    if (repo) {
      // 获取特定仓库的Releases
      let releases = [];
      
      if (!forceRefresh) {
        releases = await getCachedReleases(repo);
      }
      
      if (forceRefresh || releases.length === 0) {
        try {
          releases = await getReleases(repo);
          await updateReleaseCache(repo, releases);
        } catch (error: any) {
          return NextResponse.json(
            { 
              error: `Failed to fetch releases for ${repo}`,
              details: error.message 
            },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json({
        repository: repo,
        releases,
        timestamp: new Date().toISOString(),
        totalRepositories: repositoryUrls.length,
      });
    } else {
      // 获取所有仓库的Releases
      const results = await Promise.all(
        repositoryUrls.map(async (url) => {
          try {
            const releases = await getCachedReleases(url);
            return {
              repository: url,
              releases: releases || [],
              cached: releases && releases.length > 0,
              success: true,
            };
          } catch (error: any) {
            return {
              repository: url,
              releases: [],
              error: error.message,
              cached: false,
              success: false,
            };
          }
        })
      );
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      return NextResponse.json({
        repositories: results,
        summary: {
          total: repositoryUrls.length,
          successful: successful.length,
          failed: failed.length,
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error('Error in releases API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}