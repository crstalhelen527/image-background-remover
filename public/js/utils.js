// 工具函数库
class ImageUtils {
    constructor() {
        this.imageData = null;
        this.originalImage = null;
        this.processedImage = null;
    }

    // 加载图片
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // 调整图片大小
    resizeImage(image, maxWidth = 800, maxHeight = 600) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let width = image.width;
            let height = image.height;
            
            // 计算缩放比例
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // 绘制缩放后的图片
            ctx.drawImage(image, 0, 0, width, height);
            
            resolve({
                canvas: canvas,
                width: width,
                height: height,
                imageData: ctx.getImageData(0, 0, width, height)
            });
        });
    }

    // 获取图片数据
    getImageData(canvas) {
        const ctx = canvas.getContext('2d');
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    // 设置图片数据
    setImageData(canvas, imageData) {
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
    }

    // 创建透明背景
    createTransparentBackground(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // 创建棋盘格透明背景
        const size = 20;
        for (let y = 0; y < height; y += size) {
            for (let x = 0; x < width; x += size) {
                const isGray = Math.floor(x / size + y / size) % 2 === 0;
                ctx.fillStyle = isGray ? '#f0f0f0' : '#ffffff';
                ctx.fillRect(x, y, size, size);
            }
        }
        
        return canvas;
    }

    // 计算颜色距离
    colorDistance(r1, g1, b1, r2, g2, b2) {
        return Math.sqrt(
            Math.pow(r1 - r2, 2) +
            Math.pow(g1 - g2, 2) +
            Math.pow(b1 - b2, 2)
        );
    }

    // 转换为灰度
    toGrayscale(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
        }
        return imageData;
    }

    // 边缘检测
    detectEdges(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const output = new ImageData(width, height);
        const outputData = output.data;
        
        // Sobel算子
        const kernelX = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        
        const kernelY = [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let sumX = 0;
                let sumY = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
                        const gray = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;
                        
                        sumX += gray * kernelX[ky + 1][kx + 1];
                        sumY += gray * kernelY[ky + 1][kx + 1];
                    }
                }
                
                const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
                const edgeValue = Math.min(255, magnitude);
                
                const outputIndex = (y * width + x) * 4;
                outputData[outputIndex] = edgeValue;
                outputData[outputIndex + 1] = edgeValue;
                outputData[outputIndex + 2] = edgeValue;
                outputData[outputIndex + 3] = 255;
            }
        }
        
        return output;
    }

    // 下载图片
    downloadImage(canvas, filename = 'background-removed.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // 复制到剪贴板
    copyToClipboard(canvas) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                const item = new ClipboardItem({ 'image/png': blob });
                navigator.clipboard.write([item])
                    .then(resolve)
                    .catch(reject);
            });
        });
    }

    // 格式转换
    convertFormat(canvas, format = 'png', quality = 0.92) {
        const mimeTypes = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'webp': 'image/webp'
        };
        
        const mimeType = mimeTypes[format] || 'image/png';
        return canvas.toDataURL(mimeType, format === 'jpg' ? quality : undefined);
    }
}

// 导出工具类
window.ImageUtils = ImageUtils;
