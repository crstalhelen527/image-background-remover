/**
 * End-to-end tests for QuickBG using Playwright
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

// Test image path
const TEST_IMAGE_PATH = path.join(__dirname, '../../assets/test-image.png');

test.describe('QuickBG End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load the application with correct title', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle('QuickBG - 快速图片背景去除工具');
    
    // Check header
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('.logo')).toContainText('QuickBG');
    await expect(page.locator('.tagline')).toContainText('快速去除图片背景');
  });

  test('should display all feature points', async ({ page }) => {
    const features = [
      '快速处理',
      '隐私保护', 
      '完全免费',
      '响应式设计',
      '边缘计算',
      '专业效果'
    ];
    
    for (const feature of features) {
      await expect(page.locator('.feature').filter({ hasText: feature })).toBeVisible();
    }
  });

  test('should have working upload section', async ({ page }) => {
    // Check upload section elements
    await expect(page.locator('.upload-section')).toBeVisible();
    await expect(page.locator('.drop-zone')).toBeVisible();
    await expect(page.locator('#fileInput')).toBeVisible();
    await expect(page.locator('.upload-btn')).toBeVisible();
    
    // Check upload button text
    await expect(page.locator('.upload-btn')).toContainText('选择图片');
  });

  test('should handle file upload via button click', async ({ page }) => {
    // Mock file chooser
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('.upload-btn').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(TEST_IMAGE_PATH);
    
    // Check that file was selected
    await expect(page.locator('.file-info')).toBeVisible({ timeout: 5000 });
  });

  test('should handle drag and drop file upload', async ({ page }) => {
    // Create a dummy file for drag and drop
    const dropZone = page.locator('.drop-zone');
    
    // Simulate drag and drop
    await dropZone.dispatchEvent('dragenter', { dataTransfer: { files: [TEST_IMAGE_PATH] } });
    await dropZone.dispatchEvent('dragover', { dataTransfer: { files: [TEST_IMAGE_PATH] } });
    await dropZone.dispatchEvent('drop', { dataTransfer: { files: [TEST_IMAGE_PATH] } });
    
    // Check that file was accepted
    await expect(page.locator('.file-info')).toBeVisible({ timeout: 5000 });
  });

  test('should validate file type and size', async ({ page }) => {
    // Test with invalid file type
    const invalidFile = path.join(__dirname, '../../assets/invalid-file.txt');
    
    // Mock file chooser for invalid file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('.upload-btn').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(invalidFile);
    
    // Check for error message
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.error-message')).toContainText('不支持的文件格式');
  });

  test('should display image preview after upload', async ({ page }) => {
    // Upload test image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('.upload-btn').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(TEST_IMAGE_PATH);
    
    // Check preview section
    await expect(page.locator('.preview-section')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#originalPreview')).toBeVisible();
    await expect(page.locator('.preview-title').filter({ hasText: '原始图片' })).toBeVisible();
  });

  test('should enable remove background button after image upload', async ({ page }) => {
    // Upload test image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('.upload-btn').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(TEST_IMAGE_PATH);
    
    // Wait for preview to load
    await page.waitForSelector('#originalPreview img', { timeout: 5000 });
    
    // Check that remove background button is enabled
    const removeBtn = page.locator('#removeBgBtn');
    await expect(removeBtn).toBeEnabled();
    await expect(removeBtn).toContainText('去除背景');
  });

  test('should show loading state during processing', async ({ page }) => {
    // Upload test image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('.upload-btn').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(TEST_IMAGE_PATH);
    
    // Wait for preview
    await page.waitForSelector('#originalPreview img', { timeout: 5000 });
    
    // Mock API response
    await page.route('**/api/remove-bg', async route => {
      // Simulate delay to show loading state
      await page.waitForTimeout(1000);
      
      const response = {
        success: true,
        data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        credits_charged: 1,
        width: 100,
        height: 100,
        timestamp: new Date().toISOString()
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
    
    // Click remove background button
    await page.locator('#removeBgBtn').click();
    
    // Check loading state
    await expect(page.locator('.loading')).toBeVisible({ timeout: 1000 });
    await expect(page.locator('.progress-bar')).toBeVisible();
  });

  test('should display result after background removal', async ({ page }) => {
    // Upload test image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('.upload-btn').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(TEST_IMAGE_PATH);
    
    // Wait for preview
    await page.waitForSelector('#originalPreview img', { timeout: 5000 });
    
    // Mock successful API response
    await page.route('**/api/remove-bg', async route => {
      const response = {
        success: true,
        data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        credits_charged: 1,
        width: 100,
        height: 100,
        timestamp: new Date().toISOString()
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
    
    // Click remove background button
    await page.locator('#removeBgBtn').click();
    
    // Wait for result
    await page.waitForSelector('#resultPreview img', { timeout: 10000 });
    
    // Check result preview
    await expect(page.locator('#resultPreview')).toBeVisible();
    await expect(page.locator('.preview-title').filter({ hasText: '处理结果' })).toBeVisible();
    
    // Check that download button is enabled
    const downloadBtn = page.locator('#downloadBtn');
    await expect(downloadBtn).toBeEnabled();
    await expect(downloadBtn).toContainText('下载PNG');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Upload test image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('.upload-btn').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(TEST_IMAGE_PATH);
    
    // Wait for preview
    await page.waitForSelector('#originalPreview img', { timeout: 5000 });
    
    // Mock API error response
    await page.route('**/api/remove-bg', async route => {
      const response = {
        success: false,
        error: 'API credits exhausted',
        timestamp: new Date().toISOString()
      };
      
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
    
    // Click remove background button
    await page.locator('#removeBgBtn').click();
    
    // Check error message
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.error-message')).toContainText('API credits exhausted');
  });

  test('should reset the application state', async ({ page }) => {
    // Upload test image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('.upload-btn').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(TEST_IMAGE_PATH);
    
    // Wait for preview
    await page.waitForSelector('#originalPreview img', { timeout: 5000 });
    
    // Click reset button
    await page.locator('#resetBtn').click();
    
    // Check that application is reset
    await expect(page.locator('.drop-zone')).toBeVisible();
    await expect(page.locator('#originalPreview')).toBeEmpty();
    await expect(page.locator('#resultPreview')).toBeEmpty();
    
    // Check that buttons are in default state
    await expect(page.locator('#removeBgBtn')).toBeDisabled();
    await expect(page.locator('#downloadBtn')).toBeDisabled();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.container')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.container')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.container')).toBeVisible();
    
    // Check that layout adapts
    const features = page.locator('.features');
    const desktopLayout = await features.evaluate(el => {
      return window.getComputedStyle(el).flexDirection;
    });
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // Allow layout to adjust
    
    const mobileLayout = await features.evaluate(el => {
      return window.getComputedStyle(el).flexDirection;
    });
    
    // Layout should adapt from row (desktop) to column (mobile)
    expect(desktopLayout).toBe('row');
    expect(mobileLayout).toBe('column');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check ARIA labels
    await expect(page.locator('#fileInput')).toHaveAttribute('aria-label', '选择图片文件');
    await expect(page.locator('#removeBgBtn')).toHaveAttribute('aria-label', '去除图片背景');
    await expect(page.locator('#downloadBtn')).toHaveAttribute('aria-label', '下载处理后的图片');
    await expect(page.locator('#resetBtn')).toHaveAttribute('aria-label', '重新开始');
    
    // Check alt text for images
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy(); // All images should have alt text
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Focus should move to interactive elements
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
    
    // Test enter key on buttons
    await page.locator('.upload-btn').focus();
    await page.keyboard.press('Enter');
    
    // Should open file dialog
    await expect(page.locator('input[type="file"]')).toBeFocused();
  });

  test('should maintain state after page refresh', async ({ page, context }) => {
    // Upload test image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('.upload-btn').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(TEST_IMAGE_PATH);
    
    // Wait for preview
    await page.waitForSelector('#originalPreview img', { timeout: 5000 });
    
    // Refresh page
    await page.reload();
    
    // State should be reset after refresh
    await expect(page.locator('.drop-zone')).toBeVisible();
    await expect(page.locator('#originalPreview')).toBeEmpty();
  });
});

test.describe('Browser Compatibility Tests', () => {
  test('should work in Chrome', async ({ browserName, page }) => {
    test.skip(browserName !== 'chromium', 'Chrome-specific test');
    
    await page.goto('/');
    await expect(page).toHaveTitle('QuickBG - 快速图片背景去除工具');
  });

  test('should work in Firefox', async ({ browserName, page }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');
    
    await page.goto('/');
    await expect(page).toHaveTitle('QuickBG - 快速图片背景去除工具');
  });

  test('should work in Safari', async ({ browserName, page }) => {
    test.skip(browserName !== 'webkit', 'Safari-specific test');
    
    await page.goto('/');
    await expect(page).toHaveTitle('QuickBG - 快速图片背景去除工具');
  });
});