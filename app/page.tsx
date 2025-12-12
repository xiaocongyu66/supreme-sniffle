import FileList from '@/components/FileList';
import { readRepositoryUrls } from '@/lib/utils';

export default async function Home() {
  const urls = await readRepositoryUrls();
  
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            GitHub Releases Proxy
          </h1>
          <p className="mt-2 text-gray-600">
            Proxy for GitHub Releases with caching and rate limit management
          </p>
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <span>Tracking {urls.length} repositories</span>
            <span>•</span>
            <span>
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <FileList />
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">API Endpoints</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><code>/api/releases</code> - List all releases</li>
              <li><code>/api/releases?repo=owner/repo</code> - Specific repo</li>
              <li><code>/api/proxy/[url]</code> - Proxy download</li>
              <li><code>/api/refresh</code> - Refresh cache</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">Configuration</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><code>GITHUB_TOKEN</code>: GitHub API token</li>
              <li><code>CACHE_DURATION</code>: Cache TTL in seconds</li>
              <li><code>REFRESH_INTERVAL</code>: Auto-refresh interval</li>
              <li><code>API_KEY</code>: API authentication key</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">Deployment</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Vercel: Automatic with vercel.json</li>
              <li>Cloudflare: Use Pages with functions</li>
              <li>Custom: Set PORT and HOST env vars</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}