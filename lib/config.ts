// 简单的配置管理
export async function getRepositoryUrls(): Promise<string[]> {
  // 如果是构建时，返回默认值
  if (typeof window === 'undefined') {
    // 服务端：尝试读取环境变量或返回默认值
    const configUrl = process.env.CONFIG_URL;
    
    if (configUrl) {
      try {
        // 这里可以添加获取远程配置的逻辑
        console.log('Using remote config from:', configUrl);
        // 暂时返回默认值，实际实现需要fetch远程配置
        return getDefaultRepositories();
      } catch (error) {
        console.error('Failed to fetch remote config:', error);
        return getDefaultRepositories();
      }
    }
    
    // 没有远程配置，返回默认值
    return getDefaultRepositories();
  }
  
  // 客户端：无法获取配置，返回空数组
  return [];
}

function getDefaultRepositories(): string[] {
  return [
    'vercel/next.js',
    'tailwindlabs/tailwindcss',
    'nodejs/node',
    'microsoft/vscode',
    'facebook/react',
    'vuejs/vue'
  ];
}