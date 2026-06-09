const router = require("express").Router();
const { query } = require("../database/dbpromise");
const randomstring = require("randomstring");
const userValidator = require("../middlewares/user");

// Get all webhooks for the logged-in user
router.get("/get_webhooks", userValidator, async (req, res) => {
  try {
    const webhooks = await query(`SELECT * FROM webhook WHERE uid = ? ORDER BY createdAt DESC`, [req.decode.uid]);
    res.json({ success: true, data: webhooks });
  } catch (err) {
    res.json({ success: false, msg: "Something went wrong" });
  }
});

// Add a new webhook
router.post("/add_webhook", userValidator, async (req, res) => {
  try {
    const { name, url, secret, events } = req.body;
    if (!name || !url) return res.json({ success: false, msg: "Name and URL are required" });

    const webhook_id = randomstring.generate(20);
    await query(
      `INSERT INTO webhook (uid, webhook_id, name, url, secret, events, active) VALUES (?,?,?,?,?,?,1)`,
      [req.decode.uid, webhook_id, name, url, secret || null, JSON.stringify(events || ["message.received"])]
    );
    res.json({ success: true, msg: "Webhook added" });
  } catch (err) {
    res.json({ success: false, msg: "Something went wrong" });
  }
});

// Update a webhook
router.post("/update_webhook", userValidator, async (req, res) => {
  try {
    const { id, name, url, secret, events, active } = req.body;
    if (!id) return res.json({ success: false, msg: "Webhook ID required" });

    await query(
      `UPDATE webhook SET name=?, url=?, secret=?, events=?, active=? WHERE id=? AND uid=?`,
      [name, url, secret || null, JSON.stringify(events || ["message.received"]), active ? 1 : 0, id, req.decode.uid]
    );
    res.json({ success: true, msg: "Webhook updated" });
  } catch (err) {
    res.json({ success: false, msg: "Something went wrong" });
  }
});

// Delete a webhook
router.post("/delete_webhook", userValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await query(`DELETE FROM webhook WHERE id=? AND uid=?`, [id, req.decode.uid]);
    await query(`DELETE FROM webhook_log WHERE webhook_id=? AND uid=?`, [id, req.decode.uid]);
    res.json({ success: true, msg: "Webhook deleted" });
  } catch (err) {
    res.json({ success: false, msg: "Something went wrong" });
  }
});

// Receive incoming webhook (external service → your app)
router.post("/webhook/:webhook_id", async (req, res) => {
  try {
    const { webhook_id } = req.params;
    const wh = await query(`SELECT * FROM webhook WHERE webhook_id=?`, [webhook_id]);
    if (!wh || wh.length === 0) return res.status(404).json({ msg: "Webhook not found" });
    // Forward to automation handler if needed in future
    res.json({ success: true, msg: "Received" });
  } catch (err) {
    res.json({ success: false });
  }
});

router.get("/webhook/:webhook_id", async (req, res) => {
  res.json({ success: true, msg: "Webhook endpoint is active" });
});

// Get webhook logs
router.get("/get_webhook_logs", userValidator, async (req, res) => {
  try {
    const logs = await query(
      `SELECT l.*, w.name as webhook_name FROM webhook_log l LEFT JOIN webhook w ON w.id = l.webhook_id WHERE l.uid=? ORDER BY l.createdAt DESC LIMIT 200`,
      [req.decode.uid]
    );
    res.json({ success: true, data: logs });
  } catch (err) {
    res.json({ success: false, msg: "Something went wrong" });
  }
});

// Delete webhook logs
router.post("/delete_webhook_logs", userValidator, async (req, res) => {
  try {
    const { ids } = req.body;
    if (ids && ids.length > 0) {
      await query(`DELETE FROM webhook_log WHERE id IN (?) AND uid=?`, [ids, req.decode.uid]);
    } else {
      await query(`DELETE FROM webhook_log WHERE uid=?`, [req.decode.uid]);
    }
    res.json({ success: true, msg: "Logs cleared" });
  } catch (err) {
    res.json({ success: false, msg: "Something went wrong" });
  }
});

module.exports = router;
