import { useState, useCallback } from 'react';
import { Upload, Download, RefreshCw, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import './App.css';

function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);

  const handleUpload = useCallback(async (file) => {
    try {
      setError(null);
      
      // 验证图片
      if (!file || !file.type.startsWith('image/')) {
        setError('请上传有效的图片文件');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('文件太大，最大支持5MB');
        return;
      }
      
      setOriginalImage(file);
      setImageInfo({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      });
      
      // 开始处理
      setIsProcessing(true);
      
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 创建模拟的处理结果
      const mockImageUrl = `https://via.placeholder.com/400x300/3b82f6/ffffff?text=Processed+Image`;
      setProcessedImage({
        url: mockImageUrl,
        processedAt: new Date().toISOString(),
      });
      
    } catch (err) {
      console.error('处理错误:', err);
      setError(err.message || '处理失败，请重试');
      setProcessedImage(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDownload = useCallback(() => {
    if (!processedImage?.url) return;
    
    const link = document.createElement('a');
    link.href = processedImage.url;
    link.download = `background-removed-${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedImage]);

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
    setImageInfo(null);
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">🎨 Image Background Remover</h1>
                <p className="text-sm text-gray-600">Cloudflare部署 · Remove.bg API · 无存储架构</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                重新开始
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* 错误提示 */}
        {error && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">处理失败</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 成功提示 */}
        {processedImage && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">处理完成！</p>
                  <p className="text-green-700 text-sm mt-1">
                    背景已成功去除，可以下载透明背景PNG图片了。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-6xl mx-auto">
          {!originalImage ? (
            // 上传页面
            <div className="space-y-8">
              {/* Hero 区域 */}
              <div className="text-center py-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                  免费在线去除图片背景
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  使用 AI 技术快速去除图片背景，无需注册，保护隐私，处理完即删除。
                </p>
              </div>

              {/* 上传区域 */}
              <div 
                className="bg-white rounded-3xl shadow-hard p-12 text-center cursor-pointer transition-all duration-300 hover:shadow-xl border-3 border-dashed border-gray-300 hover:border-primary-400"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl">
                    <Upload className="w-12 h-12 text-primary-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      点击或拖放上传图片
                    </h3>
                    <p className="text-gray-600 text-lg">
                      支持 JPG、PNG、WebP 格式，最大 5MB
                    </p>
                  </div>
                  
                  <div className="inline-flex items-center space-x-4 bg-gray-100 px-6 py-3 rounded-full">
                    <span className="flex items-center space-x-2">
                      <span className="text-gray-700">📁</span>
                      <span className="text-gray-600 font-medium">支持格式</span>
                      <span className="text-gray-500">JPG, PNG, WebP</span>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center space-x-2">
                      <span className="text-gray-700">⚖️</span>
                      <span className="text-gray-600 font-medium">最大尺寸</span>
                      <span className="text-gray-500">5MB</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 特性展示 */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <div className="text-3xl mb-4">⚡</div>
                  <h3 className="font-bold text-gray-800 mb-2">快速处理</h3>
                  <p className="text-gray-600">AI 驱动，平均 3-5 秒完成处理</p>
                </div>
                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <div className="text-3xl mb-4">🔒</div>
                  <h3 className="font-bold text-gray-800 mb-2">隐私保护</h3>
                  <p className="text-gray-600">图片不存储服务器，处理完立即删除</p>
                </div>
                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <div className="text-3xl mb-4">🎯</div>
                  <h3 className="font-bold text-gray-800 mb-2">高质量</h3>
                  <p className="text-gray-600">使用 Remove.bg 专业 API，边缘清晰</p>
                </div>
              </div>
            </div>
          ) : isProcessing ? (
            // 处理中
            <div className="bg-white rounded-3xl shadow-hard p-12 text-center">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-24 h-24">
                  <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">正在处理中...</h2>
                  <p className="text-gray-600">
                    AI 正在智能识别并去除背景，请稍候 3-5 秒
                  </p>
                </div>
                
                <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 animate-progress"></div>
                </div>
              </div>
            </div>
          ) : processedImage ? (
            // 结果页面
            <div className="bg-white rounded-3xl shadow-hard p-8">
              <div className="space-y-8">
                {/* 结果头部 */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">处理完成</h2>
                    <p className="text-gray-600">背景已成功去除，可以下载结果了</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 inline mr-2" />
                      处理新图片
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-4 h-4 inline mr-2" />
                      下载 PNG
                    </button>
                  </div>
                </div>

                {/* 图片对比 */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* 原图 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">原图</h3>
                      <span className="text-sm text-gray-500">
                        {imageInfo && formatFileSize(imageInfo.size)}
                      </span>
                    </div>
                    <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                      <img
                        src={URL.createObjectURL(originalImage)}
                        alt="Original"
                        className="w-full h-auto rounded-lg max-h-96 object-contain"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>文件名: {imageInfo?.name}</p>
                      <p>格式: {imageInfo?.type?.split('/')[1]?.toUpperCase()}</p>
                    </div>
                  </div>

                  {/* 处理结果 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">处理结果</h3>
                      <span className="text-sm text-gray-500">透明背景 PNG</span>
                    </div>
                    <div className="border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={processedImage.url}
                        alt="Processed"
                        className="w-full h-auto rounded-lg max-h-96 object-contain"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>格式: PNG (透明背景)</p>
                      <p>处理时间: {new Date(processedImage.processedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={handleDownload}
                    className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-5 h-5 inline mr-2" />
                    下载透明背景 PNG
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-8 py-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5 inline mr-2" />
                    处理新图片
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // 预览页面
            <div className="bg-white rounded-3xl shadow-hard p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">图片预览</h2>
                    <p className="text-gray-600">确认图片后开始处理</p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    重新选择
                  </button>
                </div>

                <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                  <img
                    src={URL.createObjectURL(originalImage)}
                    alt="Preview"
                    className="w-full h-auto rounded-lg max-h-96 object-contain mx-auto"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800">文件信息</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>文件名: {imageInfo?.name}</p>
                      <p>大小: {imageInfo && formatFileSize(imageInfo.size)}</p>
                      <p>格式: {imageInfo?.type?.split('/')[1]?.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800">下一步</h4>
                    <p className="text-sm text-gray-600">
                      点击"开始处理"按钮，AI将自动识别并去除图片背景。
                      处理时间约3-5秒，请耐心等待。
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={() => handleUpload(originalImage)}
                    className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    disabled={isProcessing}
                  >
                    {isProcessing ? '处理中...' : '开始处理'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-8 py-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 页脚 */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            <p>使用 Remove.bg API 提供技术支持 · 部署于 Cloudflare Pages · 无存储架构</p>
            <p className="mt-2">
              © {new Date().get