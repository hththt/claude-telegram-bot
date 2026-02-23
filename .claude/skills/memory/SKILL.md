---
name: memory
description: |
  長期記憶系統。漸進式觸發關鍵字：
  第一層（分類）："偏好"、"專案"、"知識"、"待辦"
  第二層（項目）：各分類內的具體主題，見 index.json 的 keywords
  寫入觸發："記住"、"記一下"、"幫我記"
allowed-tools: Read, Write, Edit, Grep, Glob
---

# Memory Skill

長期記憶系統，用於儲存和管理使用者的偏好、專案知識、待辦事項等資訊。

## 記憶分類

| 分類 | 用途 | 檔案 |
|------|------|------|
| preferences | 使用者偏好設定 | categories/preferences.md |
| projects | 專案相關知識 | categories/projects.md |
| knowledge | 學習的知識 | categories/knowledge.md |
| todos | 待辦事項 | categories/todos.md |
| context | 背景資訊 | categories/context.md |

## 操作指引

### 讀取記憶
1. 先讀取 `index.json` 查看分類摘要和關鍵字
2. 根據需求載入相關分類檔案
3. 只載入需要的分類，避免浪費 token

### 寫入記憶
1. 更新對應的分類 `.md` 檔案
2. 更新 `index.json` 的統計資訊
3. 記錄更新時間和關鍵字

### 新增分類
當記憶不適合現有分類時，可建立新分類：
1. 在 `categories/` 建立 `{new_category}.md`
2. 在 `index.json` 的 `categories` 新增該分類
3. 遵循相同的 Markdown 格式

### COMPACT 壓縮
當記憶過多時執行壓縮：
1. 讀取所有分類
2. 提取核心資訊、移除過時或重複內容
3. 歷史摘要寫入 `archives/compact_YYYY-MM.md`
4. 精簡各分類檔案
5. 更新 `index.json` 的 `last_compact`

## 記憶格式規範

### 分類檔案格式
```markdown
# [分類名稱]

> 最後更新: YYYY-MM-DD
> 記憶數量: N

## [主題]
- **[項目]**: [內容]
- 日期: YYYY-MM-DD
```

### index.json 格式
```json
{
  "version": "1.0",
  "last_updated": "ISO時間",
  "last_compact": "ISO時間",
  "categories": {
    "分類名": {
      "count": 數量,
      "last_updated": "ISO時間",
      "keywords": ["關鍵字"]
    }
  },
  "total_entries": 總數,
  "dynamic_categories": true
}
```

## 觸發條件

### 漸進式揭露機制

**第一層關鍵字（分類名稱）**
- 「偏好」→ 讀取 preferences
- 「專案」→ 讀取 projects
- 「知識」→ 讀取 knowledge
- 「待辦」→ 讀取 todos

**第二層關鍵字（具體項目）**
儲存在 index.json 各分類的 keywords 陣列中，例如：
- projects.keywords: ["claude-telegram-bot", "trading-bot", ...]
- knowledge.keywords: ["金融", "交易", "高頻交易", "健康", ...]

當使用者提到第二層關鍵字時，自動載入對應分類的記憶。

### 寫入觸發
- 使用者提到「記住」、「記一下」、「幫我記」→ 儲存新記憶
- 儲存時同步更新 index.json 的 keywords（加入新的第二層關鍵字）

### 新對話流程
1. 檢查使用者訊息是否包含第一層或第二層關鍵字
2. 若有，先讀取 index.json 確認記憶狀態
3. 載入匹配分類的記憶內容
4. 基於記憶內容繼續回應使用者
