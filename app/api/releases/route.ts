import { NextRequest, NextResponse } from 'next/server';
import { getRepositoryUrls } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const repo = searchParams.get('repo');
    
    if (repo) {
      // 返回单个仓库的模拟数据
      return NextResponse.json({
        repository: repo,
        releases: [{
          id: 1,
          tag_name: 'v1.0.0',
          name: 'Release v1.0.0',
          published_at: new Date().toISOString(),
          assets: [
            {
              id: 1,
              name: 'example.zip',
              size: 1024 * 1024, // 1MB
              download_count: 1000,
              browser_download_url: `https://github.com/${repo}/releases/download/v1.0.0/example.zip`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ]
        }]
      });
    }
    
    // 返回所有仓库的模拟数据
    const repositoryUrls = await getRepositoryUrls();
    const repositories = repositoryUrls.map(url => ({
      repository: url,
      releases: [{
        id: Math.floor(Math.random() * 1000),
        tag_name: `v${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
        name: `Sample Release for ${url}`,
        published_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        assets: [
          {
            id: Math.floor(Math.random() * 1000),
            name: 'package.zip',
            size: Math.floor(Math.random() * 50 * 1024 * 1024), // 随机大小
            download_count: Math.floor(Math.random() * 10000),
            browser_download_url: `https://github.com/${url}/releases/download/v1.0.0/package.zip`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ]
      }],
      cached: true,
    }));
    
    return NextResponse.json({
      repositories,
      timestamp: new Date().toISOString(),
      total: repositories.length,
    });
    
  } catch (error: any) {
    console.error('Error in releases API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        repositories: []
      },
      { status: 500 }
    );
  }
}