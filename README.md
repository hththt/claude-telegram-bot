# Claude Telegram 機器人

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0+-black.svg)](https://bun.sh/)

**將 [Claude Code](https://claude.com/product/claude-code) 變成你的個人助理，隨時隨地透過 Telegram 使用。**

發送文字、語音、照片、文件、音訊和影片。即時查看回應和工具使用狀態。

![Demo](assets/demo.gif)

## Claude Code 作為個人助理

我開始使用 Claude Code 作為個人助理，並建立了這個機器人讓我可以在任何地方使用它。

事實上，雖然 Claude Code 被描述為強大的 AI **程式編碼助手**，但當給予適當的指示、上下文和工具時，它實際上是一個非常能幹的**通用型助手**。

為了實現這個目標，我設定了一個資料夾，其中包含一個 CLAUDE.md 來教導 Claude 關於我的資訊（我的偏好、筆記存放位置、工作流程），並根據我的需求提供一套工具和腳本，然後將這個機器人指向該資料夾。

> **[📄 查看個人助理指南](docs/personal-assistant-guide.md)** 獲取詳細的設定說明和範例。

## 機器人功能

- 💬 **文字**：提問、下達指令、進行對話
- 🎤 **語音**：自然說話 - 透過 OpenAI 轉錄後由 Claude 處理
- 📸 **照片**：發送螢幕截圖、文件或任何視覺內容進行分析
- 📄 **文件**：PDF、文字檔和壓縮檔（ZIP、TAR）會被解析並分析
- 🎵 **音訊**：音訊檔案（mp3、m4a、ogg、wav 等）透過 OpenAI 轉錄後處理
- 🎬 **影片**：影片訊息和影片備註由 Claude 處理
- 🔄 **對話持續**：對話可跨訊息延續
- 📨 **訊息佇列**：Claude 處理時可繼續發送多則訊息 - 會自動排隊。使用 `!` 前綴或 `/stop` 可中斷並立即發送
- 🧠 **延伸思考**：使用「think」或「reason」等詞彙觸發 Claude 的推理功能 - 你會看到它的思考過程（可透過 `THINKING_TRIGGER_KEYWORDS` 設定）
- 🔘 **互動按鈕**：Claude 可透過內建的 `ask_user` MCP 工具將選項顯示為可點擊的內嵌按鈕

## 快速開始

```bash
git clone https://github.com/linuz90/claude-telegram-bot?tab=readme-ov-file
cd claude-telegram-bot-ts

cp .env.example .env
# 編輯 .env 填入你的憑證

bun install
bun run src/index.ts
```

### 前置需求

- **Bun 1.0+** - [安裝 Bun](https://bun.sh/)
- **Claude Agent SDK** - `@anthropic-ai/claude-agent-sdk`（透過 bun install 安裝）
- **Telegram Bot Token** 來自 [@BotFather](https://t.me/BotFather)
- **OpenAI API Key**（選用，用於語音轉錄）

### Claude 認證

機器人使用 `@anthropic-ai/claude-agent-sdk`，支援兩種認證方式：

| 方式                      | 適用場景                           | 設定方式                          |
| ------------------------- | ---------------------------------- | --------------------------------- |
| **CLI 認證**（建議）      | 高使用量、較划算                   | 執行 `claude` 一次進行認證        |
| **API Key**               | CI/CD、未安裝 Claude Code 的環境   | 在 `.env` 設定 `ANTHROPIC_API_KEY` |

**CLI 認證**（建議）：SDK 會自動使用你的 Claude Code 登入資訊。只需確保你已執行過 `claude` 並完成認證。這會使用你的 Claude Code 訂閱，對於大量使用來說更加划算。

**API Key**：適用於未安裝 Claude Code 的環境。從 [console.anthropic.com](https://console.anthropic.com/) 取得金鑰並加入 `.env`：

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

注意：API 使用按 token 計費，大量使用時費用會快速累積。

## 設定

### 1. 建立你的機器人

1. 在 Telegram 開啟 [@BotFather](https://t.me/BotFather)
2. 發送 `/newbot` 並按照提示建立機器人
3. 複製 token（格式像 `1234567890:ABC-DEF...`）

然後發送 `/setcommands` 給 BotFather 並貼上：

```
start - 顯示狀態和使用者 ID
new - 開始新對話
resume - 從最近的對話中選擇恢復
stop - 中斷目前查詢
status - 查看 Claude 正在做什麼
restart - 重新啟動機器人
```

### 2. 設定環境變數

建立 `.env` 並填入你的設定：

```bash
# 必要
TELEGRAM_BOT_TOKEN=1234567890:ABC-DEF...   # 來自 @BotFather
TELEGRAM_ALLOWED_USERS=123456789           # 你的 Telegram 使用者 ID

# 建議
CLAUDE_WORKING_DIR=/path/to/your/folder    # Claude 執行的目錄（載入 CLAUDE.md、skills、MCP）
OPENAI_API_KEY=sk-...                      # 用於語音轉錄
```

**找到你的 Telegram 使用者 ID**：在 Telegram 傳訊給 [@userinfobot](https://t.me/userinfobot)。

**檔案存取路徑**：預設情況下，Claude 可以存取：

- `CLAUDE_WORKING_DIR`（如未設定則為 home 目錄）
- `~/Documents`、`~/Downloads`、`~/Desktop`
- `~/.claude`（用於 Claude Code 計畫和設定）

要自訂，在 `.env` 設定 `ALLOWED_PATHS`（以逗號分隔）。注意：這會**覆蓋**所有預設值，如果你要使用計畫模式，記得包含 `~/.claude`：

```bash
ALLOWED_PATHS=/your/project,/other/path,~/.claude
```

### 3. 設定 MCP 伺服器（選用）

複製並編輯 MCP 設定：

```bash
cp mcp-config.ts mcp-config.local.ts
# 編輯 mcp-config.local.ts 加入你的 MCP 伺服器
```

機器人內建 `ask_user` MCP 伺服器，讓 Claude 可以將選項顯示為可點擊的內嵌鍵盤按鈕。加入你自己的 MCP 伺服器（Things、Notion、Typefully 等）讓 Claude 可以使用你的工具。

## 機器人指令

| 指令       | 說明                              |
| ---------- | --------------------------------- |
| `/start`   | 顯示狀態和你的使用者 ID           |
| `/new`     | 開始新對話                        |
| `/resume`  | 從最近 5 個對話中選擇恢復（附摘要）|
| `/stop`    | 中斷目前查詢                      |
| `/status`  | 查看 Claude 正在做什麼            |
| `/restart` | 重新啟動機器人                    |

## 作為服務執行（macOS）

```bash
cp launchagent/com.claude-telegram-ts.plist.template ~/Library/LaunchAgents/com.claude-telegram-ts.plist
# 編輯 plist 填入你的路徑和環境變數
launchctl load ~/Library/LaunchAgents/com.claude-telegram-ts.plist
```

機器人會在登入時自動啟動，當機時自動重啟。

**防止休眠**：要讓機器人在 Mac 閒置時持續運作，前往**系統設定 → 電池 → 選項**並啟用**「當顯示器關閉時防止自動進入睡眠」**（使用電源轉接器時）。

**日誌**：

```bash
tail -f /tmp/claude-telegram-bot-ts.log   # stdout
tail -f /tmp/claude-telegram-bot-ts.err   # stderr
```

**Shell 別名**：如果作為服務執行，這些別名方便管理機器人（加入 `~/.zshrc` 或 `~/.bashrc`）：

```bash
alias cbot='launchctl list | grep com.claude-telegram-ts'
alias cbot-stop='launchctl bootout gui/$(id -u)/com.claude-telegram-ts 2>/dev/null && echo "Stopped"'
alias cbot-start='launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.claude-telegram-ts.plist 2>/dev/null && echo "Started"'
alias cbot-restart='launchctl kickstart -k gui/$(id -u)/com.claude-telegram-ts && echo "Restarted"'
alias cbot-logs='tail -f /tmp/claude-telegram-bot-ts.log'
```

## 開發

```bash
# 自動重載執行
bun --watch run src/index.ts

# 型別檢查
bun run typecheck

# 或直接執行
bun run --bun tsc --noEmit
```

## 安全性

> **⚠️ 重要**：此機器人執行 Claude Code 時**跳過所有權限提示**。Claude 可以在允許的路徑內讀取、寫入和執行指令而無需確認。這是為了提供順暢的行動體驗而刻意設計的，但在部署前你應該了解其影響。

**→ [閱讀完整安全模型](SECURITY.md)** 了解權限運作方式和現有的保護措施。

多層保護防止濫用：

1. **使用者白名單** - 只有你的 Telegram ID 可以使用機器人
2. **意圖分類** - AI 過濾器阻擋危險請求
3. **路徑驗證** - 檔案存取限制在 `ALLOWED_PATHS`
4. **指令安全** - 阻擋像 `rm -rf /` 這樣的破壞性模式
5. **速率限制** - 防止過度使用
6. **稽核日誌** - 所有互動都記錄到 `/tmp/claude-telegram-audit.log`

## 疑難排解

**機器人沒有回應**

- 確認你的使用者 ID 在 `TELEGRAM_ALLOWED_USERS` 中
- 檢查機器人 token 是否正確
- 查看日誌：`tail -f /tmp/claude-telegram-bot-ts.err`
- 確保機器人程序正在執行

**Claude 認證問題**

- CLI 認證：在終端機執行 `claude` 並確認已登入
- API key：檢查 `ANTHROPIC_API_KEY` 已設定且以 `sk-ant-api03-` 開頭
- 在 [console.anthropic.com](https://console.anthropic.com/) 確認 API key 有額度

**語音訊息失敗**

- 確認 `.env` 中已設定 `OPENAI_API_KEY`
- 確認金鑰有效且有額度

**Claude 無法存取檔案**

- 檢查 `CLAUDE_WORKING_DIR` 指向現有目錄
- 確認 `ALLOWED_PATHS` 包含你要 Claude 存取的目錄
- 確保機器人程序有讀寫權限

**MCP 工具無法運作**

- 確認 `mcp-config.ts` 存在且正確匯出
- 檢查 MCP 伺服器相依套件已安裝
- 在日誌中查找 MCP 錯誤

## 授權

MIT
