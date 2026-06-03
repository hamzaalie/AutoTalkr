const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const { query } = require("../../../database/dbpromise");
const randomstring = require("randomstring");

function generateMessageId() {
  return `tele_${Date.now()}_${randomstring.generate(6)}`;
}

function formatTelegramId(id) {
  if (!id) return null;
  return String(id).replace(/[^0-9]/g, "");
}

async function downloadTelegramMedia(client, message, sessionId) {
  try {
    const mediaDir = path.join(process.cwd(), "client", "public", "media");
    if (!fsSync.existsSync(mediaDir)) fsSync.mkdirSync(mediaDir, { recursive: true });

    const ext = message.photo ? "jpg" : message.video ? "mp4" : message.voice ? "ogg" : message.audio ? "mp3" : "bin";
    const filename = `tele_${randomstring.generate(16)}.${ext}`;
    const filePath = path.join(mediaDir, filename);

    await client.downloadMedia(message, { outputFile: filePath });
    return filename;
  } catch (err) {
    console.error("downloadTelegramMedia error:", err.message);
    return null;
  }
}

async function downloadProfilePicture(client, userId, sessionId) {
  try {
    const mediaDir = path.join(process.cwd(), "client", "public", "media");
    if (!fsSync.existsSync(mediaDir)) fsSync.mkdirSync(mediaDir, { recursive: true });

    const filename = `tele_pfp_${userId}.jpg`;
    const filePath = path.join(mediaDir, filename);

    if (fsSync.existsSync(filePath)) return filename;

    const entity = await client.getEntity(userId);
    await client.downloadProfilePhoto(entity, { outputFile: filePath });
    return filename;
  } catch (err) {
    return null;
  }
}

function processTextMessage(message) {
  return {
    type: "text",
    text: { body: message.text || message.message || "" },
  };
}

async function processImageMessage(client, message, sessionId) {
  const filename = await downloadTelegramMedia(client, message, sessionId);
  return {
    type: "image",
    image: {
      url: filename ? `/media/${filename}` : null,
      caption: message.message || "",
      filename,
    },
  };
}

async function processVideoMessage(client, message, sessionId) {
  const filename = await downloadTelegramMedia(client, message, sessionId);
  return {
    type: "video",
    video: {
      url: filename ? `/media/${filename}` : null,
      caption: message.message || "",
      filename,
    },
  };
}

async function processAudioMessage(client, message, sessionId) {
  const filename = await downloadTelegramMedia(client, message, sessionId);
  return {
    type: "audio",
    audio: {
      url: filename ? `/media/${filename}` : null,
      filename,
    },
  };
}

async function processDocumentMessage(client, message, sessionId) {
  const filename = await downloadTelegramMedia(client, message, sessionId);
  return {
    type: "document",
    document: {
      url: filename ? `/media/${filename}` : null,
      filename: message.document?.attributes?.[0]?.fileName || filename,
    },
  };
}

async function processStickerMessage(client, message, sessionId) {
  return {
    type: "sticker",
    sticker: { emoji: message.sticker?.alt || "🎭" },
  };
}

function processLocationMessage(message) {
  return {
    type: "location",
    location: {
      latitude: message.geo?.lat || 0,
      longitude: message.geo?.long || 0,
    },
  };
}

function processContactMessage(message) {
  return {
    type: "contacts",
    contacts: [{
      name: { formatted_name: `${message.contact?.firstName || ""} ${message.contact?.lastName || ""}`.trim() },
      phones: [{ phone: message.contact?.phoneNumber || "" }],
    }],
  };
}

function processPollMessage(message) {
  return {
    type: "text",
    text: { body: `📊 Poll: ${message.poll?.poll?.question || ""}` },
  };
}

async function getSenderInfo(client, message, sessionId) {
  try {
    const sender = await message.getSender();
    if (!sender) return { id: null, name: "Unknown", username: "" };

    const pfp = await downloadProfilePicture(client, sender.id, sessionId);
    return {
      id: sender.id?.toString(),
      name: `${sender.firstName || ""} ${sender.lastName || ""}`.trim() || sender.username || "Unknown",
      username: sender.username || "",
      phone: sender.phone || "",
      profilePic: pfp ? `/media/${pfp}` : null,
    };
  } catch (err) {
    return { id: null, name: "Unknown", username: "" };
  }
}

async function extractUserDetails(client, userId) {
  try {
    const entity = await client.getEntity(userId);
    return {
      id: entity.id?.toString(),
      name: `${entity.firstName || ""} ${entity.lastName || ""}`.trim() || entity.title || "Unknown",
      username: entity.username || "",
      phone: entity.phone || "",
    };
  } catch (err) {
    return null;
  }
}

async function extractChatDetails(client, chatId) {
  try {
    const entity = await client.getEntity(chatId);
    return {
      id: entity.id?.toString(),
      title: entity.title || entity.username || "Unknown",
      isGroup: !!entity.megagroup || !!entity.gigagroup,
      isChannel: !!entity.broadcast,
    };
  } catch (err) {
    return null;
  }
}

async function saveMessageToDatabase(messageData, chatId, uid) {
  try {
    const { saveMessageToConversation } = require("../../../functions/function");
    await saveMessageToConversation({ uid, chatId, messageData, sentBy: "telegram" });
    return true;
  } catch (err) {
    console.error("saveMessageToDatabase error:", err);
    return false;
  }
}

async function updateChatInDatabase(messageData, uid, senderInfo, sessionId) {
  try {
    const senderMobile = senderInfo.phone || senderInfo.id || randomstring.generate(10);
    const senderName = senderInfo.name || "Telegram User";

    const [existing] = await query(
      `SELECT * FROM beta_chats WHERE uid = ? AND sender_mobile = ? AND origin = ? LIMIT 1`,
      [uid, senderMobile, "telegram"]
    );

    let chatId;
    if (existing) {
      chatId = existing.chat_id;
      await query(
        `UPDATE beta_chats SET last_message = ?, sender_name = ? WHERE chat_id = ? AND uid = ?`,
        [JSON.stringify(messageData), senderName, chatId, uid]
      );
    } else {
      chatId = randomstring.generate(20);
      await query(
        `INSERT INTO beta_chats
          (uid, chat_id, sender_mobile, sender_name, origin, origin_instance_id, last_message, createdAt)
         VALUES (?,?,?,?,?,?,?,?)`,
        [uid, chatId, senderMobile, senderName, "telegram", sessionId,
          JSON.stringify(messageData), new Date()]
      );
    }

    return { chatId, senderMobile, senderName };
  } catch (err) {
    console.error("updateChatInDatabase error:", err);
    return null;
  }
}

async function processMessageTelegram({ getSession, message, sessionId, type = "upsert", uid, userData }) {
  try {
    if (!message || !uid) return null;
    if (message.out) return null; // skip outgoing

    const client = getSession(sessionId);
    if (!client) return null;

    const { getCurrentTimestampInTimeZone } = require("../../../functions/function");
    const { processAutomation } = require("../../../automation/automation");

    const senderInfo = await getSenderInfo(client, message, sessionId);
    if (!senderInfo.id) return null;

    // Determine message type and build msgContext
    let msgContext;
    if (message.photo) {
      msgContext = await processImageMessage(client, message, sessionId);
    } else if (message.video || message.videoNote) {
      msgContext = await processVideoMessage(client, message, sessionId);
    } else if (message.voice || message.audio) {
      msgContext = await processAudioMessage(client, message, sessionId);
    } else if (message.document) {
      msgContext = await processDocumentMessage(client, message, sessionId);
    } else if (message.sticker) {
      msgContext = await processStickerMessage(client, message, sessionId);
    } else if (message.geo) {
      msgContext = processLocationMessage(message);
    } else if (message.contact) {
      msgContext = processContactMessage(message);
    } else if (message.poll) {
      msgContext = processPollMessage(message);
    } else {
      msgContext = processTextMessage(message);
    }

    const [user] = await query(`SELECT * FROM user WHERE uid = ? LIMIT 1`, [uid]);
    const userTimezone = getCurrentTimestampInTimeZone(user?.timezone || "Asia/Kolkata");

    const messageData = {
      type: msgContext.type,
      metaChatId: generateMessageId(),
      msgContext,
      reaction: "",
      timestamp: parseInt(userTimezone),
      senderName: senderInfo.name,
      senderMobile: senderInfo.phone || senderInfo.id,
      star: 0,
      route: "INCOMING",
      context: null,
      origin: "telegram",
    };

    const chatResult = await updateChatInDatabase(messageData, uid, senderInfo, sessionId);
    if (!chatResult) return null;

    await saveMessageToDatabase(messageData, chatResult.chatId, uid);

    // Fire automation
    if (msgContext.type === "text") {
      await processAutomation({
        uid,
        message: {
          senderMobile: chatResult.senderMobile,
          senderName: chatResult.senderName,
          msgContext,
        },
        user: userData,
        sessionId,
        origin: "telegram",
        chatId: chatResult.chatId,
      });
    }

    return { messageData, chatId: chatResult.chatId };
  } catch (err) {
    console.error("processMessageTelegram error:", err);
    return null;
  }
}

function setTelegramMsgObj(obj) {
  return obj;
}

function extractTelegramChatId(chatId) {
  if (!chatId) return null;
  return String(chatId).replace(/[^0-9\-]/g, "");
}

async function getTelegramSessionFromChat(chatInfo, uid) {
  try {
    const [session] = await query(
      `SELECT * FROM telegram_session WHERE uid = ? AND status = ? LIMIT 1`,
      [uid, "active"]
    );
    return session || null;
  } catch (err) {
    return null;
  }
}

async function uploadFileToTelegram(client, filePath) {
  try {
    const { CustomFile } = require("telegram/client/uploads");
    const fileBuffer = await fs.readFile(filePath);
    const filename = path.basename(filePath);
    const uploaded = await client.uploadFile({
      file: new CustomFile(filename, fileBuffer.length, filePath, fileBuffer),
      workers: 1,
    });
    return uploaded;
  } catch (err) {
    console.error("uploadFileToTelegram error:", err);
    return null;
  }
}

async function sendMessageTelegram({ uid, to, msgObj, chatInfo }) {
  try {
    const [session] = await query(
      `SELECT * FROM telegram_session WHERE uid = ? AND status = ? LIMIT 1`,
      [uid, "active"]
    );
    if (!session) return { success: false, msg: "No active Telegram session found" };

    const { getSession } = require("./tele");
    const client = getSession(session.id);
    if (!client) return { success: false, msg: "Telegram session not connected" };

    const chatId = to || chatInfo?.id;
    if (!chatId) return { success: false, msg: "No chat ID provided" };

    if (msgObj?.type === "text") {
      await client.sendMessage(chatId, { message: msgObj?.text?.body || "" });
    } else if (msgObj?.type === "image" && msgObj?.image?.filename) {
      const filePath = path.join(process.cwd(), "client", "public", "media", msgObj.image.filename);
      if (fsSync.existsSync(filePath)) {
        await client.sendFile(chatId, { file: filePath, caption: msgObj.image.caption || "" });
      }
    } else if (msgObj?.type === "document" && msgObj?.document?.filename) {
      const filePath = path.join(process.cwd(), "client", "public", "media", msgObj.document.filename);
      if (fsSync.existsSync(filePath)) {
        await client.sendFile(chatId, { file: filePath });
      }
    } else {
      await client.sendMessage(chatId, { message: JSON.stringify(msgObj) });
    }

    return { success: true, msg: "Message sent via Telegram" };
  } catch (err) {
    console.error("sendMessageTelegram error:", err);
    return { success: false, msg: err.message };
  }
}

async function sendNewTelegramMessage({ sessionId, message, username, userId }) {
  try {
    const { getSession } = require("./tele");
    const client = getSession(sessionId);
    if (!client) return { success: false, msg: "Session not connected" };

    const target = username ? `@${username}` : userId;
    await client.sendMessage(target, { message });
    return { success: true, msg: "Message sent" };
  } catch (err) {
    console.error("sendNewTelegramMessage error:", err);
    return { success: false, msg: err.message };
  }
}

module.exports = {
  processMessageTelegram,
  formatTelegramId,
  extractUserDetails,
  extractChatDetails,
  sendMessageTelegram,
  sendNewTelegramMessage,
  setTelegramMsgObj,
  extractTelegramChatId,
  getTelegramSessionFromChat,
  uploadFileToTelegram,
};
