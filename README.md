# Batch Groq STT

批量将 `data/` 目录下的 MP3 文件转录为文字，支持生成 JSON、SRT 字幕和 TXT 纯文本。

## 环境要求

- [Bun](https://bun.com)
- [Groq API Key](https://console.groq.com/keys)

## 安装

```bash
bun install
```

## 配置

创建 `.env` 文件：

```bash
GROQ_API_KEY="your_api_key_here"
```

## 下载音频

可以使用 [yt-dlp](https://github.com/yt-dlp/yt-dlp) 从 YouTube 下载音频：

```bash
yt-dlp -t mp3 "https://www.youtube.com/watch?v=UF8uR6Z6KLc"
```

## 准备音频

将待转录的 MP3 文件放入 `data/` 目录。

## 运行

```bash
bun run index.ts
```

## 输出

每个 MP3 文件会生成三个文件（以 `audio.mp3` 为例）：

| 文件         | 说明                         |
| ------------ | ---------------------------- |
| `audio.json` | 完整转录结果（含时间戳段落） |
| `audio.srt`  | SRT 字幕格式                 |
| `audio.txt`  | 纯文本转录内容               |

已存在的 JSON 文件会被跳过，不会重复转录。

## 脚本

```bash
bun run lint      # 代码检查
bun run lint:fix  # 自动修复
bun run fmt       # 代码格式化
bun run fmt:check # 检查格式
```
