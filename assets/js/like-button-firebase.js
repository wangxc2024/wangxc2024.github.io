// 全球同步点赞按钮 - 使用 Firebase Realtime Database
// Global Like Button with Firebase (most reliable solution)

(function() {
  'use strict';

  // ============================================
  // Firebase 配置 - 请替换为您自己的配置
  // 获取方法：https://console.firebase.google.com/
  // ============================================
  const firebaseConfig = {
    apiKey: "AIzaSyAEVTwm4RfiUSjg5N80QAY-QfOhA6lofjw",
    authDomain: "wangxc2024-likes-e42ea.firebaseapp.com",
    databaseURL: "https://wangxc2024-likes-e42ea-default-rtdb.firebaseio.com",
    projectId: "wangxc2024-likes-e42ea",
    storageBucket: "wangxc2024-likes-e42ea.firebasestorage.app",
    messagingSenderId: "261856606589",
    appId: "1:261856606589:web:96bb7cde7cd236f38d7414"
  };
  
  // 检查是否已配置
  const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

  let currentLikes = 0;
  let isUpdating = false;
  let database = null;
  let likesRef = null;

  // 生成符合指数分布的随机正整数
  function generateExponentialInt() {
    const lambda = 0.01;
    const u = Math.random();
    const x = Math.ceil(-Math.log(u) / lambda);
    return Math.max(1, x);
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
          position: relative;
        }
        
        #like-button:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.6);
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

        .config-warning {
          position: fixed;
          top: 10px;
          right: 10px;
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 10px 15px;
          border-radius: 5px;
          font-size: 12px;
          color: #856404;
          z-index: 10000;
          max-width: 300px;
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

    // 如果未配置，显示警告
    if (!isConfigured) {
      const warning = document.createElement('div');
      warning.className = 'config-warning';
      warning.innerHTML = '⚠️ Firebase not configured. Please check FIREBASE_SETUP_GUIDE.md';
      document.body.appendChild(warning);
      setTimeout(() => warning.remove(), 10000);
    }
  }

  // 更新显示的点赞数
  function updateLikeCount(count, animate = true) {
    const countElement = document.getElementById('like-count');
    if (!countElement) return;
    
    if (animate && currentLikes > 0 && count > currentLikes) {
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
      void incrementElement.offsetWidth;
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
    if (isUpdating || !likesRef) return;
    
    const button = document.getElementById('like-button');
    isUpdating = true;
    button.disabled = true;
    
    const increment = generateExponentialInt();
    
    // 乐观更新
    updateLikeCount(currentLikes + increment);
    showIncrement(increment);
    animateLikeButton();
    
    // 使用 Firebase 事务更新（避免并发问题）
    try {
      await likesRef.transaction(function(currentValue) {
        return (currentValue || 0) + increment;
      });
      console.log(`🎉 点赞 +${increment}！`);
    } catch (error) {
      console.error('点赞失败:', error);
    }
    
    setTimeout(() => {
      isUpdating = false;
      button.disabled = false;
    }, 10);
  }

  // 初始化 Firebase
  function initializeFirebase() {
    createLikeButton();
    
    if (!isConfigured) {
      console.warn('⚠️ Firebase 未配置！请查看 FIREBASE_SETUP_GUIDE.md');
      updateLikeCount(0, false);
      return;
    }

    // 加载 Firebase SDK
    const script1 = document.createElement('script');
    script1.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
    
    const script2 = document.createElement('script');
    script2.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js';
    
    script1.onload = function() {
      script2.onload = function() {
        try {
          // 初始化 Firebase
          firebase.initializeApp(firebaseConfig);
          database = firebase.database();
          likesRef = database.ref('likes/total');
          
          // 监听点赞数变化（实时同步）
          likesRef.on('value', function(snapshot) {
            const count = snapshot.val() || 0;
            updateLikeCount(count);
          });
          
          // 绑定点击事件
          const button = document.getElementById('like-button');
          if (button) {
            button.addEventListener('click', handleLikeClick);
          }
          
          console.log('✅ Firebase 全球点赞系统已启动！');
        } catch (error) {
          console.error('Firebase 初始化失败:', error);
          updateLikeCount(0, false);
        }
      };
      document.head.appendChild(script2);
    };
    
    script1.onerror = function() {
      console.error('Firebase SDK 加载失败');
      updateLikeCount(0, false);
    };
    
    document.head.appendChild(script1);
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebase);
  } else {
    initializeFirebase();
  }
})();

