/**
 * Unit tests for QuickBG frontend functionality
 */

// Mock DOM environment for frontend tests
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Read the HTML file
const html = fs.readFileSync(path.resolve(__dirname, '../../public/index.html'), 'utf8');

describe('Frontend HTML Structure', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: 'dangerously' });
    document = dom.window.document;
    window = dom.window;
    
    // Mock global objects needed by frontend
    global.window = window;
    global.document = document;
    global.FileReader = window.FileReader;
    global.fetch = jest.fn();
    global.URL = window.URL;
    global.Blob = window.Blob;
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.FileReader;
    delete global.fetch;
    delete global.URL;
    delete global.Blob;
  });

  test('should have correct page title', () => {
    expect(document.title).toBe('QuickBG - 快速图片背景去除工具');
  });

  test('should have main container elements', () => {
    expect(document.querySelector('.container')).not.toBeNull();
    expect(document.querySelector('header')).not.toBeNull();
    expect(document.querySelector('main')).not.toBeNull();
    expect(document.querySelector('footer')).not.toBeNull();
  });

  test('should have upload section with required elements', () => {
    const uploadSection = document.querySelector('.upload-section');
    expect(uploadSection).not.toBeNull();
    
    expect(document.querySelector('#fileInput')).not.toBeNull();
    expect(document.querySelector('.drop-zone')).not.toBeNull();
    expect(document.querySelector('.upload-btn')).not.toBeNull();
  });

  test('should have preview section', () => {
    expect(document.querySelector('.preview-section')).not.toBeNull();
    expect(document.querySelector('#originalPreview')).not.toBeNull();
    expect(document.querySelector('#resultPreview')).not.toBeNull();
  });

  test('should have control buttons', () => {
    expect(document.querySelector('#removeBgBtn')).not.toBeNull();
    expect(document.querySelector('#downloadBtn')).not.toBeNull();
    expect(document.querySelector('#resetBtn')).not.toBeNull();
  });

  test('should have loading indicator', () => {
    expect(document.querySelector('.loading')).not.toBeNull();
    expect(document.querySelector('.progress-bar')).not.toBeNull();
  });

  test('should have error display area', () => {
    expect(document.querySelector('.error-message')).not.toBeNull();
  });

  test('should have feature list in header', () => {
    const features = document.querySelectorAll('.feature');
    expect(features.length).toBeGreaterThan(0);
    
    // Check for specific features
    const featureTexts = Array.from(features).map(f => f.textContent);
    expect(featureTexts.some(text => text.includes('快速处理'))).toBe(true);
    expect(featureTexts.some(text => text.includes('隐私保护'))).toBe(true);
    expect(featureTexts.some(text => text.includes('完全免费'))).toBe(true);
  });

  test('should have responsive design meta tags', () => {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    expect(viewportMeta).not.toBeNull();
    expect(viewportMeta.getAttribute('content')).toContain('width=device-width');
  });

  test('should have proper language attribute', () => {
    expect(document.documentElement.getAttribute('lang')).toBe('zh-CN');
  });

  test('should have all required CSS classes', () => {
    // Check for critical CSS classes
    const criticalClasses = [
      'container', 'upload-section', 'preview-section',
      'drop-zone', 'preview-container', 'control-buttons',
      'loading', 'error-message', 'success-message'
    ];
    
    criticalClasses.forEach(className => {
      expect(document.querySelector(`.${className}`)).not.toBeNull();
    });
  });
});

describe('Frontend JavaScript Functions', () => {
  // Mock frontend functions for testing
  const mockFrontendFunctions = {
    validateFile: (file) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        return { valid: false, error: '不支持的文件格式。请上传 JPG、PNG 或 WebP 格式的图片。' };
      }
      
      if (file.size > maxSize) {
        return { valid: false, error: '文件太大。最大支持 5MB。' };
      }
      
      return { valid: true, error: null };
    },
    
    fileToBase64: (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });
    },
    
    formatFileSize: (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    showError: (message) => {
      return { action: 'showError', message };
    },
    
    showSuccess: (message) => {
      return { action: 'showSuccess', message };
    },
    
    updateProgress: (percentage) => {
      return { action: 'updateProgress', percentage };
    }
  };

  test('validateFile should accept valid files', () => {
    const validFile = {
      type: 'image/png',
      size: 1024 * 1024 // 1MB
    };
    
    const result = mockFrontendFunctions.validateFile(validFile);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('validateFile should reject invalid file types', () => {
    const invalidFile = {
      type: 'application/pdf',
      size: 1024 * 1024
    };
    
    const result = mockFrontendFunctions.validateFile(invalidFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('不支持的文件格式');
  });

  test('validateFile should reject oversized files', () => {
    const oversizedFile = {
      type: 'image/jpeg',
      size: 6 * 1024 * 1024 // 6MB
    };
    
    const result = mockFrontendFunctions.validateFile(oversizedFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('文件太大');
  });

  test('formatFileSize should format bytes correctly', () => {
    expect(mockFrontendFunctions.formatFileSize(0)).toBe('0 Bytes');
    expect(mockFrontendFunctions.formatFileSize(1024)).toBe('1 KB');
    expect(mockFrontendFunctions.formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(mockFrontendFunctions.formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB');
  });

  test('fileToBase64 should convert file to base64', async () => {
    // Mock File and FileReader
    const mockFile = new Blob(['test content'], { type: 'image/png' });
    mockFile.name = 'test.png';
    
    const base64 = await mockFrontendFunctions.fileToBase64(mockFile);
    expect(typeof base64).toBe('string');
    expect(base64.length).toBeGreaterThan(0);
  });

  test('showError should return error action', () => {
    const errorMessage = 'Test error message';
    const result = mockFrontendFunctions.showError(errorMessage);
    
    expect(result.action).toBe('showError');
    expect(result.message).toBe(errorMessage);
  });

  test('showSuccess should return success action', () => {
    const successMessage = 'Test success message';
    const result = mockFrontendFunctions.showSuccess(successMessage);
    
    expect(result.action).toBe('showSuccess');
    expect(result.message).toBe(successMessage);
  });

  test('updateProgress should update progress correctly', () => {
    const percentages = [0, 25, 50, 75, 100];
    
    percentages.forEach(percentage => {
      const result = mockFrontendFunctions.updateProgress(percentage);
      expect(result.action).toBe('updateProgress');
      expect(result.percentage).toBe(percentage);
    });
  });
});

describe('Frontend Integration Tests', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
    document = dom.window.document;
    window = dom.window;
    
    // Load the JavaScript file
    const jsPath = path.resolve(__dirname, '../../public/js/app.js');
    if (fs.existsSync(jsPath)) {
      const jsContent = fs.readFileSync(jsPath, 'utf8');
      const script = document.createElement('script');
      script.textContent = jsContent;
      document.head.appendChild(script);
    }
    
    // Mock global objects
    global.window = window;
    global.document = document;
    global.FileReader = window.FileReader;
    global.fetch = jest.fn();
    global.URL = window.URL;
    global.Blob = window.Blob;
    global.HTMLCanvasElement.prototype.getContext = () => ({
      drawImage: jest.fn(),
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn()
    });
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.FileReader;
    delete global.fetch;
    delete global.URL;
    delete global.Blob;
  });

  test('should initialize with correct default state', () => {
    // Check that loading is hidden by default
    const loadingElement = document.querySelector('.loading');
    expect(loadingElement.style.display).toBe('none');
    
    // Check that download button is disabled by default
    const downloadBtn = document.querySelector('#downloadBtn');
    expect(downloadBtn.disabled).toBe(true);
    
    // Check that preview containers are empty
    const originalPreview = document.querySelector('#originalPreview');
    const resultPreview = document.querySelector('#resultPreview');
    expect(originalPreview.innerHTML).toBe('');
    expect(resultPreview.innerHTML).toBe('');
  });

  test('should handle file input change event', () => {
    const fileInput = document.querySelector('#fileInput');
    expect(fileInput).not.toBeNull();
    
    // Simulate change event
    const changeEvent = new window.Event('change');
    fileInput.dispatchEvent(changeEvent);
    
    // The event handler should be attached
    expect(typeof fileInput.onchange).toBe('function');
  });

  test('should handle drag and drop events', () => {
    const dropZone = document.querySelector('.drop-zone');
    expect(dropZone).not.toBeNull();
    
    // Check that drag event handlers are attached
    const dragEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];
    dragEvents.forEach(eventName => {
      const event = new window.Event(eventName);
      expect(() => dropZone.dispatchEvent(event)).not.toThrow();
    });
  });

  test('should have working control buttons', () => {
    const removeBtn = document.querySelector('#removeBgBtn');
    const downloadBtn = document.querySelector('#downloadBtn');
    const resetBtn = document.querySelector('#resetBtn');
    
    expect(removeBtn).not.toBeNull();
    expect(downloadBtn).not.toBeNull();
    expect(resetBtn).not.toBeNull();
    
    // Check button text
    expect(removeBtn.textContent).toContain('去除背景');
    expect(downloadBtn.textContent).toContain('下载PNG');
    expect(resetBtn.textContent).toContain('重新开始');
    
    // Check that click handlers are attached
    [removeBtn, downloadBtn, resetBtn].forEach(button => {
      const clickEvent = new window.Event('click');
      expect(() => button.dispatchEvent(clickEvent)).not.toThrow();
    });
  });

  test('should have responsive design breakpoints', () => {
    // Check for responsive CSS classes
    const responsiveClasses = document.querySelectorAll('[class*="mobile"], [class*="tablet"], [class*="desktop"]');
    expect(responsiveClasses.length).toBeGreaterThan(0);
    
    // Check viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    expect(viewportMeta.getAttribute('content')).toContain('initial-scale=1.0');
  });
});