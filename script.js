document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const submitButton = document.getElementById('submitButton');
    const displayArea = document.getElementById('displayArea');
    const displayText = document.getElementById('displayText');
    const progressBar = document.getElementById('progressBar');
    const settingsButton = document.getElementById('settingsButton');
    const settingsPanel = document.getElementById('settingsPanel');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const bgColorSlider = document.getElementById('bgColorSlider');
    const textColorSlider = document.getElementById('textColorSlider');
    const bgColorPreview = document.getElementById('bgColorPreview');
    const textColorPreview = document.getElementById('textColorPreview');
    const fullscreenButton = document.getElementById('fullscreenButton');
    const inputSection = document.querySelector('.input-section');
    let isFullscreen = false;

    let currentTextIndex = 0;
    let textArray = [];
    let slideInterval;

    // 设置面板显示控制
    let settingsPanelVisible = false;
    settingsButton.addEventListener('click', () => {
        settingsPanelVisible = !settingsPanelVisible;
        settingsPanel.style.display = settingsPanelVisible ? 'block' : 'none';
    });

    // 点击其他地方关闭设置面板
    document.addEventListener('click', (e) => {
        if (settingsPanelVisible && 
            !settingsPanel.contains(e.target) && 
            !settingsButton.contains(e.target)) {
            settingsPanelVisible = false;
            settingsPanel.style.display = 'none';
        }
    });

    // 亮度调节
    brightnessSlider.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--page-brightness', `${e.target.value}%`);
    });

    // 颜色转换函数
    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    // 背景颜色调节
    function updateBgColor(value) {
        const color = hslToHex(value, 15, 97);
        document.documentElement.style.setProperty('--bg-color', color);
        bgColorPreview.style.backgroundColor = color;
    }

    // 文字颜色调节
    function updateTextColor(value) {
        const color = hslToHex(value, 70, 30);
        document.documentElement.style.setProperty('--text-color', color);
        textColorPreview.style.backgroundColor = color;
    }

    bgColorSlider.addEventListener('input', (e) => {
        updateBgColor(parseInt(e.target.value));
    });

    textColorSlider.addEventListener('input', (e) => {
        updateTextColor(parseInt(e.target.value));
    });

    // 初始化颜色预览
    updateBgColor(0);
    updateTextColor(0);

    // 更新进度条
    function updateProgressDots() {
        progressBar.innerHTML = '';
        progressBar.className = textArray.length > 1 ? 'visible' : '';
        
        textArray.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `progress-dot ${index === currentTextIndex ? 'active' : ''}`;
            progressBar.appendChild(dot);
        });
    }

    // 显示当前文字
    function showCurrentText() {
        displayText.classList.remove('active');
        displayText.classList.add('fade-out');
        
        setTimeout(() => {
            displayText.textContent = textArray[currentTextIndex];
            calculateOptimalFontSize();
            
            displayText.classList.remove('fade-out');
            displayText.classList.add('active');
            
            updateProgressDots();
        }, 500);
    }

    // 切换到下一个文字
    function nextText() {
        currentTextIndex = (currentTextIndex + 1) % textArray.length;
        showCurrentText();
    }

    function calculateOptimalFontSize() {
        displayText.style.fontSize = '1px';
        
        let min = 1;
        let max = 1000;
        
        while (min <= max) {
            const mid = Math.floor((min + max) / 2);
            displayText.style.fontSize = mid + 'px';
            
            if (displayText.scrollWidth <= displayArea.clientWidth * 0.95 && 
                displayText.scrollHeight <= displayArea.clientHeight * 0.95) {
                min = mid + 1;
            } else {
                max = mid - 1;
            }
        }
        
        displayText.style.fontSize = max + 'px';
    }

    function startTextRotation() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        
        if (textArray.length > 1) {
            slideInterval = setInterval(nextText, 2000);
        }
    }

    function updateDisplayText() {
        const text = textInput.value.trim();
        if (!text) return;

        // 清理之前的定时器
        if (slideInterval) {
            clearInterval(slideInterval);
        }

        // 分割文字并过滤空值
        textArray = text.split(',').map(t => t.trim()).filter(t => t);
        currentTextIndex = 0;

        if (textArray.length > 0) {
            showCurrentText();
            startTextRotation();
        }
    }

    submitButton.addEventListener('click', updateDisplayText);
    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            updateDisplayText();
        }
    });

    // 监听窗口大小变化
    const resizeObserver = new ResizeObserver(() => {
        if (textArray.length > 0) {
            calculateOptimalFontSize();
        }
    });
    resizeObserver.observe(displayArea);

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (slideInterval) {
                clearInterval(slideInterval);
            }
        } else if (textArray.length > 1) {
            startTextRotation();
        }
    });

    // 全屏控制
    fullscreenButton.addEventListener('click', () => {
        if (!isFullscreen) {
            // 进入全屏
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
        } else {
            // 退出全屏
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    });

    // 监听全屏状态变化
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    function handleFullscreenChange() {
        isFullscreen = !!document.fullscreenElement || 
                      !!document.webkitFullscreenElement || 
                      !!document.mozFullScreenElement ||
                      !!document.msFullscreenElement;

        // 更新全屏图标
        fullscreenIcon.innerHTML = isFullscreen 
            ? '<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>'
            : '<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>';

        // 只更新显示区域的全屏状态
        displayArea.classList.toggle('fullscreen', isFullscreen);

        // 重新计算字体大小
        if (textArray.length > 0) {
            calculateOptimalFontSize();
        }
    }
});
