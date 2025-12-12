import FileList from '@/components/FileList';
import { getRepositoryUrls } from '@/lib/config';

export default async function Home() {
  // 使用新的配置系统读取仓库URL
  const urls = await getRepositoryUrls();
  
  return (
    <main className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            GitHub Releases Proxy
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Proxy for GitHub Releases with caching, rate limit management, and remote configuration
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-700">Tracking <strong>{urls.length}</strong> repositories</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-gray-700">Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <FileList initialUrls={urls} />
        
        {/* 配置信息面板 */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Configuration Sources</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  Remote URL: {process.env.CONFIG_URL ? '✓ Configured' : 'Not set'}
                </li>
                <li className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                  Local file: <code className="ml-1 px-1 bg-gray-100 rounded">public/url.txt</code>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Current Repositories</h4>
              <div className="max-h-32 overflow-y-auto text-sm">
                {urls.map((url, index) => (
                  <div key={index} className="py-1 border-b border-gray-100 last:border-b-0">
                    <code className="text-gray-600 truncate block">{url}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}