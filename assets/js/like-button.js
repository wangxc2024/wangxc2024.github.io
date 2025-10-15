// Like Button with Exponential Distribution
// 点赞按钮 - 指数分布随机增加

(function() {
  'use strict';

  // Firebase 配置 - 用户需要替换为自己的配置
  // 如何获取: https://console.firebase.google.com/
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  // 检查是否配置了 Firebase
  const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

  // 生成符合指数分布的随机正整数
  // P(X = x) ∝ e^(-x), x = 1, 2, 3, ...
  function generateExponentialInt() {
    // 使用逆变换采样方法
    // 对于离散指数分布，我们使用几何分布的变体
    const lambda = 1; // 参数
    const u = Math.random();
    const x = Math.ceil(-Math.log(u) / lambda);
    return Math.max(1, x); // 确保至少为 1
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
          gap: 10px;
          background: rgba(255, 255, 255, 0.95);
          padding: 12px 20px;
          border-radius: 50px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
        }
        
        #like-button-container:hover {
          transform: scale(1.05);
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
        }
        
        #like-button:hover {
          transform: rotate(15deg) scale(1.1);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.6);
        }
        
        #like-button:active {
          transform: scale(0.9);
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
        
        #like-count {
          font-size: 18px;
          font-weight: bold;
          color: #667eea;
          min-width: 40px;
          text-align: center;
        }
        
        #like-increment {
          position: absolute;
          top: -30px;
          right: 20px;
          font-size: 20px;
          font-weight: bold;
          color: #667eea;
          opacity: 0;
          pointer-events: none;
        }
        
        #like-increment.show {
          animation: float-up 1s ease-out;
        }
        
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px);
          }
        }
        
        @media (max-width: 768px) {
          #like-button-container {
            bottom: 20px;
            right: 20px;
            padding: 10px 15px;
          }
          
          #like-button {
            width: 45px;
            height: 45px;
            font-size: 20px;
          }
          
          #like-count {
            font-size: 16px;
          }
        }
      </style>
      
      <button id="like-button" title="点个赞吧！">❤️</button>
      <div id="like-count">0</div>
      <div id="like-increment"></div>
    `;
    
    document.body.appendChild(container);
  }

  // 从 localStorage 读取点赞数（备用方案）
  function getLocalLikes() {
    return parseInt(localStorage.getItem('totalLikes') || '0');
  }

  // 保存到 localStorage（备用方案）
  function saveLocalLikes(count) {
    localStorage.setItem('totalLikes', count.toString());
  }

  // 更新显示的点赞数
  function updateLikeCount(count) {
    const countElement = document.getElementById('like-count');
    if (countElement) {
      // 添加数字滚动动画
      const start = parseInt(countElement.textContent);
      const end = count;
      const duration = 500;
      const startTime = performance.now();
      
      function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        countElement.textContent = current;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }
      
      requestAnimationFrame(animate);
    }
  }

  // 显示增加的数字
  function showIncrement(increment) {
    const incrementElement = document.getElementById('like-increment');
    if (incrementElement) {
      incrementElement.textContent = '+' + increment;
      incrementElement.classList.remove('show');
      // 强制重绘
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

  // 初始化（使用 localStorage 作为备用方案）
  function initializeLocal() {
    createLikeButton();
    
    const currentCount = getLocalLikes();
    updateLikeCount(currentCount);
    
    const button = document.getElementById('like-button');
    button.addEventListener('click', function() {
      const increment = generateExponentialInt();
      const newCount = currentCount + increment;
      
      saveLocalLikes(newCount);
      updateLikeCount(newCount);
      showIncrement(increment);
      animateLikeButton();
      
      console.log(`点赞 +${increment}！总点赞数: ${newCount}`);
    });
    
    // 显示提示信息
    if (!isFirebaseConfigured) {
      console.warn('Firebase 未配置，使用本地存储模式（点赞数仅在本地保存）');
    }
  }

  // 初始化（如果配置了 Firebase）
  function initializeWithFirebase() {
    // 加载 Firebase SDK
    const script1 = document.createElement('script');
    script1.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
    
    const script2 = document.createElement('script');
    script2.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js';
    
    script1.onload = function() {
      script2.onload = function() {
        // 初始化 Firebase
        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        const likesRef = database.ref('likes/total');
        
        createLikeButton();
        
        // 监听点赞数变化
        likesRef.on('value', function(snapshot) {
          const count = snapshot.val() || 0;
          updateLikeCount(count);
        });
        
        // 点赞按钮点击事件
        const button = document.getElementById('like-button');
        button.addEventListener('click', function() {
          const increment = generateExponentialInt();
          
          // 使用事务更新，避免并发问题
          likesRef.transaction(function(currentValue) {
            return (currentValue || 0) + increment;
          });
          
          showIncrement(increment);
          animateLikeButton();
          
          console.log(`点赞 +${increment}！`);
        });
      };
      document.head.appendChild(script2);
    };
    document.head.appendChild(script1);
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (isFirebaseConfigured) {
        initializeWithFirebase();
      } else {
        initializeLocal();
      }
    });
  } else {
    if (isFirebaseConfigured) {
      initializeWithFirebase();
    } else {
      initializeLocal();
    }
  }
})();

