# Claude Code 作為個人助理

一些背景：我是 [Fabrizio](https://fabrizio.so)，X 上的 [@linuz90](https://x.com/linuz90)，[Typefully](https://typefully.com) 的共同創辦人兼設計師。

在 Typefully，我們很早就全面擁抱 AI 編碼，並大量使用 Claude Code（和 Codex）。但我也喜歡優化和自動化我個人生活的某些部分。

特別是自從 Sonnet/Opus 4.5 模型推出後，[Claude Code](https://claude.com/product/claude-code) 已成為我首選的 AI 編碼助手。

我很快意識到，當給予適當的指示、上下文和工具時，這些模型實際上是非常能幹的**通用型助手**。

在看到我的共同創辦人 [Francesco](https://x.com/frankdilo) 使用 Claude Code 處理任務和電子郵件後，我開始**把它當作個人助理使用，特別是透過 Telegram**（這就是這個專案的目的）。

經過一些迭代後，我得出了這個系統/設定：

1. **我建立了一個 `fab-dev` 資料夾**，其中包含一個 `CLAUDE.md` 來教導 Claude 關於我的資訊、我的偏好、我的筆記存放位置、我的工作流程。
2. _選用_：我請 Claude **將設定檔[符號連結](https://en.wikipedia.org/wiki/Symbolic_link)** 到這個新的中央資料夾，這樣我可以輕鬆編輯它們並改善我的開發設定。例如，我將 `~/.claude/commands` 和 `~/.claude/skills` 符號連結到這裡，這樣我可以請 Claude 新增在任何地方都可用的指令或技能。我也將 `~/.zshrc` 符號連結到這個資料夾用於 shell 設定。
3. _選用_：**我將這個資料夾追蹤為 Git 儲存庫**，這樣我也可以輕鬆進行版本控制，或未來需要時在多台 Mac 上共享。
4. **我將這個「fab-dev」資料夾設定為這個機器人的工作目錄**（透過 `CLAUDE_WORKING_DIR`）。

**為了保持 CLAUDE.md 精簡**，我在其中引用我的個人筆記系統，而不是直接嵌入所有內容。

`CLAUDE.md` 中引用的主要「Notes」資料夾是一個 iCloud 資料夾，我將它加入到 [Ulysses](https://ulysses.app/) 和 [iA Writer](https://ia.net/writer)，這樣我可以在任何地方即時看到助手所做的更改。iCloud 在這方面非常出色，能在背景即時將更新推送到所有裝置。

此外，我透過安裝 [MCP](https://code.claude.com/docs/en/mcp)、新增[指令](https://code.claude.com/docs/en/slash-commands)和[技能](https://code.claude.com/docs/en/skills)來擴展其功能。技能特別強大——它們會根據上下文自動觸發，並為常見任務定義特定的工作流程，如建立待辦事項、研究主題或規劃健身。

**神奇的部分：當我需要新功能時，我只需請 Claude 建立它。** 甚至可以透過 Telegram 機器人在外出時進行。

例如，我想讓助手總結影片，所以我請它建立獲取 YouTube 字幕的腳本（並在必要時下載並在本地轉錄）。現在我可以透過 Telegram 從任何地方請求影片摘要。

![影片摘要範例](../assets/demo-video-summary.gif)

所以無論我在 Mac 上啟動 Claude Code 對話（通常使用 `--dangerously-skip-permissions` 旗標）還是與 Telegram 機器人聊天，**Claude 現在是我的 24/7 執行助理**。

## CLAUDE.md 是助理的大腦

我個人助理 `fab-dev` 資料夾中的 `CLAUDE.md` 檔案是這個設定的核心。

由於 Claude 預設會跳過權限提示（詳見 [SECURITY.md](../SECURITY.md)），它可以相當自由地瀏覽其他資料夾、讀寫檔案、在允許的路徑內執行指令（更多關於腳本和指令的內容請見下文）。

這是一個基於我自己設定的範本：

````
# CLAUDE.md

這個檔案為 Claude Code 提供指引，使其能作為 [你的名字] 的個人助理。

## 快速參考

**這個資料夾：**
- `cli/` - 實用腳本（使用 `bun run cli/...` 執行）
- `.claude/skills/` - 任務工作流程（things-todo、gmail、research、workout-planning 等）
- `.claude/agents/` - 用於脈動和摘要的子代理

**關鍵路徑：**
- 筆記：`~/Documents/Notes/`（Me/、Research/、Health/、Journal/、[嗜好]/）
- 個人文件：`~/Documents/Personal/`

## 關於 [你的名字]

[你的名字] 是一位 [年齡] 歲的 [職業]，住在 [城市]。

[關於工作、生活方式、嗜好等的簡要背景]

個人背景、目標和財務——請見下方的 Me/ 檔案。

**保持上下文新鮮**：當出現新的個人資訊時，主動更新相關的 Me/ 筆記。

## 如何協助

- **選擇正確的來源**：自主決定在哪裡查找。需要時平行搜尋多個來源（網路、筆記、reddit 等）
- **總是檢查日期**：對於時效性問題，先執行 `date`
- **溝通風格**：[例如「平衡且友善，謹慎使用表情符號」]
- **自主性**：獨立處理例行任務，重大行動前先詢問
- **格式**：偏好項目符號列表而非 markdown 表格
- **優先順序**：突出重要項目；不要只是傾倒列表

**關鍵**：當被要求記住某事時，更新相關檔案：
- 個人目標 → `life-goals.md`
- 個人背景 → `personal-context.md`
- Claude 行為 → `CLAUDE.md`

# 知識與檔案

筆記存放在 `~/Documents/Notes/`（同步到 iCloud）。使用 `qmd` 進行語義搜尋：

    qmd search "關鍵字"   # 快速關鍵字比對
    qmd query "問題"      # LLM 重新排序（最佳品質）

## 個人背景（Me/）

真實來源檔案：
- `personal-context.md` — 家人、朋友、偏好、習慣
- `life-goals.md` — 長期目標
- `pulse.md` — 目前生活摘要
- `finances.md` — 財務概覽

## 其他資料夾

- `Journal/` — 按年份的月度記錄
- `Health/` — 飲食、健身、訓練計畫
- `Research/` — 研究筆記
- `[嗜好]/` — 特定嗜好的筆記

## 快速查詢

- 生活/優先事項 → `Me/pulse.md` + 最近的 Journal
- 目標 → `Me/life-goals.md`
- 健身 → `Health/` 或 `bun run cli/utils/health.ts workouts week`

# 任務管理

## 任務

使用 `things-todo` 技能來建立任務、排程和專案路由。

**當被問到「我有什麼事情要處理」時**：同時檢查任務和日曆。

## 日曆

    bun run cli/google/calendar.ts today|tomorrow|week|range <from> <to>

## 電子郵件

使用 `gmail` 技能處理電子郵件和郵件轉任務的工作流程。

## 工作整合（選用）

    bun run cli/integrations/slack.ts channels|messages|recent
    bun run cli/integrations/notion.ts search|page|databases

````

「保持上下文新鮮」的指示建立了一種**基於檔案的記憶系統**，因為 Claude 會在學習關於我的新事物時自動讀取和更新上下文檔案（筆記）。

我也偶爾請 Claude 檢查我的 Notes 資料夾、Things 專案等，並用最新資訊更新 `CLAUDE.md` 檔案，所以在那裡硬編碼一些資訊是可以的，因為讓它自我更新相當容易。

## 範例：Claude 作為私人教練 / 健康教練

我最喜歡的用法之一是讓 Claude 作為私人教練，了解我的飲食、訓練計畫和最近的活動。

我在 Mac 上錄製了示範，但這是我通常在外出時用 iPhone 做的事：

![健身範例](../assets/demo-workout.gif)

設定很簡單：

1. **[Health Auto Export](https://www.healthyapps.dev/)** - 一個 iOS 應用程式，將 Apple Health 資料同步到 iCloud 作為每日 JSON 檔案
2. **一個 CLI 腳本**（`cli/utils/health.ts`）讀取這些檔案並返回結構化的健康資料——你可以很容易地請 Claude 建立這類腳本
3. **一個 `workout-planning` 技能**，定義根據訓練計畫和最近活動建立健身計畫的工作流程
4. **一個 Notes 資料夾**（透過 iCloud 同步）用於儲存健身記錄的 markdown 檔案

我請 Claude 建立健康腳本，它會解析 Health Auto Export 的 JSON 檔案並返回我目前的健康指標以及歷史趨勢用於比較。

這是它返回的內容：

```json
{
  "current": {
    "sleep": {
      "duration": "8h 6m",
      "deep": "2h 4m",
      "rem": "2h 4m",
      "bedtime": "1:18 AM",
      "wakeTime": "9:27 AM"
    },
    "activity": {
      "steps": 6599,
      "distance": "5.1km",
      "activeCalories": 582,
      "exerciseTime": 20
    },
    "vitals": {
      "restingHR": 48,
      "hrv": 70.6,
      "avgHR": 61
    }
  },
  "trends": {
    "last7days": { "avgSleep": "7h 40m", "avgRestingHR": 56.6, "avgHRV": 68.8 },
    "30daysAgo": { "avgSleep": "7h 21m", "avgRestingHR": 55.1, "avgHRV": 66.4 },
    "3monthsAgo": { "avgSleep": "7h 29m", "avgRestingHR": 51.3, "avgHRV": 77.5 }
  },
  "recovery": {
    "score": 80,
    "status": "optimal"
  }
}
```

現在我可以在任何地方問「我睡得怎麼樣？」或「我的恢復狀況如何？」。

我現在使用一個 **`workout-planning` 技能**（`.claude/skills/workout-planning/SKILL.md`）而不是在 CLAUDE.md 中嵌入健身指示：

```markdown
---
name: workout-planning
description: 根據訓練計畫和最近活動建立個人化的健身計畫。當被要求健身、運動例程、健身房計畫或「今天該練什麼」時使用。
allowed-tools: Read, Write, Bash(cli/utils/health.ts workouts:*), Glob
---

# 健身規劃

當被要求健身時：

1. **讀取訓練計畫**：`~/Documents/Notes/Health/training.md`（私人教練計畫）
2. **檢查最近記錄**：`~/Documents/Notes/Health/Workouts/`
3. **檢查健身頻率**：執行 `health.ts workouts week` 查看過去 7 天
4. **根據排程和最近活動提出適當的健身計畫**
5. **立即建立**健身檔案：`Health/Workouts/YYYY-MM-DD-workout.md`
```

技能還包含一個用於檢查健身歷史的 CLI：

```bash
bun run cli/utils/health.ts workouts           # 今天的健身
bun run cli/utils/health.ts workouts week      # 過去 7 天
bun run cli/utils/health.ts workouts enrich    # 將 Health 資料加入今天的記錄
```

當我傳訊「給我一個健身計畫」時，Claude 會：

1. 檢查我私人教練的訓練計畫
2. 查看我最近的健身記錄
3. 考慮健康腳本提供的恢復分數
4. 建立這樣的健身記錄檔案：

```markdown
# 健身 - 2025 年 12 月 29 日

**類型：** 全身
**地點：** 健身房

## 動作

3 組，10-12 次，休息 1 分鐘

1. **腿部伸展** - [影片](https://youtu.be/...)
2. **腿部彎舉** - [影片](https://youtu.be/...)
3. **滑輪下拉** - [影片](https://youtu.be/...)
4. **肩推** - [影片](https://youtu.be/...)
5. **三頭肌下壓 + 二頭肌彎舉**

## 備註

假期期間的輕度訓練，約 45-50 分鐘。
```

由於我的 Notes 資料夾透過 iCloud 同步，我在健身房打開 iPhone 上的 [Ulysses](https://ulysses.app/)，健身計畫就在那裡。

我可以在健身過程中傳訊給 Claude 要求調整，例如「把肩推換成側平舉」，檔案就會更新。我在幾秒內就能在 Ulysses 中看到更改。

就像口袋裡有一個私人教練，了解我的訓練歷史、恢復狀況，並能即時調整。

一如既往，上下文越好，結果越好。所以如果你有訓練計畫或訓練歷史，確保 Claude 可以存取這些筆記。

## 範例：使用子代理的生活脈動指令

[指令](https://code.claude.com/docs/en/slash-commands)讓你可以定義帶有動態上下文的可重複使用提示。它們存放在 `~/.claude/commands/`（全域）或 `your-project/claude/commands/`。

另一方面，[子代理](https://code.claude.com/docs/en/sub-agents)是 Claude 可以委派任務的專門代理。它們被定義為 `.claude/agents/` 中的 markdown 檔案，每個都在自己的上下文視窗中執行，這讓主對話保持精簡。

我的個人助理「fab-dev」資料夾包含指令和子代理。指令從 `~/.claude/commands/` 符號連結，所以它們在任何地方都可用，並且它們可以使用 MCP 和呼叫這個資料夾中定義的子代理。

我一直喜歡每天早上閱讀一種**我待處理事項的執行摘要**的想法，所以我請 Claude 建立一個 `/life-pulse` 指令，配合一組專門的子代理，並設定為每天早上自動執行。

### 為什麼要用子代理？

像 `/life-pulse` 這樣複雜的指令需要從許多來源收集資料：電子郵件、工作議題、財務、健康指標、賽車統計、網路新聞。如果主代理直接做所有這些，上下文視窗很快就會被原始資料填滿，可能導致結果不佳或資訊遺漏。

所以我的脈動指令使用 **6 個子代理**平行執行：

| 子代理              | 工作                           | 返回                                      |
| ------------------- | ------------------------------ | ----------------------------------------- |
| `gmail-digest`      | 分析收件匣和最近郵件           | 需要注意的未讀、訂單、討論串              |
| `linear-digest`     | 分析工作議題                   | 進行中、阻塞項、下一步                    |
| `finance-digest`    | 分析淨值和配置                 | 財務快照、時效性項目                      |
| `health-digest`     | 分析 Apple Health 資料         | 簡要健康檢查                              |
| `sim-racing-digest` | 分析比賽結果                   | 表現洞察                                  |
| `for-you-digest`    | 策劃網路和 Reddit 內容         | 10-15 個有趣項目                          |

主代理然後只處理輕量級資料（Things 任務、日曆、日誌）並將子代理輸出**組裝**成最終摘要。

### 子代理範例

這是一個摘要子代理的樣子（簡化版）：

```
---
name: health-digest
description: 分析健康指標並提供簡要檢查。用於脈動或當使用者詢問健康時。
tools: Bash, Read
model: haiku
---

你是一個關心健康的朋友，對健康指標進行快速檢查。

## 資料收集

執行健康腳本：
bun run cli/utils/health.ts

## 分析

尋找真正值得注意的事項：

- 睡眠明顯比平常好/差
- 靜息心率上升（壓力）或下降（體能）
- 過去一個月的心率變異性變化

## 輸出

返回簡要檢查（3-5 行）。像朋友一樣寫，不是醫療報告。

範例：「睡眠一直不錯，7.2 小時——比上個月的 6.8 小時有所提升。靜息心率保持在 54bpm。這週活動量有點低，可能需要多散步。」
```

### 主脈動指令

這是 `/life-pulse` 指令的簡化版本：

````
---
description: 生成執行生活摘要
allowed-tools: Bash, Read, Write, mcp__things__*, Task
---

# 生成生活脈動

## 上下文

- 目前時間：!`date "+%A, %Y-%m-%d %H:%M"`

## 實作

1. **收集資料**（平行執行）：

- Things：`get_today`、`get_upcoming`、`get_projects`（輕量級，主代理處理）
- 日曆：`bun run cli/google/calendar.ts range <today> <today+28>`
- 日誌：讀取最近 2-3 篇記錄
- **電子郵件**：呼叫 `gmail-digest` 子代理（不要在背景執行）
- **工作**：呼叫 `linear-digest` 子代理（不要在背景執行）
- **財務**：呼叫 `finance-digest` 子代理（不要在背景執行）
- **健康**：呼叫 `health-digest` 子代理（不要在背景執行）
- **賽車**：呼叫 `sim-racing-digest` 子代理（不要在背景執行）
- **為你推薦**：呼叫 `for-you-digest` 子代理（不要在背景執行）

2. **綜合**輸出為各區段：

- **摘要**：項目符號（每個最多 400 字元）捕捉生活的核心狀態。每個項目以相關表情符號開頭。包含財務快照、郵件重點、即將到來的事件。
  - 對於有明確下一步行動的項目，加上後續行：
    ```
    💰 **項目描述在此。**
    ↳ **明確的下一步行動在此**
    ```
- **現在**：非常簡潔的需要注意的事項列表。最多 3-6 個項目，不廢話。
- **為你推薦**：來自 for-you-digest 的策劃內容。簡短的帶表情符號和連結的項目。
- **腦中所想**：佔據心理頻寬的事項。每段開頭使用表情符號。
- **健康**：來自 health-digest。可以是項目符號，每個帶相關表情符號。
- **下一步**：近期優先事項結合長期目標。

3. **格式規則**：
- 不要使用表格——使用自然的散文和項目符號
- 使用 **粗體** 強調關鍵術語
- 保持可掃描但溫暖，像是個人簡報
- 讓連結可點擊（Linear 議題、Things 任務、郵件）

4. **寫入**到 `~/Documents/Notes/life-pulse.md`

5. 完成後開啟檔案：`open ~/Documents/Notes/life-pulse.md`
````

所有原始資料都保留在快速且便宜的子代理執行中（它們使用 `haiku`）。主代理只看到綜合的摘要並將所有內容組裝成連貫、可讀的摘要。

而且因為每個子代理是獨立的檔案，我可以直接呼叫它們來回答「我的健康狀況如何？」或「檢查我的郵件」這樣的問題。

我已經在每天早上喝咖啡時在 iPad 上閱讀我的生活脈動摘要好一陣子了，這是開始一天的好方式。

## 範例：動態日曆

另一個我使用的酷模式是讓 Claude **管理同步到我手機的日曆**。我用這個來處理真實賽道日和模擬賽車聯賽。

```
YAML 設定 → sync.py → .ics 檔案 → GitHub Gist → Google/Apple 日曆
```

[GitHub Gist](https://gist.github.com/) URL 是穩定的，所以訂閱它們的日曆應用程式會在內容變更時自動更新（有些延遲）。

我想知道我附近賽道（葡萄牙的 Estoril、Portimão）的賽道日。問題是：活動資訊分散在多個主辦方網站上，通常是 PDF 傳單或圖片頁面。

所以我請 Claude 建立一個爬蟲。它發展成一個 36,000 行的 Python 腳本（`racing-events.py`），可以：

1. **爬取多個來源** - EuropaTrackdays、Driven.pt、Motor Sponsor、CRM Caterham
2. **使用 Playwright** 處理 JavaScript 密集型網站
3. **使用 OCR 和 Claude Vision** 處理 PDF 傳單和圖片日曆
4. **輸出 YAML** 結構化的活動資料

YAML 是這個用途的好格式，因為它容易讀寫，我也可以輕鬆發現錯誤並手動編輯。

```yaml
# calendars/track-days.yaml（自動生成）
gist:
  id: 12344asdasd257be07871234asddfg123
  filename: track_days.ics
calendar:
  name: "Fab • 賽道日"
  timezone: Europe/Lisbon
events:
  - date: "2026-01-11"
    time: "09:00"
    title: "Portimão - Gedlich Racing"
    duration_minutes: 540
    description: "Endless Summer | €3,290 | Open Pit Lane..."
    url: https://en.europatrackdays.com/trackday/29919/...
```

YAML 然後同步到我日曆訂閱的 Gist。

當我說「更新我的賽道日日曆」時，Claude 執行爬蟲、更新 YAML 並同步到 gist。我的日曆自動更新。

事實上，我請 Claude 建立一個 `sync.py` 腳本，將 YAML 轉換為 iCalendar 格式並推送到 GitHub：

```bash
# 列出可用的日曆
calendars/sync.py list

# 預覽即將到來的活動
calendars/sync.py preview sim-racing

# 同步到 gist（使用 `gh` CLI）
calendars/sync.py sync sim-racing
```

我在 Google 日曆和 Apple 日曆中訂閱了這些 Gist URL 一次：

```
https://gist.githubusercontent.com/linuz90/.../raw/sim_racing.ics
https://gist.githubusercontent.com/linuz90/.../raw/track_days.ics
```

現在當我傳訊「把比利時比賽加到我的模擬賽車日曆下週四」時，Claude 會：

1. 編輯 `sim-racing.yaml`
2. 執行 `sync.py sync sim-racing`
3. Gist 更新
4. 我手機的日曆在幾分鐘內更新

我可以透過 Telegram 從世界任何地方管理我的賽車日曆。

## 範例：Claude 作為研究員

另一個我經常使用的模式是讓 Claude 為我做深入研究。無論是比較產品、調查主題還是做購買決定，Claude 會搜尋多個來源並將發現綜合成清晰的建議。

![研究範例](../assets/demo-research.gif)

設定現在使用一個 **`research` 技能**來處理整個工作流程：

```markdown
---
name: research
description: 使用網路搜尋、Reddit 和 Hacker News 深入研究主題，然後將發現儲存到 Notes。當被要求研究、比較選項、調查主題或找優缺點時使用。
allowed-tools: WebSearch, WebFetch, Bash(reddit.sh:*), Bash(hn.sh:*), Read, Write, Edit, Glob
---

# 研究工作流程

**關鍵：每個研究任務必須在回應前將結果儲存到 `~/Documents/Notes/Research/`。**

## 流程

1. **先檢查現有研究**在 `~/Documents/Notes/Research/`
2. **使用多個來源深入搜尋**：
   - WebSearch 獲取一般資訊
   - Reddit 獲取社群洞察
   - Hacker News 獲取科技/創業討論
3. **綜合**發現並給出清晰建議
4. **儲存到檔案** - 如果存在則更新
```

技能包含社群來源的腳本：

**Reddit** - 真實世界的意見和經驗：

```bash
reddit.sh top iRacing,simracing --time week --limit 10 --preview
reddit.sh search "BMW M2 front splitter" --time all --limit 20 --preview
```

**Hacker News** - 科技和創業討論：

```bash
hn.sh top --limit 5 --min-score 100        # 本週熱門文章
hn.sh search "startup pricing" --preview    # 搜尋並包含評論
```

`--preview` 旗標包含完整文章內容和熱門評論，這才是真正洞察所在。

當我傳訊「研究我模擬賽車設備的升級選項」時，Claude 會：

1. **檢查現有研究** - 在 `Research/` 中查找任何關於該主題的先前檔案
2. **搜尋網路** - 使用網路搜尋獲取產品評測和專家意見
3. **搜尋 Reddit 和 HN** - 找到有真實世界經驗的社群討論
4. **綜合所有內容** - 結合規格、評測和社群反饋
5. **儲存研究** - 建立像 `2025-12-30-sim-racing-rig-upgrade.md` 這樣的日期檔案

結果是一份包含清晰建議和所有來源連結的全面研究文件。我喜歡可以隨時隨地觸發這個功能。

## 範例：Claude 作為同事

自從整合了 **Slack、Linear 和 Notion** 到我的設定後，Claude 可以作為追蹤工作動態的同事。

當我離開幾天後，我可以問：

- 「我的隊友在做什麼？有阻塞項嗎？」
- 「幫我了解 #progress-updates 頻道的最新情況」
- 「API v2 專案的最新進展是什麼？」

Claude 會檢查 Slack 的最近訊息和討論串、Linear 的議題更新和阻塞項、Notion 的新規格或文件——然後總結與我相關的內容。

### 設定 Slack 存取

要讓這個運作，你需要建立一個有適當權限的 Slack 應用程式：

1. **建立 Slack 應用程式**在 [api.slack.com/apps](https://api.slack.com/apps)
2. **新增 OAuth 範圍**在「OAuth & Permissions」下：
   - `channels:history` - 讀取公開頻道的訊息
   - `channels:read` - 列出頻道
   - `groups:history` - 讀取私人頻道的訊息（選用）
   - `groups:read` - 列出私人頻道（選用）
3. **安裝應用程式**到你的工作區並複製 Bot User OAuth Token
4. **邀請機器人**到你想讓它讀取的頻道（在每個頻道使用 `/invite @YourBotName`）

機器人只能看到它被邀請的頻道中的訊息，這讓你可以控制 Claude 可以存取什麼。

### CLI

我請 Claude 建立一個簡單的 Slack CLI：

```bash
bun run cli/integrations/slack.ts channels              # 列出已加入的頻道
bun run cli/integrations/slack.ts messages general      # #general 的最近訊息
bun run cli/integrations/slack.ts recent                # 所有頻道的最近訊息
bun run cli/integrations/slack.ts thread <url>          # 從 Slack URL 取得完整討論串
```

結合 Linear 和 Notion 存取，Claude 可以給我工作動態的完整全貌——只需在我喝咖啡時發一則 Telegram 訊息。

最終，建立腳本、技能、指令或任何組合來增強你的代理協助你，取決於你。天空是極限，而且這似乎每天都在演進。

我很想知道你在建立什麼，[在 X 上聯繫我](https://x.com/linuz90)。
