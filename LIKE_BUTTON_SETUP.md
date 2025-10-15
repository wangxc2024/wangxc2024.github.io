# 点赞按钮设置指南

## 功能说明

网站右下角已经添加了一个永久悬浮的点赞按钮：
- ❤️ 点击按钮，点赞数会随机增加 x（x 是正整数）
- 增加的数量遵循指数分布：P(x) ∝ e^(-x)
- 所有访客的点赞会永久累加

## 当前状态

**目前使用本地存储模式**：点赞数保存在浏览器的 localStorage 中（仅在本地有效）。

## 启用全局点赞（推荐）

要让所有访客的点赞数真正累加，需要配置 Firebase：

### 步骤 1: 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"添加项目"
3. 输入项目名称（如：wangxc-website）
4. 按提示完成创建

### 步骤 2: 设置 Realtime Database

1. 在 Firebase 控制台左侧菜单，点击"Realtime Database"
2. 点击"创建数据库"
3. 选择地区（建议：asia-southeast1）
4. 安全规则选择"以测试模式启动"（稍后会修改）

### 步骤 3: 配置安全规则

在 Realtime Database 的"规则"标签中，使用以下规则：

```json
{
  "rules": {
    "likes": {
      "total": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

⚠️ 注意：这个规则允许任何人读写。对于点赞功能这是可以的，但不要用于敏感数据。

### 步骤 4: 获取配置信息

1. 在 Firebase 控制台，点击左上角齿轮图标 → "项目设置"
2. 向下滚动到"您的应用"部分
3. 点击 "</>" 图标（Web 应用）
4. 注册应用，获取配置代码

### 步骤 5: 更新网站配置

编辑文件 `assets/js/like-button.js`，将第 9-16 行替换为您的 Firebase 配置：

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 步骤 6: 提交并推送

```bash
git add assets/js/like-button.js
git commit -m "Configure Firebase for like button"
git push origin master
```

等待几分钟，网站更新后，点赞功能就会在全球范围内同步了！

## 自定义样式

点赞按钮的样式在 `assets/js/like-button.js` 文件的 `<style>` 部分，您可以修改：
- 位置：`bottom` 和 `right` 属性
- 颜色：`background` 渐变色
- 大小：`width` 和 `height`
- 图标：将 ❤️ 改为其他 emoji

## 数据统计

配置 Firebase 后，可以在 Firebase Console 的 Realtime Database 中查看实时点赞数。

## 问题排查

1. **按钮不显示**：检查浏览器控制台是否有错误
2. **点赞不同步**：确认 Firebase 配置正确
3. **点赞数为 0**：首次使用是正常的，点击几次就有了

## 技术细节

- **指数分布实现**：使用逆变换采样方法
- **并发处理**：Firebase 事务保证数据一致性
- **性能优化**：使用 Firebase Realtime Database 实时同步
- **移动端适配**：响应式设计，在手机上也能正常使用

## 费用说明

Firebase 免费套餐包括：
- 1GB 存储
- 10GB/月 下载流量
- 100 个并发连接

对于个人网站的点赞功能，完全够用！

