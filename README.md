# 数字消除 (Math Puzzle Game)

一个基于 React + Vite + Tailwind CSS 开发的数字消除益智游戏。

## 部署到 Vercel 指南

由于我无法直接访问您的 GitHub 或 Vercel 账户，请按照以下步骤手动完成部署：

### 第一步：准备代码
1. 在 AI Studio 中，点击右上角的 **"Download"** 按钮（或类似导出功能的图标）将项目代码下载到本地。
2. 解压下载的压缩包。

### 第二步：上传到 GitHub
1. 登录您的 [GitHub](https://github.com/) 账号。
2. 创建一个新的仓库（Repository），命名为 `math-puzzle-game`。
3. 在本地项目根目录下打开终端，执行以下命令：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/您的用户名/math-puzzle-game.git
   git push -u origin main
   ```

### 第三步：部署到 Vercel
1. 登录 [Vercel](https://vercel.com/)。
2. 点击 **"Add New..."** -> **"Project"**。
3. 导入您刚刚创建的 `math-puzzle-game` 仓库。
4. Vercel 会自动识别这是一个 Vite 项目：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 点击 **"Deploy"**。

### 环境变量 (可选)
如果您在代码中使用了 Gemini API，请在 Vercel 项目设置的 **Environment Variables** 中添加：
- `GEMINI_API_KEY`: 您的 Gemini API 密钥。

## 技术栈
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4
- **Animation**: Motion (Framer Motion), Canvas-confetti
- **Icons**: Lucide React
