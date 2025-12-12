import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getFileContent } from '@/lib/github';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path } = params;
    const searchParams = request.nextUrl.searchParams;
    
    // Get the original GitHub URL from path
    const encodedPath = path.join('/');
    const originalUrl = decodeURIComponent(encodedPath);
    
    // Check if it's a direct GitHub asset URL
    let downloadUrl = originalUrl;
    
    if (!originalUrl.startsWith('https://')) {
      // Reconstruct GitHub download URL
      const repo = searchParams.get('repo');
      const asset = searchParams.get('asset');
      
      if (repo && asset) {
        // Construct URL from repository and asset name
        const [owner, repoName] = repo.split('/');
        downloadUrl = `https://github.com/${owner}/${repoName}/releases/download/${path.join('/')}`;
      } else {
        // Try to construct from path
        downloadUrl = `https://${originalUrl}`;
      }
    }

    // Fetch the file from GitHub
    const response = await axios.get(downloadUrl, {
      responseType: 'stream',
      headers: {
        Authorization: process.env.GITHUB_TOKEN 
          ? `token ${process.env.GITHUB_TOKEN}` 
          : undefined,
        'User-Agent': 'GitHub-Releases-Proxy',
      },
    });

    // Get filename from URL or Content-Disposition header
    let filename = 'download';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+?)"?$/);
      if (match) {
        filename = match[1];
      }
    } else {
      // Extract filename from URL
      const urlParts = downloadUrl.split('/');
      filename = urlParts[urlParts.length - 1];
    }

    // Create response with the file
    const headers = new Headers();
    headers.set('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    headers.set('Content-Length', response.headers['content-length'] || '0');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Cache-Control', 'public, max-age=86400'); // 24 hours cache

    return new NextResponse(response.data, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error in proxy API:', error);
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch file',
          details: error.message,
          status: error.response?.status 
        },
        { status: error.response?.status || 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}