---
name: memory
description: |
  Long-term memory system for storing and retrieving user preferences,
  project knowledge, learning notes, and todos. Use when user mentions
  "記住", "記一下", "幫我記", "偏好", "專案", "知識", "待辦",
  or asks about previously stored information.
allowed-tools: Read, Write, Edit, Grep, Glob
---

# Memory System

長期記憶系統，用於儲存和檢索使用者資訊。

## Categories

| Category | Path | Description |
|----------|------|-------------|
| preferences | [categories/preferences/](categories/preferences/) | 使用者偏好設定 |
| projects | [categories/projects/](categories/projects/) | 專案相關知識 |
| knowledge | [categories/knowledge/](categories/knowledge/) | 學習的知識筆記 |
| todos | [categories/todos/](categories/todos/) | 待辦事項 |

## Reading Memory

1. Check [index.json](index.json) for statistics and last update times
2. Navigate to relevant category directory
3. List files with `Glob` to see available memories
4. Read specific `.md` files as needed

## Writing Memory

1. Determine which category the memory belongs to
2. Create or update `.md` file in `categories/{category}/`
3. Use descriptive filename (e.g., `claude-telegram-bot.md`, `金融.md`)
4. Update [index.json](index.json) statistics

## Memory File Format

```markdown
# [Title]

> Created: YYYY-MM-DD
> Updated: YYYY-MM-DD

## Content
...
```

## Trigger Keywords

- **Write**: 記住、記一下、幫我記
- **Read**: 偏好、專案、知識、待辦

## Archives

Old or compacted memories are stored in [archives/](archives/).
