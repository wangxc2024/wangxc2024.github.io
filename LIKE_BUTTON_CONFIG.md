# 全球点赞系统配置指南

## ✅ 当前状态

您的网站已经启用了**全球同步点赞系统**！

- ❤️ 悬浮在右下角
- 所有访客的点赞会实时累加
- 每次点击随机增加 1-10 个赞（指数分布）
- 每 30 秒自动同步最新数据

## 🔧 配置您自己的后端（推荐）

当前使用的是临时公共存储，建议配置您自己的后端：

---

### 方案 A：JSONBin.io（最简单，5分钟完成）

#### 1. 创建账号
- 访问：https://jsonbin.io/
- 点击 "Sign Up" 免费注册
- 验证邮箱

#### 2. 创建 Bin
- 登录后点击 "Create Bin"
- 输入初始数据：
```json
{
  "likes": 0
}
```
- 点击 "Create"

#### 3. 获取配置信息
- 复制 Bin ID（类似：`65abc123def456789`）
- 点击右上角头像 → "API Keys"
- 复制 API Key（以 `$2a$10$` 开头）

#### 4. 更新网站配置
编辑文件 `assets/js/like-button-global.js`：

找到第 9-11 行：
```javascript
const JSONBIN_BIN_ID = '679e7f4aad19ca34f8f37dd1'; // 临时 bin ID
const JSONBIN_API_KEY = '$2a$10$...'; // 临时密钥
```

替换为您的配置：
```javascript
const JSONBIN_BIN_ID = '您的Bin ID';
const JSONBIN_API_KEY = '您的API Key';
```

#### 5. 提交更新
```bash
git add assets/js/like-button-global.js
git commit -m "Update like button with personal JSONBin config"
git push origin master
```

✅ 完成！5 分钟后访问您的网站即可。

**JSONBin 免费额度**：
- ✅ 10,000 次请求/月
- ✅ 无限 bins
- ✅ 足够个人网站使用

---

### 方案 B：Firebase（更专业，功能更强）

#### 1. 创建 Firebase 项目
- 访问：https://console.firebase.google.com/
- 点击 "添加项目"
- 输入项目名称（如：`wangxc-website`）
- 按提示完成创建（可以禁用 Google Analytics）

#### 2. 启用 Realtime Database
- 在左侧菜单选择 "Realtime Database"
- 点击 "创建数据库"
- 选择地区：`asia-southeast1`（新加坡）
- 安全规则：选择"以测试模式启动"

#### 3. 配置安全规则
在 Database 页面点击 "规则" 标签，替换为：

```json
{
  "rules": {
    "likes": {
      ".read": true,
      ".write": true,
      ".validate": "newData.isNumber() && newData.val() >= 0"
    }
  }
}
```

点击 "发布"

#### 4. 获取配置
- 点击左上角齿轮 → "项目设置"
- 向下滚动到 "您的应用"
- 点击 "</>" （Web 应用）
- 注册应用，复制配置对象

#### 5. 创建 Firebase 版本脚本

创建新文件 `assets/js/like-button-firebase.js`，参考以下模板：

```javascript
// Firebase 全球点赞系统
(function() {
  'use strict';

  // 替换为您的 Firebase 配置
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
  };

  // ... 其余代码保持不变 ...
})();
```

#### 6. 更新引用
编辑 `_includes/scripts.html`，将：
```html
<script src="{{ base_path }}/assets/js/like-button-global.js"></script>
```
改为：
```html
<script src="{{ base_path }}/assets/js/like-button-firebase.js"></script>
```

**Firebase 免费额度**：
- ✅ 1GB 存储
- ✅ 10GB/月 下载流量
- ✅ 100 个并发连接
- ✅ 实时同步更快

---

## 📊 数据查看

### JSONBin.io
- 登录后在 Dashboard 查看您的 Bin
- 可以看到实时点赞数

### Firebase
- 在 Realtime Database 页面
- 实时显示数据变化

---

## 🎨 自定义样式

在 `assets/js/like-button-global.js` 中可以修改：

**位置**（第 32-33 行）：
```css
bottom: 30px;  /* 距离底部 */
right: 30px;   /* 距离右侧 */
```

**颜色**（第 49 行）：
```css
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```
改为其他渐变色，如蓝色系：
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**按钮图标**（第 169 行）：
```html
<button id="like-button" title="给个赞吧！">❤️</button>
```
可以改为：
- 👍 大拇指
- ⭐ 星星
- 💖 粉色心
- 🎉 庆祝

---

## 📈 统计信息

查看浏览器控制台（F12）可以看到：
- 点赞事件日志
- 同步状态
- 错误信息（如果有）

---

## ⚠️ 注意事项

1. **API Key 安全**：
   - JSONBin 和 Firebase 的配置会暴露在网页中
   - 这对点赞功能是可以接受的
   - 但不要在同一个项目存储敏感数据

2. **滥用防护**：
   - 当前每次点击限制在 1-10 个赞之间
   - 每次点击后有 1 秒冷却时间
   - 可以根据需要调整

3. **数据备份**：
   - 建议定期保存点赞数
   - 可以在后台手动查看和导出

---

## 🐛 问题排查

### 按钮不显示
- 打开浏览器控制台（F12）查看错误
- 检查 `_includes/scripts.html` 是否正确引用

### 点赞数不同步
- 检查网络请求是否成功（Network 标签）
- 确认后端配置正确
- 尝试清除浏览器缓存

### 点赞数归零
- 检查后端数据是否被重置
- 确认 API 权限配置正确

---

## 📞 需要帮助？

如果遇到问题：
1. 查看浏览器控制台错误信息
2. 检查后端配置是否正确
3. 确认网络连接正常

---

## 🎯 下一步

推送更改后：
```bash
git add .
git commit -m "Enable global like button system"
git push origin master
```

等待 2-5 分钟，访问您的网站，就能看到全球同步的点赞系统了！

所有访客都能看到同一个点赞数，点击后全球实时更新！🎉

