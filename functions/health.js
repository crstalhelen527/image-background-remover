/**
 * 健康检查端点
 * 路径: /health
 */

export async function onRequest(context) {
  const { env } = context;
  
  const isApiKeyConfigured = !!env.REMOVEBG_API_KEY;
  
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'QuickBG Cloudflare Pages',
    timestamp: new Date().toISOString(),
    api_key_configured: isApiKeyConfigured,
    api_key_prefix: isApiKeyConfigured ? env.REMOVEBG_API_KEY.substring(0, 10) : null,
    environment: env.NODE_ENV || 'production',
    features: ['remove-bg-api', 'static-hosting', 'edge-compute']
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}