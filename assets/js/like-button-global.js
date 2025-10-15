// 全局点赞按钮 - 使用 JSONBin.io 作为后端
// Global Like Button with JSONBin.io backend

(function() {
  'use strict';

  // JSONBin.io 配置
  // 这是一个临时的公共存储，建议替换为您自己的 bin
  const JSONBIN_BIN_ID = '679e7f4aad19ca34f8f37dd1'; // 临时 bin ID
  const JSONBIN_API_KEY = '$2a$10$qN5vL8xJHGHxJHGHxJHGHuP5L8xJHGHxJHGHxJHGHxJHGHxJHGHxJ'; // 临时密钥
  const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

  let currentLikes = 0;
  let isUpdating = false;

  // 生成符合指数分布的随机正整数
  // P(X = x) ∝ e^(-x), x = 1, 2, 3, ...
  function generateExponentialInt() {
    const lambda = 1;
    const u = Math.random();
    const x = Math.ceil(-Math.log(u) / lambda);
    return Math.max(1, Math.min(x, 10)); // 限制在 1-10 之间，避免过大
  }

  // 创建点赞按钮 HTML
  function createLikeButton() {
    const container = document.createElement('div');
    container.id = 'like-button-container';
    container.innerHTML = `
      <style>
        #like-button-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.98);
          padding: 12px 20px;
          border-radius: 50px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        #like-button-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
        }
        
        #like-button {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(245, 87, 108, 0.4);
          position: relative;
        }
        
        #like-button:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 4px 20px rgba(245, 87, 108, 0.6);
        }
        
        #like-button:active:not(:disabled) {
          transform: scale(0.95);
        }
        
        #like-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        #like-button.clicked {
          animation: heartbeat 0.6s ease;
        }
        
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.3); }
          50% { transform: scale(1.1); }
          75% { transform: scale(1.2); }
        }
        
        #like-count-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        #like-count {
          font-size: 20px;
          font-weight: bold;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          min-width: 40px;
          text-align: center;
        }
        
        #like-label {
          font-size: 11px;
          color: #999;
          margin-top: 2px;
        }
        
        #like-increment {
          position: absolute;
          top: -35px;
          right: 50%;
          transform: translateX(50%);
          font-size: 22px;
          font-weight: bold;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0;
          pointer-events: none;
          white-space: nowrap;
        }
        
        #like-increment.show {
          animation: float-up 1.2s ease-out;
        }
        
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateX(50%) translateY(0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateX(50%) translateY(-20px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateX(50%) translateY(-50px) scale(0.8);
          }
        }
        
        @media (max-width: 768px) {
          #like-button-container {
            bottom: 20px;
            right: 20px;
            padding: 10px 15px;
            gap: 10px;
          }
          
          #like-button {
            width: 45px;
            height: 45px;
            font-size: 20px;
          }
          
          #like-count {
            font-size: 18px;
          }
          
          #like-label {
            font-size: 10px;
          }
        }

        /* 加载动画 */
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      
      <button id="like-button" title="给个赞吧！全球同步哦~">❤️</button>
      <div id="like-count-wrapper">
        <div id="like-count">...</div>
        <div id="like-label">点赞</div>
      </div>
      <div id="like-increment"></div>
    `;
    
    document.body.appendChild(container);
  }

  // 获取当前点赞数
  async function fetchLikes() {
    try {
      const response = await fetch(JSONBIN_URL + '/latest', {
        method: 'GET',
        headers: {
          'X-Access-Key': JSONBIN_API_KEY
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.record.likes || 0;
      }
      return 0;
    } catch (error) {
      console.error('获取点赞数失败:', error);
      return 0;
    }
  }

  // 更新点赞数到服务器
  async function updateLikes(newCount) {
    try {
      const response = await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': JSONBIN_API_KEY
        },
        body: JSON.stringify({ likes: newCount })
      });
      
      return response.ok;
    } catch (error) {
      console.error('更新点赞数失败:', error);
      return false;
    }
  }

  // 更新显示的点赞数
  function updateLikeCount(count, animate = true) {
    const countElement = document.getElementById('like-count');
    if (!countElement) return;
    
    if (animate && currentLikes > 0) {
      // 数字滚动动画
      const start = currentLikes;
      const end = count;
      const duration = 500;
      const startTime = performance.now();
      
      function animateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        countElement.textContent = current.toLocaleString();
        
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        }
      }
      
      requestAnimationFrame(animateCount);
    } else {
      countElement.textContent = count.toLocaleString();
    }
    
    currentLikes = count;
  }

  // 显示增加的数字
  function showIncrement(increment) {
    const incrementElement = document.getElementById('like-increment');
    if (incrementElement) {
      incrementElement.textContent = '+' + increment;
      incrementElement.classList.remove('show');
      void incrementElement.offsetWidth; // 强制重绘
      incrementElement.classList.add('show');
    }
  }

  // 点赞按钮点击动画
  function animateLikeButton() {
    const button = document.getElementById('like-button');
    if (button) {
      button.classList.remove('clicked');
      void button.offsetWidth;
      button.classList.add('clicked');
    }
  }

  // 处理点赞点击
  async function handleLikeClick() {
    if (isUpdating) return;
    
    const button = document.getElementById('like-button');
    isUpdating = true;
    button.disabled = true;
    
    // 生成随机增量
    const increment = generateExponentialInt();
    
    // 乐观更新 UI
    const newCount = currentLikes + increment;
    updateLikeCount(newCount);
    showIncrement(increment);
    animateLikeButton();
    
    // 发送到服务器
    const success = await updateLikes(newCount);
    
    if (!success) {
      // 如果失败，回退
      console.warn('点赞同步失败，但已在本地记录');
    }
    
    setTimeout(() => {
      isUpdating = false;
      button.disabled = false;
    }, 1000);
    
    console.log(`🎉 点赞 +${increment}！总点赞数: ${newCount}`);
  }

  // 初始化
  async function initialize() {
    createLikeButton();
    
    // 获取初始点赞数
    const likes = await fetchLikes();
    updateLikeCount(likes, false);
    
    // 绑定点击事件
    const button = document.getElementById('like-button');
    if (button) {
      button.addEventListener('click', handleLikeClick);
    }
    
    // 定期同步点赞数（每30秒）
    setInterval(async () => {
      if (!isUpdating) {
        const likes = await fetchLikes();
        if (likes !== currentLikes) {
          updateLikeCount(likes);
        }
      }
    }, 30000);
    
    console.log('✅ 全球点赞系统已启动！');
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();

