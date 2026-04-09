// Cloudflare Worker 处理 Remove.bg API 调用

export default {
  async fetch(request, env, ctx) {
    // 设置 CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    
    // 处理 Remove.bg API 调用
    if (url.pathname === '/api/remove-bg' && request.method === 'POST') {
      return handleRemoveBg(request, env, corsHeaders);
    }
    
    // 处理健康检查
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'image-background-remover-api',
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }
    
    // 默认返回 404
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders,
    });
  },
};

// 处理 Remove.bg API 调用
async function handleRemoveBg(request, env, corsHeaders) {
  try {
    // 验证请求
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return new Response('Invalid content type', {
        status: 400,
        headers: corsHeaders,
      });
    }
    
    // 获取图片文件
    const formData = await request.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile || !(imageFile instanceof File)) {
      return new Response('No valid image provided', {
        status: 400,
        headers: corsHeaders,
      });
    }
    
    // 验证文件大小 (5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return new Response('File too large (max 5MB)', {
        status: 413,
        headers: corsHeaders,
      });
    }
    
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(imageFile.type)) {
      return new Response('Invalid file type. Supported: JPG, PNG, WebP', {
        status: 400,
        headers: corsHeaders,
      });
    }
    
    console.log('Processing image:', imageFile.name, imageFile.size, imageFile.type);
    
    // 准备 Remove.bg API 请求
    const removeBgFormData = new FormData();
    removeBgFormData.append('image_file', imageFile);
    removeBgFormData.append('size', 'auto');
    removeBgFormData.append('format', 'png');
    
    // 调用 Remove.bg API
    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': env.REMOVE_BG_API_KEY,
      },
      body: removeBgFormData,
    });
    
    // 检查 Remove.bg 响应
    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      console.error('Remove.bg API error:', removeBgResponse.status, errorText);
      
      let errorMessage = 'Background removal failed';
      if (removeBgResponse.status === 400) {
        errorMessage = 'Invalid image or unsupported format';
      } else if (removeBgResponse.status === 402) {
        errorMessage = 'API credits exhausted';
      } else if (removeBgResponse.status === 429) {
        errorMessage = 'Rate limit exceeded';
      }
      
      return new Response(JSON.stringify({
        error: errorMessage,
        details: errorText,
      }), {
        status: removeBgResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }
    
    // 获取处理结果
    const resultBlob = await removeBgResponse.blob();
    
    if (!resultBlob || resultBlob.size === 0) {
      return new Response('Empty result from Remove.bg', {
        status: 500,
        headers: corsHeaders,
      });
    }
    
    console.log('Successfully processed image, result size:', resultBlob.size);
    
    // 返回处理结果
    return new Response(resultBlob, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="background-removed.png"',
        'X-Processed-By': 'image-background-remover',
        'X-Original-Size': imageFile.size.toString(),
        'X-Result-Size': resultBlob.size.toString(),
      },
    });
    
  } catch (error) {
    console.error('Worker error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
}