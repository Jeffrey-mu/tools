# 🛠️ 在线工具箱 (Online Tools Collection)

一个基于 Vue 3 + TypeScript + Tailwind CSS 构建的现代化在线工具集合，提供开发者工具、文本处理、图形设计以及生活效率等多种实用功能。

![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat&logo=vite&logoColor=white)

## ✨ 功能特性

本项目目前包含 **20+** 个实用工具，分为四大类：

### 👨‍💻 开发者工具
*   **JSON 格式化**: 支持美化、压缩、语法校验及错误提示。
*   **时间戳转换**: Unix 时间戳与日期时间互转，支持毫秒/秒。
*   **Base64 编解码**: 支持文本和图片的 Base64 转换。
*   **UUID 生成器**: 批量生成 Version 1 和 Version 4 UUID。
*   **正则测试**: 实时测试正则表达式匹配，支持常用预设。
*   **URL 编解码**: 对 URL 参数进行 Encode/Decode 处理。
*   **URL 参数解析**: 解析 URL 查询参数，支持编辑并重组 URL。
*   **MD5 加密**: 计算文本 32 位 / 16 位 MD5 哈希。
*   **录屏**: 屏幕/窗口/标签页录制，支持麦克风与系统音频（取决于浏览器与共享源）。

### 📝 文本与数据
*   **字数统计**: 实时统计汉字、单词、字符数及行数。
*   **文本 Diff**: 对比两段文本的差异，高亮显示不同之处。
*   **密码生成**: 生成包含大小写、数字、符号的强密码。
*   **命名转换**: 驼峰、下划线、烤串等多种变量命名风格互转。

### 🎨 图形与设计
*   **二维码生成**: 将文本或链接生成二维码，支持下载。
*   **颜色转换**: HEX, RGB, HSL 格式互转，支持色板预览。
*   **图片压缩**: 本地图片压缩，支持调节压缩质量与尺寸。

### ⏳ 生活与效率
*   **单位换算**: 支持长度、重量、面积、温度等 12 类物理单位换算。
*   **番茄钟**: 专注工作倒计时，支持工作/短休/长休模式切换。
*   **待办清单**: 简单的本地 Todo List，支持状态筛选与持久化存储。
*   **决策转盘**: "今天吃什么"转盘及指定范围随机数生成。

## 🚀 技术栈

*   **核心框架**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
*   **构建工具**: [Vite](https://vitejs.dev/)
*   **开发语言**: [TypeScript](https://www.typescriptlang.org/)
*   **样式方案**: [Tailwind CSS 4](https://tailwindcss.com/)
*   **路由管理**: [Vue Router](https://router.vuejs.org/)
*   **工具库**:
    *   [`@vueuse/core`](https://vueuse.org/): 组合式 API 工具集
    *   [`lucide-vue-next`](https://lucide.dev/): 精美图标库
    *   [`codemirror`](https://codemirror.net/): 代码编辑器组件
    *   [`crypto-js`](https://github.com/brix/crypto-js): 加密/哈希算法工具
    *   [`diff`](https://github.com/kpdecker/jsdiff): 文本差异对比
    *   [`qrcode`](https://github.com/soldair/node-qrcode): 二维码生成
    *   [`convert-units`](https://github.com/convert-units/convert-units): 单位换算
    *   [`colord`](https://colord.omgovich.ru/): 颜色处理
    *   [`browser-image-compression`](https://github.com/Donaldcwl/browser-image-compression): 图片压缩

## 📦 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd tools
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev
```

默认访问 `http://localhost:5173` 即可看到运行效果（也可能因端口占用自动切换）。

### 4. 构建生产版本

```bash
pnpm build
```

构建产物将输出到 `dist` 目录。

## 🎥 录屏说明

*   **必须是安全上下文**：录屏依赖 `getDisplayMedia`，仅在 `https` 或 `localhost` 下可用。部署后如果用 `http` 或 IP 直连，浏览器可能会禁用录屏。
*   **系统音频的限制**：Web 端获取“扬声器/系统音频”受浏览器限制，通常在“共享标签页”并勾选“共享音频/标签页音频”时成功率更高；共享“窗口/整个屏幕”时可能拿不到系统音频属于正常现象。

## ☁️ 部署说明

*   **Vercel 刷新 404**：项目包含 `vercel.json`，用于 SPA 路由刷新回退到 `index.html`。

## 📂 目录结构

```
src/
├── components/      # 公共组件
├── data/            # 静态数据（如工具列表配置）
├── layouts/         # 布局组件
├── router/          # 路由配置
├── views/           # 页面视图
│   └── tools/       # 具体工具页面
│       ├── dev/     # 开发者工具
│       ├── text/    # 文本工具
│       ├── image/   # 图形工具
│       └── life/    # 生活工具
├── App.vue          # 根组件
└── main.ts          # 入口文件
```

## 📄 许可证

[MIT License](LICENSE)
