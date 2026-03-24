/**
 * QuickBG Cloudflare Worker
 * 
 * This worker acts as a proxy between the frontend and Remove.bg API
 * All image processing is done by Remove.bg, we just forward requests
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS(request, env);
    }

    // Only allow POST requests for API endpoint
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { 'Allow': 'POST, OPTIONS' }
      });
    }

    // Parse the URL to determine the endpoint
    const url = new URL(request.url);
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'QuickBG Worker'
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...getCORSHeaders(env)
        }
      });
    }

    // Main API endpoint
    if (url.pathname === '/api/remove-bg') {
      return handleRemoveBackground(request, env, ctx);
    }

    // 404 for unknown endpoints
    return new Response('Not found', { status: 404 });
  }
};

/**
 * Handle CORS preflight requests
 */
function handleCORS(request, env) {
  return new Response(null, {
    headers: getCORSHeaders(env)
  });
}

/**
 * Get CORS headers based on environment
 */
function getCORSHeaders(env) {
  const allowedOrigins = env.ALLOWED_ORIGINS || '*';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigins,
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle background removal request
 */
async function handleRemoveBackground(request, env, ctx) {
  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return errorResponse('Invalid JSON in request body', 400, env);
    }

    // Validate required fields
    if (!requestBody.image) {
      return errorResponse('Missing required field: image', 400, env);
    }

    // Validate image data (basic check)
    const base64Image = requestBody.image;
    if (!isValidBase64(base64Image)) {
      return errorResponse('Invalid base64 image data', 400, env);
    }

    // Prepare request to Remove.bg API
    const removeBgResponse = await callRemoveBgAPI(base64Image, requestBody, env);

    if (!removeBgResponse.ok) {
      // Handle Remove.bg API errors
      const errorText = await removeBgResponse.text();
      console.error('Remove.bg API error:', removeBgResponse.status, errorText);
      
      let errorMessage = 'Background removal failed';
      if (removeBgResponse.status === 402) {
        errorMessage = 'API credits exhausted';
      } else if (removeBgResponse.status === 429) {
        errorMessage = 'Rate limit exceeded';
      }
      
      return errorResponse(errorMessage, removeBgResponse.status, env);
    }

    // Parse Remove.bg response
    const result = await removeBgResponse.json();

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      data: result.data.result_b64,
      credits_charged: result.data.credits_charged || 1,
      width: result.data.result_width,
      height: result.data.result_height,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(env)
      }
    });

  } catch (error) {
    console.error('Worker error:', error);
    
    return errorResponse(
      error.message || 'Internal server error',
      500,
      env
    );
  }
}

/**
 * Call Remove.bg API
 */
async function callRemoveBgAPI(base64Image, options, env) {
  const apiKey = env.REMOVEBG_API_KEY;
  
  if (!apiKey) {
    throw new Error('Remove.bg API key not configured');
  }

  const requestBody = {
    image_file_b64: base64Image,
    size: options.size || 'auto',
    format: options.format || 'png',
  };

  // Add optional parameters
  if (options.bg_color) {
    requestBody.bg_color = options.bg_color;
  }
  
  if (options.bg_image_file_b64) {
    requestBody.bg_image_file_b64 = options.bg_image_file_b64;
  }

  return fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'QuickBG/1.0'
    },
    body: JSON.stringify(requestBody)
  });
}

/**
 * Validate base64 string
 */
function isValidBase64(str) {
  if (typeof str !== 'string') return false;
  
  // Basic base64 validation
  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
  if (!base64Regex.test(str)) return false;
  
  // Check length (minimum reasonable size for an image)
  if (str.length < 100) return false;
  
  return true;
}

/**
 * Create error response
 */
function errorResponse(message, status = 500, env) {
  return new Response(JSON.stringify({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  }), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      ...getCORSHeaders(env)
    }
  });
}

/**
 * Rate limiting middleware (optional)
 */
async function checkRateLimit(request, env, ctx) {
  // Implement rate limiting if needed
  // Could use KV store or Durable Objects
  return true; // Allow all requests for now
}