require("dotenv").config({ silent: true });
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const fileUpload = require("express-fileupload");
const nodeCleanup = require("node-cleanup");
const { initCampaign } = require("./loops/campaignBeta.js");
const { init, cleanup } = require("./helper/addon/qr");
const { warmerLoopInit } = require("./helper/addon/qr/warmer/index.js");
const { initTele, cleanupTele } = require("./helper/addon/telegram/tele.js");
const { updateLangJsonFromEnglish } = require("./utils/fun.js");

const app = express();
const currentDir = process.cwd();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());
app.use(fileUpload());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/user", require("./routes/user"));
app.use("/api/web", require("./routes/web"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/phonebook", require("./routes/phonebook"));
app.use("/api/chat_flow", require("./routes/chatFlow"));
app.use("/api/inbox", require("./routes/inbox"));
app.use("/api/templet", require("./routes/templet"));
app.use("/api/chatbot", require("./routes/chatbot"));
app.use("/api/broadcast", require("./routes/broadcast"));
app.use("/api/v1", require("./routes/apiv2"));
app.use("/api/agent", require("./routes/agent"));
app.use("/api/qr", require("./routes/qr"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/webhook", require("./routes/webhook"));
app.use("/api/wa_call", require("./routes/waCall"));
app.use("/api/telegram", require("./routes/telegram"));
app.use("/api/theme", require("./routes/theme"));
app.use("/api/insta", require("./routes/insta"));
app.use("/api/kaban", require("./routes/kaban"));
app.use("/api/waform", require("./routes/waform"));

// ─── Media Streaming Middleware ───────────────────────────────────────────────
const createMediaMiddleware = (folderPath) => {
  const mimeTypes = {
    // Video
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    // Audio
    ".mp3": "audio/mpeg",
    ".ogg": "audio/ogg",
    ".opus": "audio/opus",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
  };

  return express.static(path.resolve(currentDir, folderPath), {
    setHeaders: (res, filePath) => {
      res.setHeader("Accept-Ranges", "bytes");

      const ext = path.extname(filePath).toLowerCase();
      if (mimeTypes[ext]) {
        res.setHeader("Content-Type", mimeTypes[ext]);
      }

      res.setHeader("Cache-Control", "public, max-age=31536000");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Range");
    },
    index: false,
    acceptRanges: true,
  });
};

app.use("/media", createMediaMiddleware("./client/public/media"));
app.use("/meta-media", createMediaMiddleware("./client/public/meta-media"));

// ─── Static & Catch-All ───────────────────────────────────────────────────────
app.use(express.static(path.resolve(currentDir, "./client/public")));

app.get("*", function (request, response) {
  response.sendFile(path.resolve(currentDir, "./client/public", "index.html"));
});

// ─── Server ───────────────────────────────────────────────────────────────────
// ─── Run startup migrations ───────────────────────────────────────────────────
const { query: dbQuery } = require("./database/dbpromise");
(async () => {
  try {
    await dbQuery(`CREATE TABLE IF NOT EXISTS \`webhook\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`uid\` varchar(255) NOT NULL,
      \`webhook_id\` varchar(255) NOT NULL,
      \`name\` varchar(255) NOT NULL,
      \`url\` text NOT NULL,
      \`secret\` varchar(255) DEFAULT NULL,
      \`events\` text DEFAULT NULL,
      \`active\` tinyint(1) DEFAULT 1,
      \`createdAt\` datetime DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await dbQuery(`CREATE TABLE IF NOT EXISTS \`webhook_log\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`uid\` varchar(255) NOT NULL,
      \`webhook_id\` int DEFAULT NULL,
      \`event\` varchar(100) DEFAULT NULL,
      \`payload\` text DEFAULT NULL,
      \`status\` varchar(50) DEFAULT NULL,
      \`http_status\` int DEFAULT NULL,
      \`response_body\` text DEFAULT NULL,
      \`createdAt\` datetime DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    console.log("Webhook tables ready");
  } catch (e) {
    console.error("Migration error:", e?.message);
  }
})();

const server = app.listen(process.env.PORT || 3010, () => {
  console.log(`WaCrm server is running on port ${process.env.PORT}`);
  updateLangJsonFromEnglish();
  init();
  setTimeout(() => {
    initCampaign();
  }, 1000);
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = require("./socket").initializeSocket(server);
module.exports = io;

// ─── Cleanup ──────────────────────────────────────────────────────────────────
nodeCleanup(async (exitCode, signal) => {
  await cleanupTele();
  cleanup();
});
