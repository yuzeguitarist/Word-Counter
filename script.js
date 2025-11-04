/**
 * 字数统计工具 - 核心功能脚本
 * 支持中英文字数统计，界面始终为中文
 */

class WordCounter {
    constructor() {
        // 获取DOM元素
        this.textInput = document.getElementById('textInput');
        this.totalCount = document.getElementById('totalCount');
        this.wordCount = document.getElementById('wordCount');
        this.punctuationCount = document.getElementById('punctuationCount');
        this.characterCount = document.getElementById('characterCount');
        this.characterNoSpaceCount = document.getElementById('characterNoSpaceCount');
        this.paragraphCount = document.getElementById('paragraphCount');
        this.langSwitch = document.getElementById('langSwitch');
        this.pasteBtn = document.getElementById('pasteBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.messageBox = document.getElementById('messageBox');
        this.wordLabel = document.getElementById('wordLabel');
        this.ruleValue = document.getElementById('ruleValue');
        this.rule1 = document.getElementById('rule1');
        this.rule3 = document.getElementById('rule3');
        
        // 当前统计模式
        this.currentMode = 'zh'; // zh: 中文模式, en: 英文模式
        
        // 输入检测相关
        this.lastInputTime = 0;
        this.lastTextLength = 0;
        this.inputBuffer = [];
        this.isTyping = false;
        this.typingTimer = null;
        this.resizeTimer = null;

        // 初始化
        this.init();
    }

    /**
     * 初始化函数，绑定事件监听器
     */
    init() {
        // 监听文本输入变化，实时统计
        this.textInput.addEventListener('input', (e) => {
            this.handleInput(e);
            this.updateStats();
        });

        // 监听粘贴事件
        this.textInput.addEventListener('paste', (e) => {
            this.handlePaste(e);
            setTimeout(() => {
                this.updateStats();
            }, 10);
        });

        // 监听语言切换
        this.langSwitch.addEventListener('click', () => {
            this.switchMode();
        });

        // 监听粘贴按钮
        this.pasteBtn.addEventListener('click', () => {
            this.pasteText();
        });

        // 监听导出按钮
        this.exportBtn.addEventListener('click', () => {
            this.exportImage();
        });

        // 初始化界面
        this.updateInterface();
        this.adjustTextareaHeight();
        
        // 页面加载时进行初始统计
        this.updateStats();
    }

    /**
     * 处理输入事件
     */
    handleInput(e) {
        const currentTime = Date.now();
        const currentTextLength = this.textInput.value.length;
        const lengthDiff = Math.abs(currentTextLength - this.lastTextLength);
        const timeDiff = currentTime - this.lastInputTime;

        // 检测输入速度和字符变化量
        if (lengthDiff > 20 && timeDiff < 100) {
            // 大量文字在短时间内出现，可能是粘贴
            this.triggerPasteAnimation();
        } else if (lengthDiff > 0) {
            // 正常输入
            this.handleTyping();
        }

        this.lastInputTime = currentTime;
        this.lastTextLength = currentTextLength;
        
        // 调整高度
        this.adjustTextareaHeight();
    }

    /**
     * 处理粘贴事件
     */
    handlePaste(e) {
        // 延迟触发动画，确保内容已经粘贴
        setTimeout(() => {
            this.triggerPasteAnimation();
            this.adjustTextareaHeight();
        }, 50);
    }

    /**
     * 处理打字输入
     */
    handleTyping() {
        this.isTyping = true;
        this.textInput.classList.add('typing');
        
        // 清除之前的定时器
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
        
        // 设置停止打字的定时器
        this.typingTimer = setTimeout(() => {
            this.isTyping = false;
            this.textInput.classList.remove('typing');
        }, 1000);
    }

    /**
     * 触发粘贴波动动画
     */
    triggerPasteAnimation() {
        // 移除可能存在的其他动画类
        this.textInput.classList.remove('typing', 'wave-line', 'paste-animation');
        
        // 强制重绘
        this.textInput.offsetHeight;
        
        // 添加粘贴动画
        this.textInput.classList.add('paste-animation');
        
        // 动画结束后清除类
        setTimeout(() => {
            this.textInput.classList.remove('paste-animation');
        }, 800);
    }

    /**
     * 调整文本框高度
     */
    adjustTextareaHeight() {
        const minHeight = window.innerWidth <= 480 ? 120 : window.innerWidth <= 768 ? 150 : 200;
        // 移除最大高度限制，允许无限向下扩展
        
        // 重置高度以获取准确的scrollHeight
        this.textInput.style.height = 'auto';
        
        // 计算需要的高度
        const scrollHeight = this.textInput.scrollHeight;
        const padding = 40; // padding top + bottom
        const newHeight = Math.max(minHeight, scrollHeight + padding);
        
        // 设置新高度，无最大高度限制
        this.textInput.style.height = newHeight + 'px';
        
        // 始终隐藏滚动条，因为高度会自动调整
        this.textInput.style.overflowY = 'hidden';
    }

    /**
     * 切换统计模式
     */
    switchMode() {
        this.currentMode = this.currentMode === 'zh' ? 'en' : 'zh';
        this.updateInterface();
        this.updateStats();
        this.showMessage();
    }

    /**
     * 显示消息提示
     */
    showMessage() {
        const modeText = this.currentMode === 'zh' ? '中文统计模式' : '英文统计模式';
        this.messageBox.textContent = `已切换到${modeText}`;
        this.messageBox.classList.add('show');
        
        setTimeout(() => {
            this.messageBox.classList.remove('show');
        }, 2000);
    }

    /**
     * 更新界面显示
     */
    updateInterface() {
        if (this.currentMode === 'zh') {
            // 中文统计模式
            this.langSwitch.textContent = '中';
            this.wordLabel.textContent = '汉字数';
            this.ruleValue.textContent = '每个汉字 + 每个标点符号 = 总字数';
            this.rule1.textContent = '每个中文汉字计为 1 个字数';
            this.rule3.textContent = '英文单词按单词计算';
        } else {
            // 英文统计模式
            this.langSwitch.textContent = '英';
            this.wordLabel.textContent = '单词数';
            this.ruleValue.textContent = '每个单词 + 每个标点符号 = 总字数';
            this.rule1.textContent = '每个英文单词计为 1 个字数';
            this.rule3.textContent = '中文汉字不计入统计';
        }
    }

    /**
     * 统计中文汉字数量
     * @param {string} text - 输入文本
     * @returns {number} 汉字数量
     */
    countChineseCharacters(text) {
        if (!text) return 0;
        
        // 中文汉字正则表达式（包括繁体字）
        const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g;
        const matches = text.match(chineseRegex);
        return matches ? matches.length : 0;
    }

    /**
     * 统计英文单词数量
     * @param {string} text - 输入文本
     * @returns {number} 单词数量
     */
    countEnglishWords(text) {
        if (!text || text.trim() === '') return 0;

        // 移除中文字符和标点符号，只保留英文部分
        const englishText = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, ' ')
                               .replace(/[.!?,:;'"()[\]{}\-–—\/\\@#$%^&*+=<>|~`，。！？；：""''（）【】《》、]/g, ' ');
        
        const words = englishText
            .trim()
            .replace(/\s+/g, ' ')
            .split(/\s+/)
            .filter(word => {
                return /[a-zA-Z0-9]/.test(word);
            });

        return words.length > 0 && words[0] !== '' ? words.length : 0;
    }

    /**
     * 统计总字数（根据统计模式）
     * @param {string} text - 输入文本
     * @returns {number} 总字数
     */
    countTotalWords(text) {
        if (this.currentMode === 'zh') {
            // 中文模式：汉字数 + 英文单词数
            return this.countChineseCharacters(text) + this.countEnglishWords(text);
        } else {
            // 英文模式：只统计英文单词
            return this.countEnglishWords(text);
        }
    }

    /**
     * 统计标点符号数量
     * @param {string} text - 输入文本
     * @returns {number} 标点符号数量
     */
    countPunctuation(text) {
        if (!text) return 0;

        // 包含中英文标点符号的正则表达式
        const punctuationRegex = /[.!?,:;'"()[\]{}\-–—\/\\@#$%^&*+=<>|~`，。！？；：""''（）【】《》、]/g;
        
        const matches = text.match(punctuationRegex);
        return matches ? matches.length : 0;
    }

    /**
     * 统计段落数量
     * @param {string} text - 输入文本
     * @returns {number} 段落数量
     */
    countParagraphs(text) {
        if (!text || text.trim() === '') return 0;

        const paragraphs = text
            .split(/\n+/)
            .filter(paragraph => paragraph.trim() !== '');

        return paragraphs.length;
    }

    /**
     * 统计字符数（含空格）
     * @param {string} text - 输入文本
     * @returns {number} 字符数量
     */
    countCharacters(text) {
        return text ? text.length : 0;
    }

    /**
     * 统计字符数（不含空格）
     * @param {string} text - 输入文本
     * @returns {number} 字符数量（不含空格）
     */
    countCharactersNoSpace(text) {
        if (!text) return 0;
        return text.replace(/\s/g, '').length;
    }

    /**
     * 更新统计数据显示
     */
    updateStats() {
        const text = this.textInput.value;
        
        // 计算各项统计数据
        const totalWords = this.countTotalWords(text);
        const punctuation = this.countPunctuation(text);
        const total = totalWords + punctuation; // 总字数 = 文字数 + 标点符号数
        const characters = this.countCharacters(text);
        const charactersNoSpace = this.countCharactersNoSpace(text);
        const paragraphs = this.countParagraphs(text);

        // 更新DOM显示
        this.animateNumberChange(this.totalCount, total);
        this.animateNumberChange(this.wordCount, totalWords);
        this.animateNumberChange(this.punctuationCount, punctuation);
        this.animateNumberChange(this.characterCount, characters);
        this.animateNumberChange(this.characterNoSpaceCount, charactersNoSpace);
        this.animateNumberChange(this.paragraphCount, paragraphs);

        // 调试信息
        if (window.DEBUG) {
            console.log('统计结果:', {
                统计模式: this.currentMode,
                总字数: total,
                文字数: totalWords,
                标点符号数: punctuation,
                字符数含空格: characters,
                字符数不含空格: charactersNoSpace,
                段落数: paragraphs,
                中文汉字数: this.countChineseCharacters(text),
                英文单词数: this.countEnglishWords(text)
            });
        }
    }

    /**
     * 数字变化动画效果
     * @param {HTMLElement} element - 要更新的DOM元素
     * @param {number} newValue - 新的数值
     */
    animateNumberChange(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        
        if (currentValue === newValue) return;

        element.style.transform = 'scale(1.1)';
        element.style.transition = 'transform 0.2s ease';
        
        element.textContent = newValue.toLocaleString();
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }

    /**
     * 获取详细的统计信息
     * @returns {Object} 统计信息对象
     */
    getDetailedStats() {
        const text = this.textInput.value;
        
        return {
            统计模式: this.currentMode,
            原文本: text,
            总字数: this.countTotalWords(text) + this.countPunctuation(text),
            文字数: this.countTotalWords(text),
            中文汉字数: this.countChineseCharacters(text),
            英文单词数: this.countEnglishWords(text),
            标点符号数: this.countPunctuation(text),
            字符数含空格: this.countCharacters(text),
            字符数不含空格: this.countCharactersNoSpace(text),
            段落数: this.countParagraphs(text),
            统计时间: new Date().toLocaleString('zh-CN')
        };
    }

    /**
     * 粘贴剪贴板内容到文本框
     */
    async pasteText() {
        try {
            // 使用现代的 Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                const text = await navigator.clipboard.readText();
                if (text.trim()) {
                    this.textInput.value = text;
                    this.adjustTextareaHeight();
                    this.updateStats();
                    this.triggerPasteAnimation();
                    this.showPasteMessage('内容已粘贴');
                    this.textInput.focus();
                } else {
                    this.showPasteMessage('剪贴板为空', false);
                }
            } else {
                // 降级方案：提示用户手动粘贴
                this.textInput.focus();
                this.showPasteMessage('请使用 Ctrl+V 粘贴', false);
            }
        } catch (err) {
            console.error('粘贴失败:', err);
            this.textInput.focus();
            this.showPasteMessage('请使用 Ctrl+V 粘贴', false);
        }
    }

    /**
     * 显示粘贴状态消息
     */
    showPasteMessage(message, success = true) {
        this.messageBox.textContent = message;
        this.messageBox.style.background = success ? '#fff' : '#fff';
        this.messageBox.style.borderColor = success ? '#000' : '#999';
        this.messageBox.style.color = success ? '#000' : '#666';
        this.messageBox.classList.add('show');
        
        setTimeout(() => {
            this.messageBox.classList.remove('show');
        }, 2000);
    }

    /**
     * 导出高质量图片
     */
    async exportImage() {
        try {
            const text = this.textInput.value.trim();
            if (!text) {
                this.showExportMessage('请先输入文字内容', false);
                return;
            }

            // 预加载字体
            await this.loadFonts();

            // 创建高分辨率canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 设置高DPI比例
            const scale = 3;
            
            // 设置画布基础尺寸
            const baseWidth = 800;
            const basePadding = 80;
            const baseLineHeight = 42;
            const baseFontSize = 28;
            const baseCountFontSize = 24;
            
            // 设置高分辨率画布宽度
            canvas.width = baseWidth * scale;
            canvas.style.width = baseWidth + 'px';

            // 使用系统字体来计算文字行数和高度
            ctx.font = `${baseFontSize}px "Songti", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimSun", serif`;

            // 计算文字行数和高度
            const maxWidth = baseWidth - basePadding * 2;
            const lines = this.wrapText(ctx, text, maxWidth, baseFontSize);
            const textHeight = lines.length * baseLineHeight;

            // 计算总高度：上横线 + 文字区域 + 下横线 + 字数区域
            const lineThickness = 3; // 稍微增加线条粗细
            const lineMargin = 50;
            const countAreaHeight = 80;
            const baseCanvasHeight = lineMargin + lineThickness + lineMargin + textHeight + lineMargin + lineThickness + countAreaHeight;

            // 设置画布高度
            canvas.height = baseCanvasHeight * scale;
            canvas.style.height = baseCanvasHeight + 'px';

            // 设置缩放和字体（设置画布高度后，context会被重置，所以需要重新设置）
            ctx.scale(scale, scale);
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            ctx.textRenderingOptimization = 'optimizeQuality';
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // 设置背景为纯白色
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, baseWidth, baseCanvasHeight);
            
            let currentY = lineMargin;
            
            // 绘制上横线（更粗更美观）
            ctx.fillStyle = '#2c2c2c';
            ctx.fillRect(basePadding, currentY, baseWidth - basePadding * 2, lineThickness);
            currentY += lineThickness + lineMargin;
            
            // 绘制正文（使用系统字体）
            ctx.fillStyle = '#1a1a1a';
            ctx.font = `${baseFontSize}px "Songti", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimSun", serif`;
            
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], basePadding, currentY + i * baseLineHeight);
            }
            currentY += textHeight + lineMargin;
            
            // 绘制下横线
            ctx.fillStyle = '#2c2c2c';
            ctx.fillRect(basePadding, currentY, baseWidth - basePadding * 2, lineThickness);
            currentY += lineThickness + 25;
            
            // 绘制字数统计（右下角，优雅的金色）
            const wordCount = this.currentMode === 'zh' ? 
                this.countTotalWords(text) + this.countPunctuation(text) : 
                this.countEnglishWords(text) + this.countPunctuation(text);
            const countText = `"${wordCount}字`;
            
            // 字数统计使用更优雅的字体和颜色
            ctx.font = `${baseCountFontSize}px "Songti", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimSun", serif`;
            ctx.fillStyle = '#B8860B'; // 更深沉的金色
            
            // 计算字数文字的位置（右下角）
            const countTextWidth = ctx.measureText(countText).width;
            const countX = baseWidth - basePadding - countTextWidth;
            const countY = currentY + 15;
            
            ctx.fillText(countText, countX, countY);
            
            // 转换为高质量图片并下载
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `字数统计_${wordCount}字_${new Date().toLocaleDateString().replace(/\//g, '-')}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showExportMessage('高清图片导出成功！', true);
            }, 'image/png', 1.0); // 最高质量
            
        } catch (error) {
            console.error('导出图片失败:', error);
            this.showExportMessage('导出失败，请重试', false);
        }
    }

    /**
     * 预加载字体（可选）
     */
    async loadFonts() {
        try {
            // 尝试加载字体，如果失败就忽略
            await document.fonts.ready;
        } catch (error) {
            console.log('字体预加载跳过:', error);
        }
    }

    /**
     * 导出图片降级方案（字体加载失败时使用）
     */
    async exportImageFallback(text) {
        try {
            // 创建高分辨率canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 设置高DPI比例
            const scale = 3;
            
            // 设置画布基础尺寸
            const baseWidth = 800;
            const basePadding = 80;
            const baseLineHeight = 42;
            const baseFontSize = 28;
            
            // 实际尺寸（高分辨率）
            const canvasWidth = baseWidth * scale;
            const padding = basePadding * scale;
            const lineHeight = baseLineHeight * scale;
            const fontSize = baseFontSize * scale;
            
            // 设置高分辨率画布
            canvas.width = canvasWidth;
            canvas.style.width = baseWidth + 'px';

            // 使用系统中文字体来计算文字行数和高度
            ctx.font = `${baseFontSize}px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimSun", serif`;

            // 计算文字行数和高度
            const maxWidth = baseWidth - basePadding * 2;
            const lines = this.wrapText(ctx, text, maxWidth, baseFontSize);
            const textHeight = lines.length * baseLineHeight;

            // 计算总高度
            const lineThickness = 3;
            const lineMargin = 50;
            const countAreaHeight = 80;
            const baseCanvasHeight = lineMargin + lineThickness + lineMargin + textHeight + lineMargin + lineThickness + countAreaHeight;

            // 设置画布高度
            canvas.height = baseCanvasHeight * scale;
            canvas.style.height = baseCanvasHeight + 'px';

            // 设置缩放和字体（设置画布高度后，context会被重置，所以需要重新设置）
            ctx.scale(scale, scale);
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            ctx.textRenderingOptimization = 'optimizeQuality';
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // 设置背景为纯白色
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, baseWidth, baseCanvasHeight);
            
            let currentY = lineMargin;
            
            // 绘制上横线
            ctx.fillStyle = '#2c2c2c';
            ctx.fillRect(basePadding, currentY, baseWidth - basePadding * 2, lineThickness);
            currentY += lineThickness + lineMargin;
            
            // 绘制正文
            ctx.fillStyle = '#1a1a1a';
            ctx.font = `${baseFontSize}px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimSun", serif`;
            
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], basePadding, currentY + i * baseLineHeight);
            }
            currentY += textHeight + lineMargin;
            
            // 绘制下横线
            ctx.fillStyle = '#2c2c2c';
            ctx.fillRect(basePadding, currentY, baseWidth - basePadding * 2, lineThickness);
            currentY += lineThickness + 25;
            
            // 绘制字数统计
            const wordCount = this.currentMode === 'zh' ? 
                this.countTotalWords(text) + this.countPunctuation(text) : 
                this.countEnglishWords(text) + this.countPunctuation(text);
            const countText = `"${wordCount}字`;
            
            ctx.font = `24px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimSun", serif`;
            ctx.fillStyle = '#B8860B';
            
            const countTextWidth = ctx.measureText(countText).width;
            const countX = baseWidth - basePadding - countTextWidth;
            const countY = currentY + 15;
            
            ctx.fillText(countText, countX, countY);
            
            // 转换为高质量图片并下载
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `字数统计_${wordCount}字_${new Date().toLocaleDateString().replace(/\//g, '-')}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showExportMessage('高清图片导出成功！', true);
            }, 'image/png', 1.0);
            
        } catch (error) {
            console.error('导出图片失败:', error);
            this.showExportMessage('导出失败，请重试', false);
        }
    }

    /**
     * 文字换行处理（优化版）
     */
    wrapText(ctx, text, maxWidth, fontSize) {
        const lines = [];
        const paragraphs = text.split('\n');
        
        // 临时设置字体以准确测量文字宽度
        const originalFont = ctx.font;
        ctx.font = `${fontSize}px "Songti", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimSun", serif`;
        
        for (const paragraph of paragraphs) {
            if (paragraph.trim() === '') {
                lines.push('');
                continue;
            }
            
            // 按字符分割，更精确地处理中文
            const chars = [...paragraph]; // 使用扩展运算符正确处理Unicode字符
            let line = '';
            
            for (const char of chars) {
                const testLine = line + char;
                const testWidth = ctx.measureText(testLine).width;
                
                if (testWidth > maxWidth && line !== '') {
                    lines.push(line);
                    line = char;
                } else {
                    line = testLine;
                }
            }
            
            if (line) {
                lines.push(line);
            }
        }
        
        // 恢复原字体设置
        ctx.font = originalFont;
        
        return lines;
    }

    /**
     * 显示导出消息
     */
    showExportMessage(message, success = true) {
        this.messageBox.textContent = message;
        this.messageBox.className = `message-box ${success ? 'success' : 'error'}`;
        this.messageBox.classList.add('show');
        
        setTimeout(() => {
            this.messageBox.classList.remove('show');
        }, 3000);
    }
}

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', () => {
    const wordCounter = new WordCounter();
    
    window.wordCounter = wordCounter;
    
    // 检查字体加载状态
    document.fonts.ready.then(() => {
        console.log('字体加载完成');
        // 检查宋体字体是否可用
        if (document.fonts.check('16px Songti')) {
            console.log('宋体字体加载成功！');
        } else {
            console.log('宋体字体加载失败，将使用系统默认字体');
        }
    });
    
    // 窗口大小改变时重新调整高度（使用节流避免性能问题）
    window.addEventListener('resize', () => {
        if (wordCounter.resizeTimer) {
            clearTimeout(wordCounter.resizeTimer);
        }
        wordCounter.resizeTimer = setTimeout(() => {
            wordCounter.adjustTextareaHeight();
        }, 150); // 150ms 节流延迟
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + L 清空文本
        if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
            event.preventDefault();
            wordCounter.textInput.value = '';
            wordCounter.textInput.focus();
            wordCounter.adjustTextareaHeight();
            wordCounter.updateStats();
        }
        
        // Ctrl/Cmd + E 切换统计模式
        if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
            event.preventDefault();
            wordCounter.switchMode();
        }
        
        // Ctrl/Cmd + Shift + V 粘贴文本
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
            event.preventDefault();
            wordCounter.pasteText();
        }
    });

    // 示例文本功能
    const addExampleButton = () => {
        const exampleTexts = {
            zh: `这是一个中文字数统计的示例文本。它包含了中文汉字、英文单词和各种标点符号！

我们来测试一下混合文本的统计效果：Hello world! 这样的混合文本应该能够正确统计。

Does it work correctly? 当然可以！`,
            en: `This is a sample text for testing the word counting functionality. 

It includes multiple sentences, punctuation marks, and paragraphs. Let's see how accurately it counts words and punctuation marks according to essay writing standards.

Does it work correctly? Yes, it should!`
        };
        
        wordCounter.textInput.value = exampleTexts[wordCounter.currentMode];
        wordCounter.updateStats();
        wordCounter.adjustTextareaHeight();
        wordCounter.textInput.focus();
    };

    window.addExample = addExampleButton;
    
    console.log('字数统计工具已加载完成！');
    console.log('快捷键：Ctrl/Cmd + L 清空文本，Ctrl/Cmd + E 切换统计模式，Ctrl/Cmd + Shift + V 粘贴文本');
    console.log('调用 addExample() 添加示例文本');
    console.log('尝试粘贴大段文字体验气泡动画效果！');
    console.log('输入框现在支持无限向下扩展，不再有高度限制！');
    console.log('点击粘贴按钮可以直接粘贴剪贴板内容！');
}); 
