const axios = require("axios");
const { query } = require("../../../database/dbpromise");
const randomstring = require("randomstring");

function checkWebhook() {
  return true;
}

async function dispatchWebhook({ uid, event, data }) {
  try {
    const webhooks = await query(
      `SELECT * FROM webhook WHERE uid = ? AND active = 1`,
      [uid]
    );
    if (!webhooks || webhooks.length === 0) return;

    for (const wh of webhooks) {
      const logId = randomstring.generate(16);
      const payload = { event, data, timestamp: new Date().toISOString() };
      let status = "success";
      let response_body = null;
      let http_status = null;

      try {
        const headers = { "Content-Type": "application/json" };
        if (wh.secret) headers["X-Webhook-Secret"] = wh.secret;

        const res = await axios.post(wh.url, payload, {
          headers,
          timeout: 10000,
        });
        http_status = res.status;
        response_body = JSON.stringify(res.data).slice(0, 500);
      } catch (err) {
        status = "failed";
        http_status = err?.response?.status || 0;
        response_body = err?.message?.slice(0, 500) || "Request failed";
      }

      await query(
        `INSERT INTO webhook_log (uid, webhook_id, event, payload, status, http_status, response_body) VALUES (?,?,?,?,?,?,?)`,
        [uid, wh.id, event, JSON.stringify(payload), status, http_status, response_body]
      ).catch(() => {});
    }
  } catch (err) {
    console.error("dispatchWebhook error:", err?.message);
  }
}

module.exports = { checkWebhook, dispatchWebhook };
