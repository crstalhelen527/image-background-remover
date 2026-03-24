/**
 * Unit tests for QuickBG Worker
 */

const { isValidBase64, errorResponse } = require('../../worker/index.js');

// Mock the worker module for testing
jest.mock('../../worker/index.js', () => {
  const originalModule = jest.requireActual('../../worker/index.js');
  return {
    ...originalModule,
    callRemoveBgAPI: jest.fn(),
  };
});

describe('Worker Utility Functions', () => {
  describe('isValidBase64', () => {
    test('should return true for valid base64 strings', () => {
      const validBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      expect(isValidBase64(validBase64)).toBe(true);
    });

    test('should return false for invalid base64 strings', () => {
      expect(isValidBase64('not-base64!@#$')).toBe(false);
      expect(isValidBase64('')).toBe(false);
      expect(isValidBase64('abc')).toBe(false); // Too short
      expect(isValidBase64(null)).toBe(false);
      expect(isValidBase64(undefined)).toBe(false);
      expect(isValidBase64(123)).toBe(false);
    });

    test('should return false for strings with invalid characters', () => {
      expect(isValidBase64('abc!@#')).toBe(false);
      expect(isValidBase64('abc def')).toBe(false);
    });
  });

  describe('errorResponse', () => {
    test('should create error response with correct structure', () => {
      const message = 'Test error message';
      const status = 400;
      const env = { ALLOWED_ORIGINS: '*' };
      
      const response = errorResponse(message, status, env);
      const body = JSON.parse(response.body);
      
      expect(response.status).toBe(status);
      expect(body.success).toBe(false);
      expect(body.error).toBe(message);
      expect(body.timestamp).toBeDefined();
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    test('should use default status 500 when not provided', () => {
      const response = errorResponse('Error', undefined, {});
      expect(response.status).toBe(500);
    });
  });
});

describe('Worker Request Handling', () => {
  let worker;
  let env;
  let ctx;

  beforeEach(() => {
    worker = require('../../worker/index.js').default;
    env = {
      REMOVEBG_API_KEY: 'test-api-key',
      ALLOWED_ORIGINS: 'http://localhost:3000'
    };
    ctx = {
      waitUntil: jest.fn()
    };
  });

  test('should handle OPTIONS request for CORS', async () => {
    const request = new Request('https://example.com/api/remove-bg', {
      method: 'OPTIONS'
    });

    const response = await worker.fetch(request, env, ctx);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(env.ALLOWED_ORIGINS);
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  test('should reject non-POST requests to API endpoint', async () => {
    const methods = ['GET', 'PUT', 'DELETE', 'PATCH'];
    
    for (const method of methods) {
      const request = new Request('https://example.com/api/remove-bg', {
        method
      });

      const response = await worker.fetch(request, env, ctx);
      
      expect(response.status).toBe(405);
      expect(response.headers.get('Allow')).toBe('POST, OPTIONS');
    }
  });

  test('should return 404 for unknown endpoints', async () => {
    const request = new Request('https://example.com/unknown', {
      method: 'GET'
    });

    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(404);
  });

  test('should handle health check endpoint', async () => {
    const request = new Request('https://example.com/health', {
      method: 'GET'
    });

    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('QuickBG Worker');
    expect(body.timestamp).toBeDefined();
  });
});

describe('API Endpoint Tests', () => {
  let worker;
  let env;
  let ctx;

  beforeEach(() => {
    worker = require('../../worker/index.js').default;
    env = {
      REMOVEBG_API_KEY: 'test-api-key',
      ALLOWED_ORIGINS: 'http://localhost:3000'
    };
    ctx = {
      waitUntil: jest.fn()
    };
    
    // Mock fetch for Remove.bg API calls
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should reject request without image data', async () => {
    const request = new Request('https://example.com/api/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(400);
    
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Missing required field: image');
  });

  test('should reject request with invalid JSON', async () => {
    const request = new Request('https://example.com/api/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });

    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(400);
    
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Invalid JSON');
  });

  test('should reject request with invalid base64 image', async () => {
    const request = new Request('https://example.com/api/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: 'invalid' })
    });

    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(400);
    
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Invalid base64 image data');
  });

  test('should handle Remove.bg API errors', async () => {
    const validBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    // Mock failed API response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 402,
      text: () => Promise.resolve('Credits exhausted')
    });

    const request = new Request('https://example.com/api/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: validBase64 })
    });

    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(402);
    
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('API credits exhausted');
  });

  test('should handle successful Remove.bg API response', async () => {
    const validBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const mockResult = {
      data: {
        result_b64: 'processed_base64_string',
        credits_charged: 1,
        result_width: 100,
        result_height: 100
      }
    };

    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResult)
    });

    const request = new Request('https://example.com/api/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        image: validBase64,
        format: 'png',
        size: 'auto'
      })
    });

    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBe(mockResult.data.result_b64);
    expect(body.credits_charged).toBe(1);
    expect(body.width).toBe(100);
    expect(body.height).toBe(100);
    expect(body.timestamp).toBeDefined();
  });

  test('should handle internal server errors', async () => {
    const validBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    // Mock fetch to throw an error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const request = new Request('https://example.com/api/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: validBase64 })
    });

    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(500);
    
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });
});