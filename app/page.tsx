import FileList from '@/components/FileList';
import { getRepositoryUrls } from '@/lib/config';

export default async function Home() {
  // 获取仓库URL列表
  const urls = await getRepositoryUrls();
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题区域 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            GitHub Releases Proxy
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A proxy service for GitHub releases with caching, rate limit management, and remote configuration support
          </p>
          <div className="mt-4 inline-flex items-center space-x-4 text-sm text-gray-500">
            <span className="inline-flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Active • Tracking {urls.length} repositories
            </span>
            <span>•</span>
            <span>Updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* 主内容区域 */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <FileList initialUrls={urls} />
        </div>
        
        {/* 页脚信息 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              API Endpoints
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/releases</code> - All repositories</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/releases?repo=owner/repo</code> - Specific repo</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/refresh</code> - Refresh cache</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">GET /download/[url]</code> - Proxy download</li>
            </ul>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Configuration
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><strong>Remote Config:</strong> {process.env.CONFIG_URL ? 'Enabled' : 'Disabled'}</li>
              <li><strong>GitHub Token:</strong> {process.env.GITHUB_TOKEN ? 'Configured' : 'Not set'}</li>
              <li><strong>Cache Duration:</strong> {process.env.CACHE_DURATION || '3600'}s</li>
              <li><strong>Repositories:</strong> {urls.length} configured</li>
            </ul>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Deployment
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><strong>Platform:</strong> Cloudflare Pages</li>
              <li><strong>Framework:</strong> Next.js 14</li>
              <li><strong>Environment:</strong> Production</li>
              <li><strong>Build Status:</strong> ✅ Success</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}