/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 环境变量必须为字符串类型
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
    REFRESH_INTERVAL: process.env.REFRESH_INTERVAL || '3600000',
  },
  
  // 代理下载的URL重写规则
  async rewrites() {
    return [
      {
        source: '/download/:path*',
        destination: '/api/proxy/:path*',
      },
    ];
  },
  
  // CORS 头设置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        source: '/download/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
  
  // 禁用严格模式以便在Cloudflare上运行
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;