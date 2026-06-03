const { query } = require("../../../database/dbpromise");
const fetch = require("node-fetch");

// Resolve Instagram account from webhook business ID
async function resolveAccountFromWebhook(igBusinessId) {
  try {
    const accounts = await query(
      `SELECT * FROM instagram_accounts WHERE webhook_id = ? OR ig_graph_id = ? LIMIT 1`,
      [igBusinessId, igBusinessId]
    );
    return accounts.length > 0 ? accounts[0] : null;
  } catch (err) {
    console.error("resolveAccountFromWebhook error:", err);
    return null;
  }
}

// Process incoming Instagram DM
async function processInstaMessage({ body, uid }) {
  try {
    const entry = body?.entry?.[0];
    if (!entry) return { newMessage: null, chatId: null, sessionId: null };

    const igBusinessId = String(entry.id);
    const messaging = entry?.messaging?.[0];
    if (!messaging) return { newMessage: null, chatId: null, sessionId: null };

    const senderId = String(messaging.sender?.id);
    const messageObj = messaging.message;

    if (!messageObj || !senderId) {
      return { newMessage: null, chatId: null, sessionId: null };
    }

    // Skip echo messages (sent by the business itself)
    if (messageObj.is_echo) {
      return { newMessage: null, chatId: null, sessionId: null };
    }

    const igAccount = await resolveAccountFromWebhook(igBusinessId);
    if (!igAccount) {
      return { newMessage: null, chatId: null, sessionId: null };
    }

    const randomstring = require("randomstring");
    const { getCurrentTimestampInTimeZone, saveMessageToConversation } = require("../../../functions/function");
    const { processAutomation } = require("../../../automation/automation");

    const [user] = await query(`SELECT * FROM user WHERE uid = ? LIMIT 1`, [uid]);
    if (!user) return { newMessage: null, chatId: null, sessionId: null };

    const senderMobile = senderId;
    const senderName = messaging.sender?.username || "Instagram User";

    // Find or create chat
    const [existingChat] = await query(
      `SELECT * FROM beta_chats WHERE uid = ? AND sender_mobile = ? AND origin = ? LIMIT 1`,
      [uid, senderMobile, "instagram"]
    );

    let chatId;
    if (existingChat) {
      chatId = existingChat.chat_id;
    } else {
      chatId = randomstring.generate(20);
      await query(
        `INSERT INTO beta_chats
          (uid, chat_id, sender_mobile, sender_name, origin, origin_instance_id, last_message, createdAt)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          uid,
          chatId,
          senderMobile,
          senderName,
          "instagram",
          JSON.stringify({ id: igAccount.user_id, username: igAccount.username, name: igAccount.name || "" }),
          JSON.stringify({ type: "text", text: { body: messageObj.text || "" } }),
          new Date(),
        ]
      );
    }

    const userTimezone = getCurrentTimestampInTimeZone(user?.timezone || "Asia/Kolkata");

    const messageData = {
      type: "text",
      metaChatId: messageObj.mid || randomstring.generate(10),
      msgContext: { type: "text", text: { body: messageObj.text || "" } },
      reaction: "",
      timestamp: parseInt(userTimezone),
      senderName,
      senderMobile,
      star: 0,
      route: "INCOMING",
      context: null,
      origin: "instagram",
    };

    await saveMessageToConversation({ uid, chatId, messageData, sentBy: "instagram" });

    await query(
      `UPDATE beta_chats SET last_message = ?, sender_name = ? WHERE chat_id = ? AND uid = ?`,
      [JSON.stringify(messageData), senderName, chatId, uid]
    );

    // Fire automation
    await processAutomation({
      uid,
      message: {
        senderMobile,
        senderName,
        msgContext: { type: "text", text: { body: messageObj.text || "" } },
      },
      user,
      sessionId: igAccount.user_id,
      origin: "instagram",
      chatId,
    });

    return { newMessage: messageData, chatId, sessionId: igAccount.user_id };
  } catch (err) {
    console.error("processInstaMessage error:", err);
    return { newMessage: null, chatId: null, sessionId: null };
  }
}

// Process Instagram comment
async function processInstaComment({ igAccount, commentData, uid }) {
  try {
    if (!commentData?.from?.id) return { message: null, chatId: null };

    const randomstring = require("randomstring");
    const { getCurrentTimestampInTimeZone, saveMessageToConversation } = require("../../../functions/function");

    const [user] = await query(`SELECT * FROM user WHERE uid = ? LIMIT 1`, [uid]);
    if (!user) return { message: null, chatId: null };

    const commenterId = String(commentData.from.id);
    const commenterName = commentData.from.username || "Instagram User";
    const commentText = commentData.text || "";
    const commentId = commentData.id;

    const [existingChat] = await query(
      `SELECT * FROM beta_chats WHERE uid = ? AND sender_mobile = ? AND origin = ? LIMIT 1`,
      [uid, commenterId, "instagram_comment"]
    );

    let chatId;
    if (existingChat) {
      chatId = existingChat.chat_id;
    } else {
      chatId = randomstring.generate(20);
      await query(
        `INSERT INTO beta_chats
          (uid, chat_id, sender_mobile, sender_name, origin, origin_instance_id, last_message, createdAt)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          uid, chatId, commenterId, commenterName, "instagram_comment",
          JSON.stringify({ id: igAccount.user_id, username: igAccount.username }),
          JSON.stringify({ type: "text", text: { body: commentText } }),
          new Date(),
        ]
      );
    }

    const userTimezone = getCurrentTimestampInTimeZone(user?.timezone || "Asia/Kolkata");

    const messageData = {
      type: "text",
      metaChatId: commentId,
      msgContext: { type: "text", text: { body: commentText } },
      reaction: "",
      timestamp: parseInt(userTimezone),
      senderName: commenterName,
      senderMobile: commenterId,
      star: 0,
      route: "INCOMING",
      context: null,
      origin: "instagram_comment",
    };

    await saveMessageToConversation({ uid, chatId, messageData, sentBy: "instagram_comment" });

    return { message: messageData, chatId };
  } catch (err) {
    console.error("processInstaComment error:", err);
    return { message: null, chatId: null };
  }
}

module.exports = {
  processInstaMessage,
  resolveAccountFromWebhook,
  processInstaComment,
};
