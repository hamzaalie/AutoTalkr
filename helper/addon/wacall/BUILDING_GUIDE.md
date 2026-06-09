# WA Calling Addon — Build Guide

## What It Does
Enables real voice calls through WhatsApp using Meta's Cloud API. Features:
- Create call flows (IVR menus, press 1 for sales, press 2 for support)
- Outbound broadcast calls to contact lists
- AI voice responses via ElevenLabs + OpenAI
- Call logs with duration, status, recording

## Prerequisites
1. **Meta approval** — You must apply for WhatsApp Calling access via Meta Business Manager. Not available to all accounts. Apply at: https://business.facebook.com
2. **ElevenLabs API key** — For AI voice synthesis
3. **OpenAI API key** — For AI conversation handling
4. **Meta Cloud API** — Phone number must be on Cloud API (not On-Premise)

## Stub Files Already Created
All files exist but functions return empty/false:
- `wacall.js` — `checkWaCall()` and `handleCalls()` entry points
- `broadcastProcessor.js` — Broadcast call queue management
- `flowExecutor.js` — Executes call flow steps (play audio, wait for input, branch)
- `functionRegistry.js` — Registers AI function calls for the call flow
- `openaiHandler.js` — OpenAI integration for AI voice conversations
- `audioUtils.js` — Audio encoding/streaming utilities
- `utils.js` — Helper functions

## DB Tables Needed
```sql
CREATE TABLE wa_call_flow (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  flow JSON NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wa_call_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(255) NOT NULL,
  flow_id INT DEFAULT NULL,
  contact VARCHAR(50),
  direction ENUM('inbound','outbound') DEFAULT 'outbound',
  status VARCHAR(50),
  duration INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wa_call_broadcast (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(255) NOT NULL,
  flow_id INT NOT NULL,
  contacts JSON,
  status VARCHAR(50) DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Routes Needed (routes/waCall.js)
- `POST /setup` — Save Meta API key + ElevenLabs key
- `GET /get_flows` — List call flows
- `POST /add_flow` — Create a call flow
- `POST /update_flow` — Update a call flow
- `DELETE /delete_flow/:id` — Delete a flow
- `POST /initiate_call` — Start a single outbound call
- `POST /broadcast_call` — Start a broadcast call campaign
- `GET /call_logs` — Get call logs
- `POST /meta_webhook` — Receive call events from Meta

## How to Enable
1. Implement the above
2. Change `checkWaCall()` in `wacall.js` to `return true`
3. The frontend UI is already built — menu items will unlock automatically

## Meta Webhook Events to Handle
- `call.initiated` — Call started
- `call.ringing` — Phone is ringing
- `call.accepted` — User answered
- `call.rejected` — User rejected
- `call.terminated` — Call ended
- `call.audio_frame` — Audio data (for AI responses)
