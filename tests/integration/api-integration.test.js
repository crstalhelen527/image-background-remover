/**
 * Integration tests for QuickBG API
 */

const { createServer } = require('http');
const { parse } = require('url');
const worker = require('../../worker/index.js').default;

// Mock environment
const mockEnv = {
  REMOVEBG_API_KEY: 'test-api-key-123',
  ALLOWED_ORIGINS: 'http://localhost:3000'
};

// Mock context
const mockCtx = {
  waitUntil: (promise) => promise
};

// Test server setup
let server;
let serverUrl;

beforeAll(() => {
  return new Promise((resolve) => {
    server = createServer(async (req, res) => {
      try {
        const url = parse(req.url);
        const headers = {};
        
        // Convert Node.js request to Fetch API Request
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          const requestInit = {
            method: req.method,
            headers: headers,
            body: body || null
          };
          
          // Copy headers
          for (const [key, value] of Object.entries(req.headers)) {
            if (value) {
              headers[key.toLowerCase()] = value;
            }
          }
          
          const request = new Request(`http://localhost${url.pathname}${url.search || ''}`, requestInit);
          
          try {
            const response = await worker.fetch(request, mockEnv, mockCtx);
            
            // Convert Fetch Response to Node.js response
            res.statusCode = response.status;
            
            // Copy headers
            response.headers.forEach((value, key) => {
              res.setHeader(key, value);
            });
            
            const responseBody = await response.text();
            res.end(responseBody);
          } catch (error) {
            console.error('Worker error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({
              success: false,
              error: 'Internal server error',
              timestamp: new Date().toISOString()
            }));
          }
        });
      } catch (error) {
        console.error('Server error:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({
          success: false,
          error: 'Server error',
          timestamp: new Date().toISOString()
        }));
      }
    });
    
    server.listen(0, () => {
      const port = server.address().port;
      serverUrl = `http://localhost:${port}`;
      console.log(`Test server listening on ${serverUrl}`);
      resolve();
    });
  });
});

afterAll(() => {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log('Test server closed');
        resolve();
      });
    } else {
      resolve();
    }
  });
});

describe('API Integration Tests', () => {
  test('GET /health should return health status', async () => {
    const response = await fetch(`${serverUrl}/health`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('QuickBG Worker');
    expect(data.timestamp).toBeDefined();
  });

  test('OPTIONS /api/remove-bg should return CORS headers', async () => {
    const response = await fetch(`${serverUrl}/api/remove-bg`, {
      method: 'OPTIONS'
    });
    
    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe(mockEnv.ALLOWED_ORIGINS);
    expect(response.headers.get('access-control-allow-methods')).toContain('POST');
  });

  test('GET /api/remove-bg should return 405 Method Not Allowed', async () => {
    const response = await fetch(`${serverUrl}/api/remove-bg`, {
      method: 'GET'
    });
    
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST, OPTIONS');
  });

  test('POST /api/remove-bg without body should return 400', async () => {
    const response = await fetch(`${serverUrl}/api/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid JSON');
  });

  test('POST /api/remove-bg with invalid JSON should return 400', async () => {
    const response = await fetch(`${serverUrl}/api/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid JSON');
  });

  test('POST /api/remove-bg without image should return 400', async () => {
    const response = await fetch(`${serverUrl}/api/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: 'png' })
    });
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Missing required field: image');
  });

  test('POST /api/remove-bg with invalid base64 should return 400', async () => {
    const response = await fetch(`${serverUrl}/api/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: 'invalid-base64' })
    });
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid base64 image data');
  });

  test('Unknown endpoint should return 404', async () => {
    const response = await fetch(`${serverUrl}/unknown-endpoint`);
    expect(response.status).toBe(404);
  });

  test('CORS headers should be present on all responses', async () => {
    const endpoints = ['/health', '/api/remove-bg', '/unknown'];
    const methods = ['GET', 'POST', 'OPTIONS'];
    
    for (const endpoint of endpoints) {
      for (const method of methods) {
        if (endpoint === '/api/remove-bg' && method === 'POST') {
          // Skip POST to /api/remove-bg without body
          continue;
        }
        
        const response = await fetch(`${serverUrl}${endpoint}`, {
          method,
          headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
          body: method === 'POST' ? JSON.stringify({}) : undefined
        }).catch(() => null);
        
        if (response) {
          expect(response.headers.get('access-control-allow-origin')).toBe(mockEnv.ALLOWED_ORIGINS);
        }
      }
    }
  });
});

describe('End-to-End Workflow Tests', () => {
  // Mock Remove.bg API response
  const mockRemoveBgResponse = {
    data: {
      result_b64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      credits_charged: 1,
      result_width: 100,
      result_height: 100
    }
  };

  // Valid test image (small PNG)
  const validTestImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn();
  });

  test('Complete image processing workflow', async () => {
    // Mock successful Remove.bg API call
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRemoveBgResponse
    });

    const response = await fetch(`${serverUrl}/api/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: validTestImage,
        format: 'png',
        size: 'auto'
      })
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBe(mockRemoveBgResponse.data.result_b64);
    expect(data.credits_charged).toBe(1);
    expect(data.width).toBe(100);
    expect(data.height).toBe(100);
    expect(data.timestamp).toBeDefined();
    
    // Verify Remove.bg API was called with correct parameters
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [apiUrl, apiOptions] = global.fetch.mock.calls[0];
    expect(apiUrl).toBe('https://api.remove.bg/v1.0/removebg');
    expect(apiOptions.headers['X-Api-Key']).toBe(mockEnv.REMOVEBG_API_KEY);
    
    const apiBody = JSON.parse(apiOptions.body);
    expect(apiBody.image_file_b64).toBe(validTestImage);
    expect(apiBody.format).toBe('png');
    expect(apiBody.size).toBe('auto');
  });

  test('Workflow with background color option', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRemoveBgResponse
    });

    const response = await fetch(`${serverUrl}/api/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: validTestImage,
        format: 'png',
        size: 'auto',
        bg_color: '#FF0000'
      })
    });

    expect(response.status).toBe(200);
    
    // Verify Remove.bg API was called with background color
    const [, apiOptions] = global.fetch.mock.calls[0];
    const apiBody = JSON.parse(apiOptions.body);
    expect(apiBody.bg_color).toBe('#FF0000');
  });

  test('Workflow with background image option', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRemoveBgResponse
    });

    const bgImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const response = await fetch(`${serverUrl}/api/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: validTestImage,
        format: 'png',
        size: 'auto',
        bg_image_file_b64: bgImage
      })
    });

    expect(response.status).toBe(200);
    
    // Verify Remove.bg API was called with background image
    const [, apiOptions] = global.fetch.mock.calls[0];
    const apiBody = JSON.parse(apiOptions.body);
    expect(apiBody.bg_image_file_b64).toBe(bgImage);
  });

  test('Workflow error handling - API credits exhausted', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 402,
      text: async () => '{"error": "Insufficient credits"}'
    });

    const response = await fetch(`${serverUrl}/api/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: validTestImage
      })
    });

    expect(response.status).toBe(402);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('API credits exhausted');
  });

  test('Workflow error handling - rate limit exceeded', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => '{"error": "Rate limit exceeded"}'
    });

    const response = await fetch(`${serverUrl}/api/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: validTestImage
      })
    });

    expect(response.status).toBe(429);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Rate limit exceeded');
  });

  test('Workflow error handling - Remove.bg API error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal server error'
    });

    const response = await fetch(`${serverUrl}/api/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: validTestImage
      })
    });

    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Background removal failed');
  });

  test('Workflow error handling - network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const response = await fetch(`${serverUrl}/api/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: validTestImage
      })
    });

    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });
});

describe('Performance Tests', () => {
  const validTestImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          result_b64: validTestImage,
          credits_charged: 1,
          result_width: 100,
          result_height: 100
        }
      })
    });
  });

  test('API response time should be reasonable', async () => {
    const startTime = Date.now();
    
    const response = await fetch(`${serverUrl}/api/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: validTestImage })
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    
    console.log(`API response time: ${responseTime}ms`);
  });

  test('Health endpoint should be fast', async () => {
    const startTime = Date.now();
    
    const response = await fetch(`${serverUrl}/health`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(100); // Should respond within 100ms
    
    console.log(`Health endpoint response time: ${responseTime}ms`);
  });

  test('Concurrent requests should be handled properly', async () => {
    const concurrentRequests = 5;
    const requests = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      requests.push(
        fetch(`${serverUrl}/health`).then(res => res.json())
      );
    }
    
    const startTime = Date.now();
    const results = await Promise.all(requests);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    expect(results.length).toBe(concurrentRequests);
    results.forEach(result => {
      expect(result.status).toBe('ok');
    });
    
    console.log(`Handled ${concurrentRequests} concurrent requests in ${totalTime}ms`);
    expect(totalTime).toBeLessThan(1000); // Should handle within 1 second
  });
});