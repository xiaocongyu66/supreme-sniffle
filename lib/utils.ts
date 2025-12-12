// 这是一个纯客户端工具函数库，不包含任何Node.js特定模块

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateProxyUrl(originalUrl: string, baseUrl: string): string {
  try {
    // 编码整个URL作为路径参数
    const encodedUrl = encodeURIComponent(originalUrl);
    return `${baseUrl}/api/proxy/${encodedUrl}`;
  } catch (error) {
    // 如果URL无效，返回原始URL
    return originalUrl;
  }
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}