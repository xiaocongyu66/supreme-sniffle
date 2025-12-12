'use client';

import { useState, useEffect } from 'react';
import { formatFileSize, formatDate, generateProxyUrl } from '@/lib/utils';

interface GitHubAsset {
  id: number;
  name: string;
  size: number;
  download_count: number;
  browser_download_url: string;
  created_at: string;
  updated_at: string;
}

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  assets: GitHubAsset[];
}

interface RepositoryData {
  repository: string;
  releases: GitHubRelease[];
  cached?: boolean;
  error?: string;
}

export default function FileList() {
  const [data, setData] = useState<RepositoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    fetchData();
    setBaseUrl(window.location.origin);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/releases');
      if (!response.ok) {
        throw new Error('Failed to fetch releases');
      }
      const result = await response.json();
      setData(result.repositories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/refresh', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY || ''}`,
        },
      });
      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      setError('Failed to refresh');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          GitHub Releases Proxy
        </h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Refresh Cache
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No repositories found in url.txt</p>
          <p className="text-sm text-gray-400 mt-2">
            Add GitHub repository URLs to public/url.txt
          </p>
        </div>
      ) : (
        data.map((repoData) => (
          <div key={repoData.repository} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {repoData.repository}
              </h3>
              {repoData.cached && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">
                  Cached
                </span>
              )}
              {repoData.error && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded ml-2">
                  Error: {repoData.error}
                </span>
              )}
            </div>
            
            {repoData.releases.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No releases found
              </div>
            ) : (
              repoData.releases.map((release) => (
                <div key={release.id} className="p-6 border-b last:border-b-0">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900">
                      {release.name} ({release.tag_name})
                    </h4>
                    <p className="text-sm text-gray-500">
                      Published: {formatDate(release.published_at)}
                    </p>
                  </div>
                  
                  {release.assets.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              File
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Size
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Downloads
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {release.assets.map((asset) => (
                            <tr key={asset.id}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {asset.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {formatFileSize(asset.size)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {asset.download_count.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm space-x-2">
                                <a
                                  href={generateProxyUrl(asset.browser_download_url, baseUrl)}
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Proxy Download
                                </a>
                                <a
                                  href={asset.browser_download_url}
                                  className="text-gray-600 hover:text-gray-800 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Direct Download
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No assets in this release</p>
                  )}
                </div>
              ))
            )}
          </div>
        ))
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Usage Instructions</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
          <li>Add GitHub repository URLs to public/url.txt (one per line)</li>
          <li>Set GITHUB_TOKEN environment variable for higher rate limits</li>
          <li>Use /api/releases to get release information</li>
          <li>Use /api/proxy/[url] to download files through proxy</li>
          <li>Use /api/refresh to manually refresh cache</li>
        </ul>
      </div>
    </div>
  );
}