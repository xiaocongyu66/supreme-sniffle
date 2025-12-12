export const dynamic = 'force-dynamic';

export async function GET() {
  // 返回最简单的硬编码数据，确保API能工作
  return Response.json({
    message: "API is working",
    repositories: [
      { repository: "vercel/next.js", releases: [], cached: true }
    ],
    timestamp: new Date().toISOString()
  });
}