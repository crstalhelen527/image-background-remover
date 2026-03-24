// UI交互管理
class UIManager {
    constructor() {
        this.utils = new ImageUtils();
        this.processor = new ImageProcessor();
        this.originalCanvas = document.getElementById('original-canvas');
        this.resultCanvas = document.getElementById('result-canvas');
        this.originalCtx = this.originalCanvas.getContext('2d');
        this.resultCtx = this.resultCanvas.getContext('2d');
        this.currentImage = null;
        this.processedImageData = null;
        
        this.initEventListeners();
        this.updateUIState();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 文件选择
        document.getElementById('select-file-btn').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // 拖放上传
        const uploadArea = document.getElementById('upload-area');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-dark)';
            uploadArea.style.background = 'var(--gray-100)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.background = 'var(--light-color)';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.background = 'var(--light-color)';
            
            if (e.dataTransfer.files.length > 0) {
                this.handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        // 处理按钮
        document.getElementById('process-btn').addEventListener('click', () => {
            this.processImage();
        });

        // 重置按钮
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.reset();
        });

        // 下载按钮
        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadImage();
        });

        // 复制按钮
        document.getElementById('copy-btn').addEventListener('click', () => {
            this.copyToClipboard();
        });

        // 模式切换
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateModeSettings(e.target.value);
            });
        });

        // 滑块事件
        document.getElementById('threshold-slider').addEventListener('input', (e) => {
            document.getElementById('threshold-value').textContent = e.target.value;
        });

        document.getElementById('smooth-slider').addEventListener('input', (e) => {
            document.getElementById('smooth-value').textContent = e.target.value;
        });

        // 工具按钮
        document.getElementById('brush-btn').addEventListener('click', () => {
            this.toggleBrushTool();
        });

        document.getElementById('eraser-btn').addEventListener('click', () => {
            this.toggleEraserTool();
        });

        document.getElementById('zoom-btn').addEventListener('click', () => {
            this.toggleZoom();
        });

        document.getElementById('crop-btn').addEventListener('click', () => {
            this.toggleCrop();
        });
    }

    // 处理文件选择
    async handleFileSelect(file) {
        if (!file || !file.type.match('image.*')) {
            this.showError('请选择图片文件 (JPG, PNG, WebP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.showError('文件大小不能超过5MB');
            return;
        }

        try {
            this.showLoading('正在加载图片...');
            
            // 加载图片
            const image = await this.utils.loadImage(file);
            
            // 调整大小
            const resized = await this.utils.resizeImage(image, 800, 600);
            
            // 保存当前图片
            this.currentImage = {
                image: image,
                canvas: resized.canvas,
                imageData: resized.imageData,
                width: resized.width,
                height: resized.height
            };

            // 显示原始图片
            this.showOriginalImage(resized.canvas);
            
            // 更新UI状态
            this.updateUIState();
            
            this.hideLoading();
            
        } catch (error) {
            this.showError('图片加载失败: ' + error.message);
            console.error(error);
        }
    }

    // 显示原始图片
    showOriginalImage(canvas) {
        const placeholder = document.getElementById('original-placeholder');
        placeholder.style.display = 'none';
        
        this.originalCanvas.width = canvas.width;
        this.originalCanvas.height = canvas.height;
        this.originalCtx.drawImage(canvas, 0, 0);
        this.originalCanvas.style.display = 'block';
    }

    // 显示处理结果
    showResultImage(imageData) {
        const placeholder = document.getElementById('result-placeholder');
        placeholder.style.display = 'none';
        
        this.resultCanvas.width = imageData.width;
        this.resultCanvas.height = imageData.height;
        this.resultCtx.putImageData(imageData, 0, 0);
        this.resultCanvas.style.display = 'block';
        
        // 保存处理结果
        this.processedImageData = imageData;
    }

    // 处理图片
    async processImage() {
        if (!this.currentImage) {
            this.showError('请先上传图片');
            return;
        }

        try {
            this.showProgress('正在去除背景...', 0);
            
            const mode = document.querySelector('input[name="mode"]:checked').value;
            const threshold = parseInt(document.getElementById('threshold-slider').value);
            
            // 更新进度
            this.updateProgress(30);
            
            // 处理图片
            const result = await this.processor.processImage(
                this.currentImage.imageData,
                mode,
                threshold
            );
            
            // 更新进度
            this.updateProgress(80);
            
            // 显示结果
            this.showResultImage(result);
            
            // 完成
            this.updateProgress(100);
            setTimeout(() => {
                this.hideProgress();
                this.updateUIState();
            }, 500);
            
        } catch (error) {
            this.showError('处理失败: ' + error.message);
            console.error(error);
            this.hideProgress();
        }
    }

    // 下载图片
    downloadImage() {
        if (!this.processedImageData) {
            this.showError('没有可下载的图片');
            return;
        }

        const format = document.querySelector('input[name="format"]:checked').value;
        const filename = `background-removed.${format}`;
        
        // 创建临时canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.processedImageData.width;
        tempCanvas.height = this.processedImageData.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 设置背景
        if (format === 'jpg') {
            tempCtx.fillStyle = 'white';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        
        // 绘制处理后的图片
        tempCtx.putImageData(this.processedImageData, 0, 0);
        
        // 下载
        this.utils.downloadImage(tempCanvas, filename);
    }

    // 复制到剪贴板
    async copyToClipboard() {
        if (!this.processedImageData) {
            this.showError('没有可复制的图片');
            return;
        }

        try {
            this.showLoading('正在复制到剪贴板...');
            
            // 创建临时canvas
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.processedImageData.width;
            tempCanvas.height = this.processedImageData.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(this.processedImageData, 0, 0);
            
            // 复制
            await this.utils.copyToClipboard(tempCanvas);
            
            this.showSuccess('已复制到剪贴板！');
            
        } catch (error) {
            this.showError('复制失败: ' + error.message);
            console.error(error);
        } finally {
            this.hideLoading();
        }
    }

    // 重置
    reset() {
        this.currentImage = null;
        this.processedImageData = null;
        
        // 隐藏canvas，显示占位符
        document.getElementById('original-placeholder').style.display = 'flex';
        document.getElementById('result-placeholder').style.display = 'flex';
        this.originalCanvas.style.display = 'none';
        this.resultCanvas.style.display = 'none';
        
        // 重置文件输入
        document.getElementById('file-input').value = '';
        
        // 更新UI状态
        this.updateUIState();
    }

    // 更新模式设置
    updateModeSettings(mode) {
        const thresholdGroup = document.getElementById('color-threshold-group');
        
        if (mode === 'color') {
            thresholdGroup.style.display = 'block';
        } else {
            thresholdGroup.style.display = 'none';
        }
    }

    // 更新UI状态
    updateUIState() {
        const hasImage = !!this.currentImage;
        const hasResult = !!this.processedImageData;
        
        // 处理按钮
        const processBtn = document.getElementById('process-btn');
        processBtn.disabled = !hasImage;
        
        // 下载按钮
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.disabled = !hasResult;
        
        // 复制按钮
        const copyBtn = document.getElementById('copy-btn');
        copyBtn.disabled = !hasResult;
        
        // 工具按钮
        const toolBtns = ['brush-btn', 'eraser-btn', 'crop-btn'];
        toolBtns.forEach(id => {
            const btn = document.getElementById(id);
            btn.disabled = !hasImage;
        });
    }

    // 工具方法
    toggleBrushTool() {
        // 实现画笔
