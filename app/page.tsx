import FileList from '@/components/FileList';
import { readRepositoryUrls } from '@/lib/server-utils';

export default async function Home() {
  // 在服务端读取url.txt，然后传递给客户端组件
  const urls = await readRepositoryUrls();
  
  return (
    <main className="min-h-screen py-8">
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
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        <FileList initialUrls={urls} />
      </div>
    </main>
  );
}