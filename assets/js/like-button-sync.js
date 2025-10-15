// 全局同步点赞按钮 - 使用 CountAPI
// Global Like Button with CountAPI (no registration needed)

(function() {
  'use strict';

  // CountAPI 配置 - 使用您的域名作为命名空间
  const NAMESPACE = 'wangxc2024-github-io';
  const KEY = 'total-likes';
  const API_URL = `https://api.countapi.xyz`;

  let currentLikes = 0;
  let isUpdating = false;

  // 生成符合指数分布的随机正整数
  // P(X = x) ∝ e^(-0.01*x), x = 1, 2, 3, ...
  function generateExponentialInt() {
    const lambda = 0.01;
    const u = Math.random();
    const x = Math.ceil(-Math.log(u) / lambda);
    return Math.max(1, x); // 至少为 1，无上限
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
      </style>
      
      <button id="like-button" title="Give me a like! Globally synchronized~">👍</button>
      <div id="like-count-wrapper">
        <div id="like-count">...</div>
        <div id="like-label">Likes</div>
      </div>
      <div id="like-increment"></div>
    `;
    
    document.body.appendChild(container);
  }

  // 获取当前点赞数
  async function fetchLikes() {
    try {
      const response = await fetch(`${API_URL}/get/${NAMESPACE}/${KEY}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.value || 0;
      }
      return 0;
    } catch (error) {
      console.error('获取点赞数失败:', error);
      return 0;
    }
  }

  // 更新点赞数（增加指定数量）
  async function updateLikes(increment) {
    try {
      const response = await fetch(`${API_URL}/update/${NAMESPACE}/${KEY}?amount=${increment}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.value || currentLikes + increment;
      }
      return currentLikes + increment;
    } catch (error) {
      console.error('更新点赞数失败:', error);
      return currentLikes + increment;
    }
  }

  // 创建计数器（首次使用时）
  async function createCounter() {
    try {
      const response = await fetch(`${API_URL}/create?namespace=${NAMESPACE}&key=${KEY}&value=0`);
      if (response.ok) {
        console.log('✅ 点赞计数器已创建');
      }
    } catch (error) {
      console.log('计数器可能已存在或创建失败，继续使用');
    }
  }

  // 更新显示的点赞数
  function updateLikeCount(count, animate = true) {
    const countElement = document.getElementById('like-count');
    if (!countElement) return;
    
    if (animate && currentLikes > 0 && count > currentLikes) {
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
    
    // 先显示动画（乐观更新）
    const estimatedCount = currentLikes + increment;
    updateLikeCount(estimatedCount);
    showIncrement(increment);
    animateLikeButton();
    
    // 发送到服务器并获取真实值
    const newCount = await updateLikes(increment);
    updateLikeCount(newCount, false); // 使用真实值更新（不动画）
    
    setTimeout(() => {
      isUpdating = false;
      button.disabled = false;
    }, 10); // 0.01 秒冷却
    
    console.log(`🎉 点赞 +${increment}！总点赞数: ${newCount}`);
  }

  // 初始化
  async function initialize() {
    createLikeButton();
    
    // 尝试创建计数器（如果不存在）
    await createCounter();
    
    // 获取初始点赞数
    const likes = await fetchLikes();
    updateLikeCount(likes, false);
    
    // 绑定点击事件
    const button = document.getElementById('like-button');
    if (button) {
      button.addEventListener('click', handleLikeClick);
    }
    
    // 定期同步点赞数（每10秒）
    setInterval(async () => {
      if (!isUpdating) {
        const likes = await fetchLikes();
        if (likes !== currentLikes && likes > currentLikes) {
          updateLikeCount(likes);
        }
      }
    }, 10000);
    
    console.log('✅ 全球同步点赞系统已启动！');
    console.log(`📊 命名空间: ${NAMESPACE}, 键: ${KEY}`);
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();

