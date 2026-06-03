const { query } = require("../../../database/dbpromise");
const fetch = require("node-fetch");

const API_VERSION = "v21.0";

function checkInsta() {
  return true;
}

// Get the callback URI for Instagram OAuth
async function getInstaCallbackUri() {
  try {
    const backUri = process.env.BACKURI || process.env.FRONTENDURI;
    if (!backUri) return null;
    return `${backUri}/api/insta/callback`;
  } catch (err) {
    console.error("getInstaCallbackUri error:", err);
    return null;
  }
}

// Exchange authorization code for short-lived token
async function exchangeShortToken({ appId, appSecret, redirectUri, code }) {
  try {
    const params = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    });

    const res = await fetch(
      `https://api.instagram.com/oauth/access_token`,
      {
        method: "POST",
        body: params,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const data = await res.json();
    console.log("[Instagram] Short token exchange:", data);
    return data;
  } catch (err) {
    console.error("exchangeShortToken error:", err);
    return {};
  }
}

// Exchange short-lived token for long-lived token (60 days)
async function exchangeLongToken({ appSecret, shortToken }) {
  try {
    const params = new URLSearchParams({
      grant_type: "ig_exchange_token",
      client_secret: appSecret,
      access_token: shortToken,
    });

    const res = await fetch(
      `https://graph.instagram.com/access_token?${params.toString()}`
    );

    const data = await res.json();
    console.log("[Instagram] Long token exchange:", data);
    return data;
  } catch (err) {
    console.error("exchangeLongToken error:", err);
    return {};
  }
}

// Fetch Instagram business profile
async function fetchInstaProfile(token) {
  try {
    const res = await fetch(
      `https://graph.instagram.com/${API_VERSION}/me?fields=id,username,name,profile_picture_url,biography,followers_count&access_token=${token}`
    );
    const data = await res.json();
    console.log("[Instagram] Profile fetch:", data);
    return data;
  } catch (err) {
    console.error("fetchInstaProfile error:", err);
    return null;
  }
}

// Subscribe account to webhook for DMs and comments
async function subscribeInstaWebhook(accessToken) {
  try {
    const res = await fetch(
      `https://graph.instagram.com/${API_VERSION}/me/subscribed_apps`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscribed_fields: "messages,comments,mentions",
          access_token: accessToken,
        }),
      }
    );
    const data = await res.json();
    console.log("[Instagram] Webhook subscription:", data);
    return data;
  } catch (err) {
    console.error("subscribeInstaWebhook error:", err);
    return null;
  }
}

// Generate webhook info for admin panel
async function genInstaWebhook() {
  try {
    const backUri = process.env.BACKURI || process.env.FRONTENDURI;
    if (!backUri) return null;
    return {
      webhookUrl: `${backUri}/api/insta/webhook`,
      verifyToken: "autotalkr_insta_verify",
    };
  } catch (err) {
    console.error("genInstaWebhook error:", err);
    return null;
  }
}

// Send a DM reply via Instagram API
async function sendInstaDM({ accessToken, recipientId, message }) {
  try {
    const res = await fetch(
      `https://graph.instagram.com/${API_VERSION}/me/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
          access_token: accessToken,
        }),
      }
    );
    const data = await res.json();
    console.log("[Instagram] Send DM:", data);
    return data;
  } catch (err) {
    console.error("sendInstaDM error:", err);
    return null;
  }
}

// Reply to a comment via Instagram API
async function replyToInstaComment({ accessToken, commentId, message }) {
  try {
    const res = await fetch(
      `https://graph.instagram.com/${API_VERSION}/${commentId}/replies`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          access_token: accessToken,
        }),
      }
    );
    const data = await res.json();
    console.log("[Instagram] Reply to comment:", data);
    return data;
  } catch (err) {
    console.error("replyToInstaComment error:", err);
    return null;
  }
}

module.exports = {
  checkInsta,
  genInstaWebhook,
  exchangeShortToken,
  exchangeLongToken,
  fetchInstaProfile,
  API_VERSION,
  getInstaCallbackUri,
  subscribeInstaWebhook,
  sendInstaDM,
  replyToInstaComment,
};
