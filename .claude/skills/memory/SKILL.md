---
name: memory
description: |
  長期記憶系統。漸進式揭露：
  第一層："偏好"、"專案"、"知識"、"待辦"
  第二層：各分類子目錄內的 .md 檔案名稱
  寫入："記住"、"記一下"、"幫我記"
allowed-tools: Read, Write, Edit, Grep, Glob
---

# Memory Skill

長期記憶系統，使用目錄結構實現漸進式揭露。

## 目錄結構

```
memory/
├── SKILL.md              # 本檔案（第一層入口）
├── index.json            # 記憶索引
├── categories/
│   ├── preferences/      # 偏好分類
│   │   ├── SKILL.md      # 第一層：分類說明
│   │   └── {項目}.md     # 第二層：具體偏好
│   ├── projects/         # 專案分類
│   │   ├── SKILL.md
│   │   └── {專案名}.md   # 第二層：各專案知識
│   ├── knowledge/        # 知識分類
│   │   ├── SKILL.md
│   │   └── {主題}.md     # 第二層：各知識主題
│   └── todos/            # 待辦分類
│       ├── SKILL.md
│       └── {類別}.md     # 第二層：各類待辦
└── archives/
    └── compact_YYYY-MM.md
```

## 漸進式揭露機制

### 第一層觸發（分類）
使用者提到分類關鍵字時，載入該分類的 SKILL.md：
- 「偏好」→ categories/preferences/SKILL.md
- 「專案」→ categories/projects/SKILL.md
- 「知識」→ categories/knowledge/SKILL.md
- 「待辦」→ categories/todos/SKILL.md

### 第二層觸發（具體項目）
使用者提到具體項目名稱時，載入對應的 .md 檔案：
- 「claude-telegram-bot」→ categories/projects/claude-telegram-bot.md
- 「金融」→ categories/knowledge/金融.md
- 「高頻交易」→ categories/knowledge/高頻交易.md

## 操作指引

### 讀取記憶
1. 根據關鍵字判斷分類
2. 載入對應的 SKILL.md 或具體項目檔案
3. 只載入需要的檔案，避免浪費 token

### 寫入記憶
1. 判斷記憶屬於哪個分類
2. 在對應分類目錄建立或更新 .md 檔案
3. 檔名使用有意義的關鍵字（作為第二層觸發詞）
4. 更新 index.json 統計資訊

### 新增項目
在對應分類目錄建立新的 .md 檔案，檔名即為第二層關鍵字。

## 記憶檔案格式

```markdown
# [項目名稱]

> 建立日期: YYYY-MM-DD
> 最後更新: YYYY-MM-DD

## 內容
...
```
