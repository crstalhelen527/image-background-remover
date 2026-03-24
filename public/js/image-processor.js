// 图片背景去除处理器
class ImageProcessor {
    constructor() {
        this.utils = new ImageUtils();
        this.worker = null;
        this.isProcessing = false;
    }

    // 初始化Web Worker
    initWorker() {
        if (typeof Worker !== 'undefined' && !this.worker) {
            const workerCode = `
                self.onmessage = function(e) {
                    const { imageData, method, threshold } = e.data;
                    const result = self.processImage(imageData, method, threshold);
                    self.postMessage(result);
                };

                self.processImage = function(imageData, method, threshold) {
                    const data = imageData.data;
                    const width = imageData.width;
                    const height = imageData.height;
                    
                    // 创建输出图像数据
                    const output = new ImageData(width, height);
                    const outputData = output.data;
                    
                    if (method === 'color') {
                        // 基于颜色的背景去除
                        const bgColor = self.detectBackgroundColor(imageData);
                        const thresholdValue = threshold || 30;
                        
                        for (let i = 0; i < data.length; i += 4) {
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];
                            const a = data[i + 3];
                            
                            // 计算与背景色的距离
                            const distance = Math.sqrt(
                                Math.pow(r - bgColor.r, 2) +
                                Math.pow(g - bgColor.g, 2) +
                                Math.pow(b - bgColor.b, 2)
                            );
                            
                            if (distance < thresholdValue) {
                                // 背景：设置为透明
                                outputData[i] = 0;
                                outputData[i + 1] = 0;
                                outputData[i + 2] = 0;
                                outputData[i + 3] = 0;
                            } else {
                                // 前景：保留原色
                                outputData[i] = r;
                                outputData[i + 1] = g;
                                outputData[i + 2] = b;
                                outputData[i + 3] = a;
                            }
                        }
                    } else if (method === 'edge') {
                        // 基于边缘检测
                        const edges = self.detectEdges(imageData);
                        const edgeData = edges.data;
                        
                        for (let i = 0; i < data.length; i += 4) {
                            const edgeValue = edgeData[i];
                            
                            if (edgeValue < 50) {
                                // 非边缘区域：可能是背景
                                outputData[i] = 0;
                                outputData[i + 1] = 0;
                                outputData[i + 2] = 0;
                                outputData[i + 3] = 0;
                            } else {
                                // 边缘区域：保留
                                outputData[i] = data[i];
                                outputData[i + 1] = data[i + 1];
                                outputData[i + 2] = data[i + 2];
                                outputData[i + 3] = data[i + 3];
                            }
                        }
                    }
                    
                    return output;
                };

                self.detectBackgroundColor = function(imageData) {
                    const data = imageData.data;
                    const corners = [
                        [0, 0],  // 左上角
                        [imageData.width - 1, 0],  // 右上角
                        [0, imageData.height - 1],  // 左下角
                        [imageData.width - 1, imageData.height - 1]  // 右下角
                    ];
                    
                    let totalR = 0, totalG = 0, totalB = 0;
                    
                    for (const [x, y] of corners) {
                        const index = (y * imageData.width + x) * 4;
                        totalR += data[index];
                        totalG += data[index + 1];
                        totalB += data[index + 2];
                    }
                    
                    return {
                        r: Math.floor(totalR / corners.length),
                        g: Math.floor(totalG / corners.length),
                        b: Math.floor(totalB / corners.length)
                    };
                };

                self.detectEdges = function(imageData) {
                    const width = imageData.width;
                    const height = imageData.height;
                    const data = imageData.data;
                    const output = new ImageData(width, height);
                    const outputData = output.data;
                    
                    // 简单的边缘检测
                    for (let y = 1; y < height - 1; y++) {
                        for (let x = 1; x < width - 1; x++) {
                            const centerIndex = (y * width + x) * 4;
                            const centerGray = (data[centerIndex] + data[centerIndex + 1] + data[centerIndex + 2]) / 3;
                            
                            let maxDiff = 0;
                            
                            // 检查周围像素
                            for (let dy = -1; dy <= 1; dy++) {
                                for (let dx = -1; dx <= 1; dx++) {
                                    if (dx === 0 && dy === 0) continue;
                                    
                                    const neighborIndex = ((y + dy) * width + (x + dx)) * 4;
                                    const neighborGray = (data[neighborIndex] + data[neighborIndex + 1] + data[neighborIndex + 2]) / 3;
                                    
                                    const diff = Math.abs(centerGray - neighborGray);
                                    if (diff > maxDiff) {
                                        maxDiff = diff;
                                    }
                                }
                            }
                            
                            const edgeValue = Math.min(255, maxDiff * 10);
                            const outputIndex = (y * width + x) * 4;
                            outputData[outputIndex] = edgeValue;
                            outputData[outputIndex + 1] = edgeValue;
                            outputData[outputIndex + 2] = edgeValue;
                            outputData[outputIndex + 3] = 255;
                        }
                    }
                    
                    return output;
                };
            `;

            const blob = new Blob([workerCode], { type: 'application/javascript' });
            this.worker = new Worker(URL.createObjectURL(blob));
        }
    }

    // 处理图片
    async processImage(imageData, method = 'auto', threshold = 30) {
        if (this.isProcessing) {
            throw new Error('已有处理任务在进行中');
        }

        this.isProcessing = true;
        
        try {
            // 初始化Worker
            this.initWorker();
            
            if (this.worker && method !== 'manual') {
                // 使用Web Worker处理
                return await this.processWithWorker(imageData, method, threshold);
            } else {
                // 在主线程处理
                return this.processInMainThread(imageData, method, threshold);
            }
        } finally {
            this.isProcessing = false;
        }
    }

    // 使用Web Worker处理
    processWithWorker(imageData, method, threshold) {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                reject(new Error('Web Worker不可用'));
                return;
            }

            const onMessage = (e) => {
                this.worker.removeEventListener('message', onMessage);
                this.worker.removeEventListener('error', onError);
                resolve(e.data);
            };

            const onError = (e) => {
                this.worker.removeEventListener('message', onMessage);
                this.worker.removeEventListener('error', onError);
                reject(new Error('Worker处理失败: ' + e.message));
            };

            this.worker.addEventListener('message', onMessage);
            this.worker.addEventListener('error', onError);

            // 发送数据给Worker
            this.worker.postMessage({
                imageData: imageData,
                method: method,
                threshold: threshold
            });
        });
    }

    // 在主线程处理
    processInMainThread(imageData, method, threshold) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // 创建输出图像数据
        const output = new ImageData(width, height);
        const outputData = output.data;
        
        // 根据方法选择处理方式
        switch (method) {
            case 'color':
                return this.processByColor(imageData, threshold);
            case 'edge':
                return this.processByEdge(imageData);
            case 'auto':
            default:
                return this.processAuto(imageData, threshold);
        }
    }

    // 基于颜色的处理
    processByColor(imageData, threshold) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new ImageData(width, height);
        const outputData = output.data;
        
        // 检测背景色（假设四角是背景）
        const bgColor = this.detectBackgroundColor(imageData);
        const thresholdValue = threshold || 30;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // 计算与背景色的距离
            const distance = Math.sqrt(
                Math.pow(r - bgColor.r, 2) +
                Math.pow(g - bgColor.g, 2) +
                Math.pow(b - bgColor.b, 2)
            );
            
            if (distance < thresholdValue) {
                // 背景：设置为透明
                outputData[i] = 0;
                outputData[i + 1] = 0;
                outputData[i + 2] = 0;
                outputData[i + 3] = 0;
            } else {
                // 前景：保留原色
                outputData[i] = r;
                outputData[i + 1] = g;
                outputData[i + 2] = b;
                outputData[i + 3] = a;
            }
        }
        
        return output;
    }

    // 基于边缘的处理
    processByEdge(imageData) {
        // 先转换为灰度
        const grayData = this.utils.toGrayscale(new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        ));
        
        // 边缘检测
        const edges = this.utils.detectEdges(grayData);
        const edgeData = edges.data;
        const data = imageData.data;
        
        const output = new ImageData(imageData.width, imageData.height);
        const outputData = output.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const edgeValue = edgeData[i];
            
            if (edgeValue < 50) {
                // 非边缘区域：可能是背景
                outputData[i] = 0;
                outputData[i + 1] = 0;
                outputData[i + 2] = 0;
                outputData[i + 3] = 0;
            } else {
                // 边缘区域：保留
                outputData[i] = data[i];
                outputData[i + 1] = data[i + 1];
                outputData[i + 2] = data[i + 2];
                outputData[i + 3] = data[i + 3];
            }
        }
        
        return output;
    }

    // 自动处理（结合颜色和边缘）
    processAuto(imageData, threshold) {
        // 先进行颜色处理
        const colorResult = this.processByColor(imageData, threshold);
        
        // 再进行边缘处理
        const edgeResult = this.processByEdge(imageData);
        
        // 合并结果
        const data1 = colorResult.data;
        const data2 = edgeResult.data;
        const output = new ImageData(imageData.width, imageData.height);
        const outputData = output.data;
        
        for (let i = 0; i < outputData.length; i += 4) {
            // 如果颜色处理认为是前景，或者边缘处理认为是前景，则保留
            if (data1[i + 3] > 0 || data2[i + 3] > 0) {
                outputData[i] = imageData.data[i];
                outputData[i + 1] = imageData.data[i + 1];
                outputData[i + 2] = imageData.data[i + 2];
                outputData[i + 3] = imageData.data[i + 3];
            } else {
                outputData[i] = 0;
                outputData[i + 1] = 0;
                outputData[i + 2] = 0;
                outputData[i + 3] = 0;
            }
        }
        
        return output;
    }

    // 检测背景色
    detectBackgroundColor(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // 采样四角像素
        const corners = [
            [0, 0],  // 左上角
            [width - 1, 0],  // 右上角
            [0, height - 1],  // 左下角
            [width - 1, height - 1]  // 右下角
        ];
        
        let totalR = 0, totalG = 0, totalB = 0;
        
        for (const [x, y] of corners) {
            const index = (y * width + x) * 4;
            totalR += data[index];
            totalG += data[index + 1];
            totalB += data[index + 2];
        }
        
        return {
            r: Math.floor(totalR / corners.length),
            g: Math.floor(totalG / corners.length),
            b: Math.floor(totalB / corners.length)
        };
    }

    // 清理Worker
    cleanup() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

// 导出处理器
window.ImageProcessor = ImageProcessor;
