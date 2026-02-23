/**
 * Command handlers for Claude Telegram Bot.
 *
 * /start, /new, /stop, /status, /resume, /restart
 */

import type { Context } from "grammy";
import { session } from "../session";
import { WORKING_DIR, ALLOWED_USERS, RESTART_FILE, MEMORY_DIR } from "../config";
import { isAuthorized } from "../security";
import { existsSync, readFileSync } from "fs";

/**
 * /start - Show welcome message and status.
 */
export async function handleStart(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  const username = ctx.from?.username || "unknown";

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("未授權。請聯繫機器人擁有者取得存取權限。");
    return;
  }

  const status = session.isActive ? "對話進行中" : "無進行中的對話";
  const workDir = WORKING_DIR;

  await ctx.reply(
    `🤖 <b>Claude Telegram 機器人</b>\n\n` +
      `狀態：${status}\n` +
      `工作目錄：<code>${workDir}</code>\n\n` +
      `<b>指令：</b>\n` +
      `/new - 開始新對話\n` +
      `/stop - 停止目前查詢\n` +
      `/status - 顯示詳細狀態\n` +
      `/resume - 恢復上次對話\n` +
      `/retry - 重試上則訊息\n` +
      `/memory - 查看記憶狀態\n` +
      `/compact - 壓縮記憶\n` +
      `/restart - 重新啟動機器人\n\n` +
      `<b>提示：</b>\n` +
      `• 使用 <code>!</code> 前綴可中斷目前查詢\n` +
      `• 使用「think」關鍵字啟用延伸推理\n` +
      `• 說「記住...」讓我記住事情\n` +
      `• 可發送照片、語音或文件`,
    { parse_mode: "HTML" }
  );
}

/**
 * /new - Start a fresh session.
 */
export async function handleNew(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("未授權。");
    return;
  }

  // Stop any running query
  if (session.isRunning) {
    const result = await session.stop();
    if (result) {
      await Bun.sleep(100);
      session.clearStopRequested();
    }
  }

  // Clear session
  await session.kill();

  await ctx.reply("🆕 對話已清除。下則訊息將開始新對話。");
}

/**
 * /stop - Stop the current query (silently).
 */
export async function handleStop(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("未授權。");
    return;
  }

  if (session.isRunning) {
    const result = await session.stop();
    if (result) {
      // Wait for the abort to be processed, then clear stopRequested so next message can proceed
      await Bun.sleep(100);
      session.clearStopRequested();
    }
    // Silent stop - no message shown
  }
  // If nothing running, also stay silent
}

/**
 * /status - Show detailed status.
 */
export async function handleStatus(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("未授權。");
    return;
  }

  const lines: string[] = ["📊 <b>機器人狀態</b>\n"];

  // Session status
  if (session.isActive) {
    lines.push(`✅ 對話：進行中 (${session.sessionId?.slice(0, 8)}...)`);
  } else {
    lines.push("⚪ 對話：無");
  }

  // Query status
  if (session.isRunning) {
    const elapsed = session.queryStarted
      ? Math.floor((Date.now() - session.queryStarted.getTime()) / 1000)
      : 0;
    lines.push(`🔄 查詢：執行中 (${elapsed}秒)`);
    if (session.currentTool) {
      lines.push(`   └─ ${session.currentTool}`);
    }
  } else {
    lines.push("⚪ 查詢：閒置");
    if (session.lastTool) {
      lines.push(`   └─ 上次：${session.lastTool}`);
    }
  }

  // Last activity
  if (session.lastActivity) {
    const ago = Math.floor(
      (Date.now() - session.lastActivity.getTime()) / 1000
    );
    lines.push(`\n⏱️ 上次活動：${ago}秒前`);
  }

  // Usage stats
  if (session.lastUsage) {
    const usage = session.lastUsage;
    lines.push(
      `\n📈 上次查詢用量：`,
      `   輸入：${usage.input_tokens?.toLocaleString() || "?"} tokens`,
      `   輸出：${usage.output_tokens?.toLocaleString() || "?"} tokens`
    );
    if (usage.cache_read_input_tokens) {
      lines.push(
        `   快取讀取：${usage.cache_read_input_tokens.toLocaleString()}`
      );
    }
  }

  // Error status
  if (session.lastError) {
    const ago = session.lastErrorTime
      ? Math.floor((Date.now() - session.lastErrorTime.getTime()) / 1000)
      : "?";
    lines.push(`\n⚠️ 上次錯誤 (${ago}秒前)：`, `   ${session.lastError}`);
  }

  // Working directory
  lines.push(`\n📁 工作目錄：<code>${WORKING_DIR}</code>`);

  await ctx.reply(lines.join("\n"), { parse_mode: "HTML" });
}

/**
 * /resume - Show list of sessions to resume with inline keyboard.
 */
export async function handleResume(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("未授權。");
    return;
  }

  if (session.isActive) {
    await ctx.reply("對話已在進行中。使用 /new 開始新對話。");
    return;
  }

  // Get saved sessions
  const sessions = session.getSessionList();

  if (sessions.length === 0) {
    await ctx.reply("❌ 沒有已儲存的對話。");
    return;
  }

  // Build inline keyboard with session list
  const buttons = sessions.map((s) => {
    // Format date: "01/18 10:30"
    const date = new Date(s.saved_at);
    const dateStr = date.toLocaleDateString("zh-TW", {
      day: "2-digit",
      month: "2-digit",
    });
    const timeStr = date.toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Truncate title for button (max ~40 chars to fit)
    const titlePreview =
      s.title.length > 35 ? s.title.slice(0, 32) + "..." : s.title;

    return [
      {
        text: `📅 ${dateStr} ${timeStr} - "${titlePreview}"`,
        callback_data: `resume:${s.session_id}`,
      },
    ];
  });

  await ctx.reply("📋 <b>已儲存的對話</b>\n\n選擇要恢復的對話：", {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: buttons,
    },
  });
}

/**
 * /restart - Restart the bot process.
 */
export async function handleRestart(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("未授權。");
    return;
  }

  const msg = await ctx.reply("🔄 正在重新啟動機器人...");

  // Save message info so we can update it after restart
  if (chatId && msg.message_id) {
    try {
      await Bun.write(
        RESTART_FILE,
        JSON.stringify({
          chat_id: chatId,
          message_id: msg.message_id,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      console.warn("Failed to save restart info:", e);
    }
  }

  // Give time for the message to send
  await Bun.sleep(500);

  // Exit - launchd will restart us
  process.exit(0);
}

/**
 * /retry - Retry the last message (resume session and re-send).
 */
export async function handleRetry(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("未授權。");
    return;
  }

  // Check if there's a message to retry
  if (!session.lastMessage) {
    await ctx.reply("❌ 沒有可重試的訊息。");
    return;
  }

  // Check if something is already running
  if (session.isRunning) {
    await ctx.reply("⏳ 查詢正在執行中。請先使用 /stop 停止。");
    return;
  }

  const message = session.lastMessage;
  await ctx.reply(`🔄 重試中：「${message.slice(0, 50)}${message.length > 50 ? "..." : ""}」`);

  // Simulate sending the message again by emitting a fake text message event
  // We do this by directly calling the text handler logic
  const { handleText } = await import("./text");

  // Create a modified context with the last message
  const fakeCtx = {
    ...ctx,
    message: {
      ...ctx.message,
      text: message,
    },
  } as Context;

  await handleText(fakeCtx);
}

/**
 * /memory - Show memory system summary.
 */
export async function handleMemory(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("未授權。");
    return;
  }

  const indexPath = `${MEMORY_DIR}/index.json`;

  if (!existsSync(indexPath)) {
    await ctx.reply("❌ 記憶系統尚未初始化。");
    return;
  }

  try {
    const indexData = JSON.parse(readFileSync(indexPath, "utf-8"));
    const lines: string[] = ["🧠 <b>記憶系統狀態</b>\n"];

    // Total entries
    lines.push(`📊 總記憶數：${indexData.total_entries || 0}`);

    // Last updated
    if (indexData.last_updated) {
      const date = new Date(indexData.last_updated);
      lines.push(`⏱️ 最後更新：${date.toLocaleString("zh-TW")}`);
    }

    // Last compact
    if (indexData.last_compact) {
      const date = new Date(indexData.last_compact);
      lines.push(`🗜️ 最後壓縮：${date.toLocaleString("zh-TW")}`);
    }

    // Categories
    lines.push("\n<b>分類統計：</b>");
    const categories = indexData.categories || {};
    for (const [name, info] of Object.entries(categories)) {
      const catInfo = info as { count: number; keywords?: string[] };
      const count = catInfo.count || 0;
      const keywords = catInfo.keywords?.slice(0, 3).join(", ") || "";
      const keywordDisplay = keywords ? ` (${keywords})` : "";
      lines.push(`• ${name}：${count} 項${keywordDisplay}`);
    }

    // Suggestions
    const totalEntries = indexData.total_entries || 0;
    if (totalEntries > 80) {
      lines.push("\n⚠️ 記憶數量較多，建議執行 /compact 壓縮記憶。");
    }

    await ctx.reply(lines.join("\n"), { parse_mode: "HTML" });
  } catch (e) {
    console.error("Failed to read memory index:", e);
    await ctx.reply("❌ 讀取記憶索引失敗。");
  }
}

/**
 * /compact - Trigger memory compaction via Claude.
 */
export async function handleCompact(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;

  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("未授權。");
    return;
  }

  const indexPath = `${MEMORY_DIR}/index.json`;

  if (!existsSync(indexPath)) {
    await ctx.reply("❌ 記憶系統尚未初始化。");
    return;
  }

  // Check if something is already running
  if (session.isRunning) {
    await ctx.reply("⏳ 查詢正在執行中。請先使用 /stop 停止。");
    return;
  }

  await ctx.reply("🗜️ 開始壓縮記憶...");

  // Send compact command to Claude
  const { handleText } = await import("./text");

  const fakeCtx = {
    ...ctx,
    message: {
      ...ctx.message,
      text: "請執行記憶壓縮（compact）：讀取所有記憶分類，提取核心資訊，移除過時或重複內容，將歷史摘要存入 archives/compact_YYYY-MM.md，然後精簡各分類檔案，最後更新 index.json。",
    },
  } as Context;

  await handleText(fakeCtx);
}
