const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const { query } = require("../../../database/dbpromise");
const { processMessageTelegram } = require("./processTelegramInbox");

// Store active clients in memory
const activeClients = new Map();
const pendingClients = new Map();
const sessionMetadata = new Map();

function getErrorMessage(error) {
  const errorStr = error.message || error.toString();
  const errorMap = {
    PHONE_CODE_INVALID: "Invalid verification code. Please try again.",
    PHONE_CODE_EXPIRED: "Verification code expired. Please request a new code.",
    PHONE_NUMBER_INVALID: "Invalid phone number format.",
    SESSION_PASSWORD_NEEDED: "Two-factor authentication enabled. Password required.",
    AUTH_KEY_UNREGISTERED: "Session expired. Please create a new session.",
    USER_DEACTIVATED: "This account has been deactivated.",
    PHONE_NUMBER_BANNED: "This phone number is banned from Telegram.",
    TIMEOUT: "Connection timeout. Please try again.",
    FLOOD_WAIT: "Too many requests. Please wait a moment.",
  };
  for (const [key, message] of Object.entries(errorMap)) {
    if (errorStr.includes(key)) return message;
  }
  return errorStr;
}

async function getUserProfile(client) {
  try {
    const me = await client.getMe();
    return {
      id: me.id?.toString(),
      username: me.username || "",
      firstName: me.firstName || "",
      lastName: me.lastName || "",
      phone: me.phone || "",
    };
  } catch (err) {
    console.error("getUserProfile error:", err);
    return null;
  }
}

function setupMessageListener(client, title, sessionId) {
  try {
    client.addEventHandler(async (event) => {
      try {
        const message = event.message;
        if (!message || message.out) return;

        const meta = sessionMetadata.get(sessionId);
        if (!meta) return;

        await processMessageTelegram({
          getSession: (sid) => activeClients.get(sid),
          message,
          sessionId,
          type: "upsert",
          uid: meta.uid,
          userData: meta.userData,
        });
      } catch (err) {
        console.error(`[Telegram] Message handler error for ${sessionId}:`, err.message);
      }
    }, new NewMessage({}));

    console.log(`[Telegram] Message listener set up for session: ${sessionId}`);
    return true;
  } catch (err) {
    console.error("setupMessageListener error:", err);
    return false;
  }
}

function getSession(sid) {
  return activeClients.get(sid) || null;
}

async function initTele() {
  try {
    const sessions = await query(
      `SELECT * FROM telegram_session WHERE status = ?`,
      ["active"]
    );

    console.log(`[Telegram] Initializing ${sessions.length} session(s)...`);

    for (const session of sessions) {
      try {
        await connectSession(session.id, false);
      } catch (err) {
        console.error(`[Telegram] Failed to init session ${session.id}:`, err.message);
      }
    }
    return true;
  } catch (err) {
    console.error("initTele error:", err);
    return false;
  }
}

async function connectSession(sessionId, isNew = false) {
  try {
    const [sessionData] = await query(
      `SELECT * FROM telegram_session WHERE id = ?`,
      [sessionId]
    );

    if (!sessionData) {
      return { success: false, message: "Session not found" };
    }

    const [apiKeys] = await query(`SELECT teleAppId, teleHash FROM web_private`, []);
    if (!apiKeys?.teleAppId || !apiKeys?.teleHash) {
      return { success: false, message: "Telegram API credentials not configured. Please contact admin." };
    }

    const stringSession = new StringSession(sessionData.session_data || "");
    const client = new TelegramClient(
      stringSession,
      parseInt(apiKeys.teleAppId),
      apiKeys.teleHash,
      { connectionRetries: 3, timeout: 30 }
    );

    await client.connect();

    if (!await client.isUserAuthorized()) {
      return { success: false, message: "Session expired. Please reconnect." };
    }

    activeClients.set(sessionId, client);

    const [user] = await query(`SELECT * FROM user WHERE uid = ?`, [sessionData.uid]);
    sessionMetadata.set(sessionId, { uid: sessionData.uid, userData: user });

    setupMessageListener(client, sessionData.phone, sessionId);

    await query(`UPDATE telegram_session SET status = ? WHERE id = ?`, ["active", sessionId]);

    console.log(`[Telegram] Session ${sessionId} connected successfully`);
    return { success: true, message: "Session connected" };
  } catch (err) {
    console.error("connectSession error:", err);
    return { success: false, message: getErrorMessage(err) };
  }
}

async function createSession(uid, title, phoneNumber, sessionId, apiId, apiHash) {
  try {
    const stringSession = new StringSession("");
    const client = new TelegramClient(
      stringSession,
      parseInt(apiId),
      apiHash,
      { connectionRetries: 3, timeout: 30 }
    );

    await client.connect();

    await client.sendCode({ apiId: parseInt(apiId), apiHash }, phoneNumber);

    pendingClients.set(sessionId, { client, phoneNumber, apiId, apiHash, uid, title });

    // Save pending session to DB
    const existing = await query(`SELECT * FROM telegram_session WHERE id = ?`, [sessionId]);
    if (existing.length > 0) {
      await query(
        `UPDATE telegram_session SET uid = ?, phone = ?, status = ? WHERE id = ?`,
        [uid, phoneNumber, "pending", sessionId]
      );
    } else {
      await query(
        `INSERT INTO telegram_session (id, uid, phone, status, session_data) VALUES (?,?,?,?,?)`,
        [sessionId, uid, phoneNumber, "pending", ""]
      );
    }

    console.log(`[Telegram] OTP sent to ${phoneNumber} for session ${sessionId}`);
    return { success: true, message: "OTP sent successfully. Please check your Telegram app." };
  } catch (err) {
    console.error("createSession error:", err);
    return { success: false, message: getErrorMessage(err) };
  }
}

async function verifyCode(sessionId, code) {
  try {
    const pending = pendingClients.get(sessionId);
    if (!pending) {
      return { success: false, message: "Session not found or expired. Please start over." };
    }

    const { client, phoneNumber, apiId, apiHash, uid } = pending;

    await client.signIn(
      { apiId: parseInt(apiId), apiHash },
      { phoneNumber, phoneCode: async () => code, onError: (err) => { throw err; } }
    );

    const sessionString = client.session.save();

    await query(
      `UPDATE telegram_session SET session_data = ?, status = ? WHERE id = ?`,
      [sessionString, "active", sessionId]
    );

    activeClients.set(sessionId, client);
    pendingClients.delete(sessionId);

    const [user] = await query(`SELECT * FROM user WHERE uid = ?`, [uid]);
    sessionMetadata.set(sessionId, { uid, userData: user });

    setupMessageListener(client, phoneNumber, sessionId);

    console.log(`[Telegram] Session ${sessionId} verified and connected`);
    return { success: true, message: "Telegram account connected successfully!" };
  } catch (err) {
    console.error("verifyCode error:", err);
    return { success: false, message: getErrorMessage(err) };
  }
}

async function getSessionStatus(sessionId) {
  try {
    const client = activeClients.get(sessionId);
    if (!client) {
      return { success: true, connected: false, profile: null };
    }

    const isAuthorized = await client.isUserAuthorized();
    if (!isAuthorized) {
      return { success: true, connected: false, profile: null };
    }

    const profile = await getUserProfile(client);
    return { success: true, connected: true, profile };
  } catch (err) {
    console.error("getSessionStatus error:", err);
    return { success: false, connected: false, message: err.message };
  }
}

async function getUserSessions(uid) {
  try {
    const sessions = await query(
      `SELECT id, uid, phone, status, createdAt FROM telegram_session WHERE uid = ?`,
      [uid]
    );

    const enriched = await Promise.all(
      sessions.map(async (s) => {
        const client = activeClients.get(s.id);
        let profile = null;
        if (client) {
          try { profile = await getUserProfile(client); } catch {}
        }
        return { ...s, connected: !!client, profile };
      })
    );

    return enriched;
  } catch (err) {
    console.error("getUserSessions error:", err);
    return [];
  }
}

async function deleteSession(sessionId) {
  try {
    const client = activeClients.get(sessionId);
    if (client) {
      try { await client.disconnect(); } catch {}
      activeClients.delete(sessionId);
    }
    pendingClients.delete(sessionId);
    sessionMetadata.delete(sessionId);

    await query(`DELETE FROM telegram_session WHERE id = ?`, [sessionId]);

    return { success: true, message: "Session deleted" };
  } catch (err) {
    console.error("deleteSession error:", err);
    return { success: false, message: err.message };
  }
}

async function disconnectSession(sessionId) {
  try {
    const client = activeClients.get(sessionId);
    if (client) {
      try { await client.disconnect(); } catch {}
      activeClients.delete(sessionId);
    }
    sessionMetadata.delete(sessionId);
    await query(`UPDATE telegram_session SET status = ? WHERE id = ?`, ["inactive", sessionId]);
    return { success: true, message: "Session disconnected" };
  } catch (err) {
    console.error("disconnectSession error:", err);
    return { success: false, message: err.message };
  }
}

async function sendMessage(sessionId, chatId, message) {
  try {
    const client = activeClients.get(sessionId);
    if (!client) return { success: false, message: "Session not connected" };

    await client.sendMessage(chatId, { message });
    return { success: true, message: "Message sent" };
  } catch (err) {
    console.error("sendMessage error:", err);
    return { success: false, message: getErrorMessage(err) };
  }
}

async function getChats(sessionId, limit = 50) {
  try {
    const client = activeClients.get(sessionId);
    if (!client) return [];

    const dialogs = await client.getDialogs({ limit });
    return dialogs.map((d) => ({
      id: d.id?.toString(),
      title: d.title || d.name || "Unknown",
      unreadCount: d.unreadCount || 0,
      isGroup: d.isGroup || false,
      isChannel: d.isChannel || false,
    }));
  } catch (err) {
    console.error("getChats error:", err);
    return [];
  }
}

function checkTele(sessionId) {
  return activeClients.has(sessionId);
}

async function cleanupTele() {
  try {
    for (const [sessionId, client] of activeClients.entries()) {
      try { await client.disconnect(); } catch {}
    }
    activeClients.clear();
    pendingClients.clear();
    sessionMetadata.clear();
    console.log("[Telegram] Cleanup complete");
    return true;
  } catch (err) {
    console.error("cleanupTele error:", err);
    return false;
  }
}

function checkTelePlugin() {
  return true;
}

module.exports = {
  initTele,
  checkTelePlugin,
  createSession,
  verifyCode,
  connectSession,
  disconnectSession,
  deleteSession,
  sendMessage,
  getChats,
  getUserSessions,
  getSessionStatus,
  cleanupTele,
  checkTele,
  getSession,
};
