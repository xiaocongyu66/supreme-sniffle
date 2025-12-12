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

interface FileListProps {
  initialUrls: string[];
}

export default function FileList({ initialUrls }: FileListProps) {
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
        throw new Error(`Failed to fetch releases: ${response.status}`);
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
      const response = await fetch('/api/refresh');
      if (response.ok) {
        fetchData();
      } else {
        throw new Error('Failed to refresh cache');
      }
    } catch (err) {
      setError('Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading releases...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error: {error}</p>
        <button
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">GitHub Releases</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Refreshing...' : 'Refresh Cache'}
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No releases found</p>
          <p className="text-sm text-gray-400 mt-2">
            Add GitHub repository URLs to public/url.txt or wait for cache to populate
          </p>
        </div>
      ) : (
        data.map((repoData) => (
          <div key={repoData.repository} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {repoData.repository}
                </h3>
                <div className="flex items-center space-x-2">
                  {repoData.cached && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Cached
                    </span>
                  )}
                  {repoData.error && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      Error
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {repoData.releases.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No releases found for this repository
              </div>
            ) : (
              repoData.releases.map((release) => (
                <div key={release.id} className="p-6 border-b last:border-b-0 bg-white">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900">
                      {release.name || release.tag_name}
                    </h4>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {release.tag_name}
                      </span>
                      <span className="mx-2">•</span>
                      <span>Published: {formatDate(release.published_at)}</span>
                    </div>
                  </div>
                  
                  {release.assets.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
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
                            <tr key={asset.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {asset.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {formatFileSize(asset.size)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {asset.download_count.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm space-x-3">
                                <a
                                  href={generateProxyUrl(asset.browser_download_url, baseUrl)}
                                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
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
                                  Direct
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
    </div>
  );
}