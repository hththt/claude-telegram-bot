/**
 * Audio handler for Claude Telegram Bot.
 *
 * Handles native Telegram audio messages and audio files sent as documents.
 * Transcribes using OpenAI (same as voice messages) then processes with Claude.
 */

import type { Context } from "grammy";
import { unlinkSync } from "fs";
import { session } from "../session";
import { ALLOWED_USERS, TEMP_DIR, TRANSCRIPTION_AVAILABLE } from "../config";
import { isAuthorized, rateLimiter } from "../security";
import {
  auditLog,
  auditLogRateLimit,
  transcribeVoice,
  startTypingIndicator,
} from "../utils";
import { StreamingState, createStatusCallback } from "./streaming";

// Supported audio file extensions
const AUDIO_EXTENSIONS = [
  ".mp3",
  ".m4a",
  ".ogg",
  ".wav",
  ".aac",
  ".flac",
  ".opus",
  ".wma",
];

/**
 * Check if a file is an audio file by extension or mime type.
 */
export function isAudioFile(fileName?: string, mimeType?: string): boolean {
  if (mimeType?.startsWith("audio/")) {
    return true;
  }
  if (fileName) {
    const ext = "." + (fileName.split(".").pop() || "").toLowerCase();
    return AUDIO_EXTENSIONS.includes(ext);
  }
  return false;
}

/**
 * Process an audio file: transcribe and send to Claude.
 */
export async function processAudioFile(
  ctx: Context,
  filePath: string,
  caption: string | undefined,
  userId: number,
  username: string,
  chatId: number
): Promise<void> {
  if (!TRANSCRIPTION_AVAILABLE) {
    await ctx.reply(
      "語音轉錄功能未設定。請在 .env 中設定 OPENAI_API_KEY"
    );
    return;
  }

  const stopProcessing = session.startProcessing();
  const typing = startTypingIndicator(ctx);

  try {
    // Transcribe
    const statusMsg = await ctx.reply("🎤 正在轉錄音訊...");

    const transcript = await transcribeVoice(filePath);
    if (!transcript) {
      await ctx.api.editMessageText(
        chatId,
        statusMsg.message_id,
        "❌ 轉錄失敗。"
      );
      return;
    }

    // Show transcript
    const maxDisplay = 4000;
    const displayTranscript =
      transcript.length > maxDisplay
        ? transcript.slice(0, maxDisplay) + "…"
        : transcript;
    await ctx.api.editMessageText(
      chatId,
      statusMsg.message_id,
      `🎤 「${displayTranscript}」`
    );

    // Build prompt: transcript + optional caption
    const prompt = caption
      ? `${transcript}\n\n---\n\n${caption}`
      : transcript;

    // Set conversation title (if new session)
    if (!session.isActive) {
      const title =
        transcript.length > 50
          ? transcript.slice(0, 47) + "..."
          : transcript;
      session.conversationTitle = title;
    }

    // Create streaming state and callback
    const state = new StreamingState();
    const statusCallback = createStatusCallback(ctx, state);

    // Send to Claude
    const claudeResponse = await session.sendMessageStreaming(
      prompt,
      username,
      userId,
      statusCallback,
      chatId,
      ctx
    );

    // Audit log
    await auditLog(userId, username, "AUDIO", transcript, claudeResponse);
  } catch (error) {
    console.error("Error processing audio:", error);

    if (String(error).includes("abort") || String(error).includes("cancel")) {
      const wasInterrupt = session.consumeInterruptFlag();
      if (!wasInterrupt) {
        await ctx.reply("🛑 查詢已停止。");
      }
    } else {
      await ctx.reply(`❌ 錯誤：${String(error).slice(0, 200)}`);
    }
  } finally {
    stopProcessing();
    typing.stop();

    // Clean up audio file
    try {
      unlinkSync(filePath);
    } catch (error) {
      console.debug("Failed to delete audio file:", error);
    }
  }
}

/**
 * Handle incoming native Telegram audio messages.
 */
export async function handleAudio(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  const username = ctx.from?.username || "unknown";
  const chatId = ctx.chat?.id;
  const audio = ctx.message?.audio;

  if (!userId || !chatId || !audio) {
    return;
  }

  // 1. Authorization check
  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("未授權。請聯繫機器人擁有者取得存取權限。");
    return;
  }

  // 2. Rate limit check
  const [allowed, retryAfter] = rateLimiter.check(userId);
  if (!allowed) {
    await auditLogRateLimit(userId, username, retryAfter!);
    await ctx.reply(
      `⏳ 已達速率限制。請等待 ${retryAfter!.toFixed(1)} 秒。`
    );
    return;
  }

  console.log(`Received audio from @${username}`);

  // 3. Download audio file
  let audioPath: string;
  try {
    const file = await ctx.getFile();
    const timestamp = Date.now();
    const ext = audio.file_name?.split(".").pop() || "mp3";
    audioPath = `${TEMP_DIR}/audio_${timestamp}.${ext}`;

    const response = await fetch(
      `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`
    );
    const buffer = await response.arrayBuffer();
    await Bun.write(audioPath, buffer);
  } catch (error) {
    console.error("Failed to download audio:", error);
    await ctx.reply("❌ 下載音訊檔案失敗。");
    return;
  }

  // 4. Process audio
  await processAudioFile(
    ctx,
    audioPath,
    ctx.message?.caption,
    userId,
    username,
    chatId
  );
}
