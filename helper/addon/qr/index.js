const fs = require("fs");
const path = require("path");
const pino = require("pino");
const { toDataURL } = require("qrcode");
const { query } = require("../../../database/dbpromise");

const sessions = new Map();
const SESSION_DIR = path.join(process.cwd(), "sessions");

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

function checkQr() {
  return true;
}

function isSessionExists(id) {
  return sessions.has(id);
}

function getSession(id) {
  return sessions.get(id) || null;
}

async function deleteSession(id) {
  const session = sessions.get(id);
  if (session) {
    try { await session.logout(); } catch {}
    try { session.end(); } catch {}
    sessions.delete(id);
  }
  const sessionPath = path.join(SESSION_DIR, id);
  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true, force: true });
  }
}

async function createSession(uniqueId, label) {
  try {
    const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require("baileys");
    const { sendToUid } = require("../../../socket");

    const sessionPath = path.join(SESSION_DIR, uniqueId);
    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      browser: ["AutoTalkr", "Chrome", "1.0.0"],
      markOnlineOnConnect: false,
    });

    sessions.set(uniqueId, sock);

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        try {
          const qrImage = await toDataURL(qr);
          const rows = await query(`SELECT uid FROM instance WHERE uniqueId = ?`, [uniqueId]);
          if (rows && rows.length > 0) {
            sendToUid(rows[0].uid, { qr: qrImage, uniqueId }, "qr_code");
          }
          await query(`UPDATE instance SET status = 'GENERATING' WHERE uniqueId = ?`, [uniqueId]);
        } catch (e) {
          console.error("QR generation error:", e?.message);
        }
      }

      if (connection === "open") {
        const info = sock.user;
        const number = info?.id?.split(":")[0] || info?.id?.split("@")[0] || "";
        await query(
          `UPDATE instance SET status = 'ACTIVE', number = ? WHERE uniqueId = ?`,
          [number, uniqueId]
        );
        const rows = await query(`SELECT uid FROM instance WHERE uniqueId = ?`, [uniqueId]);
        if (rows && rows.length > 0) {
          sendToUid(rows[0].uid, { uniqueId, number, status: "ACTIVE" }, "session_connected");
        }
        console.log(`QR Session connected: ${uniqueId} - ${number}`);
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        await query(`UPDATE instance SET status = 'INACTIVE' WHERE uniqueId = ?`, [uniqueId]);
        sessions.delete(uniqueId);
        if (shouldReconnect) {
          console.log(`Reconnecting session: ${uniqueId}`);
          setTimeout(() => createSession(uniqueId, label), 5000);
        } else {
          console.log(`Session logged out: ${uniqueId}`);
        }
      }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;
      for (const msg of messages) {
        if (!msg.key?.remoteJid) continue;
        try {
          const rows = await query(`SELECT uid FROM instance WHERE uniqueId = ?`, [uniqueId]);
          if (!rows || rows.length === 0) continue;
          const uid = rows[0].uid;
          const { processMessage } = require("../../inbox/inbox");
          await processMessage({ body: msg, uid, origin: "qr", getSession, sessionId: uniqueId, qrType: "baileys" });
        } catch (e) {
          console.error("QR message processing error:", e?.message);
        }
      }
    });

    return sock;
  } catch (err) {
    console.error("createSession error:", err?.message);
    await query(`UPDATE instance SET status = 'INACTIVE' WHERE uniqueId = ?`, [uniqueId]).catch(() => {});
  }
}

async function init() {
  try {
    const instances = await query(`SELECT * FROM instance WHERE status = 'ACTIVE'`, []);
    if (!instances || instances.length === 0) return;
    console.log(`Restoring ${instances.length} QR sessions...`);
    for (const inst of instances) {
      await createSession(inst.uniqueId, inst.title);
      await new Promise(r => setTimeout(r, 1000));
    }
  } catch (e) {
    console.error("QR init error:", e?.message);
  }
}

async function sendMessage(session, jid, content) {
  try {
    return await session.sendMessage(jid, content);
  } catch (e) {
    return Promise.reject(e);
  }
}

async function isExists(session, jid) {
  try {
    const [result] = await session.onWhatsApp(jid);
    return !!result?.exists;
  } catch {
    return false;
  }
}

const formatPhone = (phone) => {
  if (phone.endsWith("@s.whatsapp.net")) return phone;
  let formatted = phone.replace(/\D/g, "");
  return formatted + "@s.whatsapp.net";
};

const formatGroup = (group) => {
  if (group.endsWith("@g.us")) return group;
  let formatted = group.replace(/[^\d-]/g, "");
  return formatted + "@g.us";
};

const cleanup = async () => {
  for (const [id, session] of sessions) {
    try { await session.logout(); } catch {}
  }
  sessions.clear();
};

const getGroupData = async (session, jid) => {
  try {
    return await session.groupMetadata(jid);
  } catch {
    return null;
  }
};

function downloadMediaMessage(msg) {
  try {
    const { downloadMediaMessage: dl } = require("baileys");
    return dl(msg);
  } catch { return null; }
}

function getUrlInfo() {}
function generateProfilePicture() {}

const getStorageConfig = async () => ({
  method: "local",
  mongoUri: "not set",
  mysqlHost: "localhost",
});

module.exports = {
  isSessionExists,
  createSession,
  getSession,
  deleteSession,
  isExists,
  sendMessage,
  formatPhone,
  formatGroup,
  cleanup,
  init,
  getGroupData,
  getUrlInfo,
  downloadMediaMessage,
  checkQr,
  generateProfilePicture,
  getStorageConfig,
};
