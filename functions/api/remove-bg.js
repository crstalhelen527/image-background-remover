/**
 * Cloudflare Pages Function for Remove.bg API
 * 路径: /api/remove-bg
 */

export async function onRequest(context) {
  const { request, env } = context;
  
  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  // 只处理 POST 请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed. Use POST.',
      timestamp: new Date().toISOString()
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Allow': 'POST, OPTIONS'
      }
    });
  }
  
  try {
    // 解析请求体
    const requestBody = await request.json();
    
    if (!requestBody.image) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required field: image',
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 获取 API 密钥
    const apiKey = env.REMOVEBG_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Remove.bg API key not configured',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    console.log('🔄 调用 Remove.bg API...');
    
    // 调用 Remove.bg API
    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'image/png',
        'User-Agent': 'QuickBG/1.0 (Cloudflare Pages)'
      },
      body: JSON.stringify({
        image_file_b64: requestBody.image,
        size: requestBody.size || 'auto',
        format: requestBody.format || 'png',
        bg_color: requestBody.bg_color,
        bg_image_file_b64: requestBody.bg_image_file_b64
      })
    });
    
    if (!removeBgResponse.ok) {
      // 处理 API 错误
      const errorText = await removeBgResponse.text();
      console.error('Remove.bg API 错误:', removeBgResponse.status, errorText);
      
      let errorMessage = 'Background removal failed';
      if (removeBgResponse.status === 402) {
        errorMessage = 'API credits exhausted (免费额度已用完)';
      } else if (removeBgResponse.status === 429) {
        errorMessage = 'Rate limit exceeded (请求频率过高)';
      } else if (removeBgResponse.status === 400) {
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errors && errorJson.errors[0]) {
            errorMessage = `API error: ${errorJson.errors[0].title || errorJson.errors[0].code}`;
          }
        } catch (e) {
          errorMessage = 'Invalid request (请求参数错误)';
        }
      }
      
      return new Response(JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        details: removeBgResponse.status === 400 ? errorText.substring(0, 200) : undefined
      }), {
        status: removeBgResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Remove.bg API 返回图片数据
    const imageBuffer = await removeBgResponse.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    
    // 从响应头获取信息
    const creditsCharged = removeBgResponse.headers.get('X-Credits-Charged') || '1';
    const width = removeBgResponse.headers.get('X-Width');
    const height = removeBgResponse.headers.get('X-Height');
    
    console.log('✅ Remove.bg API 调用成功');
    console.log(`   消耗额度: ${creditsCharged} 张`);
    
    // 返回成功响应
    return new Response(JSON.stringify({
      success: true,
      data: base64Image,
      credits_charged: parseInt(creditsCharged),
      width: width ? parseInt(width) : null,
      height: height ? parseInt(height) : null,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Credits-Charged': creditsCharged,
        'X-Width': width || '',
        'X-Height': height || ''
      }
    });
    
  } catch (error) {
    console.error('❌ 服务器错误:', error.message);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error: ' + error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}