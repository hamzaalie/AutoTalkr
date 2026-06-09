-- WhatsCRM Database Schema
-- Generated from source code analysis

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `mobile_with_country_code` varchar(50) DEFAULT NULL,
  `timezone` varchar(100) DEFAULT 'Asia/Kolkata',
  `plan` longtext DEFAULT NULL,
  `plan_expire` bigint DEFAULT NULL,
  `trial` tinyint DEFAULT 0,
  `api_key` text DEFAULT NULL,
  `role` varchar(50) DEFAULT 'user',
  `fcm_data` text DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `plan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `short_description` text DEFAULT NULL,
  `allow_tag` tinyint DEFAULT 0,
  `allow_note` tinyint DEFAULT 0,
  `allow_chatbot` tinyint DEFAULT 0,
  `contact_limit` int DEFAULT 0,
  `allow_api` tinyint DEFAULT 0,
  `is_trial` tinyint DEFAULT 0,
  `price` decimal(10,2) DEFAULT 0.00,
  `price_strike` decimal(10,2) DEFAULT NULL,
  `plan_duration_in_days` int DEFAULT 1,
  `qr_account` int DEFAULT 0,
  `wa_warmer` tinyint DEFAULT 0,
  `rest_api_qr` tinyint DEFAULT 0,
  `instagram_inbox` tinyint DEFAULT 0,
  `telegram_inbox` tinyint DEFAULT 0,
  `allow_wa_forms` tinyint DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `web_public` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_name` varchar(255) DEFAULT 'WhatsCRM',
  `app_logo` varchar(255) DEFAULT NULL,
  `app_favicon` varchar(255) DEFAULT NULL,
  `app_description` text DEFAULT NULL,
  `hero_title` varchar(255) DEFAULT NULL,
  `hero_description` text DEFAULT NULL,
  `hero_image` varchar(255) DEFAULT NULL,
  `currency` varchar(20) DEFAULT 'USD',
  `currency_symbol` varchar(10) DEFAULT '$',
  `rtl` tinyint DEFAULT 0,
  `google_client_id` varchar(255) DEFAULT NULL,
  `google_login_active` tinyint DEFAULT 0,
  `fb_login_app_id` varchar(255) DEFAULT NULL,
  `fb_login_app_sec` varchar(255) DEFAULT NULL,
  `fb_login_active` tinyint DEFAULT 0,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `contact_address` text DEFAULT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `twitter_url` varchar(255) DEFAULT NULL,
  `instagram_url` varchar(255) DEFAULT NULL,
  `youtube_url` varchar(255) DEFAULT NULL,
  `whatsapp_number` varchar(50) DEFAULT NULL,
  `google_analytics` text DEFAULT NULL,
  `custom_script` text DEFAULT NULL,
  `meta_pixel` text DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `web_private` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pay_offline_id` varchar(255) DEFAULT NULL,
  `pay_offline_key` varchar(255) DEFAULT NULL,
  `offline_active` tinyint DEFAULT 0,
  `pay_stripe_id` varchar(255) DEFAULT NULL,
  `pay_stripe_key` varchar(255) DEFAULT NULL,
  `stripe_active` tinyint DEFAULT 0,
  `pay_paypal_id` varchar(255) DEFAULT NULL,
  `pay_paypal_key` varchar(255) DEFAULT NULL,
  `paypal_active` tinyint DEFAULT 0,
  `rz_id` varchar(255) DEFAULT NULL,
  `rz_key` varchar(255) DEFAULT NULL,
  `rz_active` tinyint DEFAULT 0,
  `pay_paystack_id` varchar(255) DEFAULT NULL,
  `pay_paystack_key` varchar(255) DEFAULT NULL,
  `paystack_active` tinyint DEFAULT 0,
  `pay_mercadopago_public_key` varchar(255) DEFAULT NULL,
  `pay_mercadopago_access_token` varchar(255) DEFAULT NULL,
  `mercadopago_active` tinyint DEFAULT 0,
  `qr_storage` varchar(50) DEFAULT 'local',
  `mongodb_string` text DEFAULT NULL,
  `embed_app_sec` varchar(255) DEFAULT NULL,
  `embed_app_id` varchar(255) DEFAULT NULL,
  `embed_app_config` text DEFAULT NULL,
  `teleAppId` varchar(255) DEFAULT NULL,
  `teleHash` varchar(255) DEFAULT NULL,
  `fcm_projectId` varchar(255) DEFAULT NULL,
  `fcm_clientEmail` varchar(255) DEFAULT NULL,
  `fcm_privateKey` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `instance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `uniqueId` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT 'GENERATING',
  `mobile` varchar(50) DEFAULT NULL,
  `webhook` text DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `partners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `faq` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `page` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `permanent` tinyint DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `testimonial` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `reviewer_name` varchar(255) DEFAULT NULL,
  `reviewer_position` varchar(255) DEFAULT NULL,
  `reviewer_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `payment_mode` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT 0.00,
  `data` text DEFAULT NULL,
  `s_token` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contact_form` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `mobile` varchar(50) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `smtp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `host` varchar(255) DEFAULT NULL,
  `port` varchar(10) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `phonebook` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contact` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `phonebook_id` int DEFAULT NULL,
  `phonebook_name` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `mobile` varchar(50) NOT NULL,
  `var1` varchar(255) DEFAULT NULL,
  `var2` varchar(255) DEFAULT NULL,
  `var3` varchar(255) DEFAULT NULL,
  `var4` varchar(255) DEFAULT NULL,
  `var5` varchar(255) DEFAULT NULL,
  `var6` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chat_id` varchar(255) NOT NULL,
  `uid` varchar(255) NOT NULL,
  `last_message_came` bigint DEFAULT NULL,
  `sender_name` varchar(255) DEFAULT NULL,
  `sender_mobile` varchar(50) DEFAULT NULL,
  `last_message` text DEFAULT NULL,
  `is_opened` tinyint DEFAULT 0,
  `chat_note` text DEFAULT NULL,
  `chat_tags` text DEFAULT NULL,
  `chat_status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `beta_chats` (
  `id` varchar(255) NOT NULL,
  `uid` varchar(255) NOT NULL,
  `old_chat_id` varchar(255) DEFAULT NULL,
  `profile` text DEFAULT NULL,
  `origin_instance_id` varchar(255) DEFAULT NULL,
  `chat_id` varchar(255) DEFAULT NULL,
  `last_message` longtext DEFAULT NULL,
  `chat_label` varchar(255) DEFAULT NULL,
  `chat_note` text DEFAULT NULL,
  `sender_name` varchar(255) DEFAULT NULL,
  `sender_mobile` varchar(50) DEFAULT NULL,
  `unread_count` int DEFAULT 0,
  `origin` varchar(100) DEFAULT NULL,
  `assigned_agent` varchar(255) DEFAULT NULL,
  `chat_status` varchar(50) DEFAULT NULL,
  `kanban_order` int DEFAULT 0,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `beta_conversation` (
  `id` varchar(255) NOT NULL,
  `uid` varchar(255) NOT NULL,
  `origin_instance_id` varchar(255) DEFAULT NULL,
  `chat_id` varchar(255) DEFAULT NULL,
  `msgContext` longtext DEFAULT NULL,
  `route` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chatbot` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `for_all` tinyint DEFAULT 0,
  `chats` text DEFAULT NULL,
  `flow` text DEFAULT NULL,
  `flow_id` varchar(255) DEFAULT NULL,
  `active` tinyint DEFAULT 1,
  `origin` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `beta_chatbot` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `source` varchar(100) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `flow_id` varchar(255) DEFAULT NULL,
  `origin` varchar(100) DEFAULT NULL,
  `origin_id` varchar(255) DEFAULT NULL,
  `active` tinyint DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `flow` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `flow_id` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `ai_list` text DEFAULT NULL,
  `prevent_list` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `beta_flows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `flow_id` varchar(255) NOT NULL,
  `source` varchar(100) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `data` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `flow_id` (`flow_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `flow_session` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `origin` varchar(100) DEFAULT NULL,
  `origin_id` varchar(255) DEFAULT NULL,
  `flow_id` varchar(255) DEFAULT NULL,
  `sender_mobile` varchar(50) DEFAULT NULL,
  `data` longtext DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `flow_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `data` longtext DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `broadcast` (
  `id` int NOT NULL AUTO_INCREMENT,
  `broadcast_id` varchar(255) NOT NULL,
  `uid` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `templet` text DEFAULT NULL,
  `phonebook` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'QUEUE',
  `schedule` datetime DEFAULT NULL,
  `timezone` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `broadcast_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `broadcast_id` varchar(255) DEFAULT NULL,
  `templet_name` varchar(255) DEFAULT NULL,
  `sender_mobile` varchar(50) DEFAULT NULL,
  `send_to` varchar(50) DEFAULT NULL,
  `delivery_status` varchar(50) DEFAULT NULL,
  `example` text DEFAULT NULL,
  `contact` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `beta_campaign` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_id` varchar(255) NOT NULL,
  `uid` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `template_name` varchar(255) DEFAULT NULL,
  `template_language` varchar(50) DEFAULT NULL,
  `phonebook_id` varchar(255) DEFAULT NULL,
  `phonebook_name` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'PENDING',
  `total_contacts` int DEFAULT 0,
  `body_variables` text DEFAULT NULL,
  `header_variable` text DEFAULT NULL,
  `button_variables` text DEFAULT NULL,
  `schedule` datetime DEFAULT NULL,
  `timezone` varchar(100) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `beta_campaign_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `campaign_id` varchar(255) DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_mobile` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'PENDING',
  `delivery_status` varchar(50) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `meta_msg_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `agents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_uid` varchar(255) NOT NULL,
  `uid` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `mobile` varchar(50) DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `mask_number` tinyint DEFAULT 0,
  `allow_send_new_qr` tinyint DEFAULT 0,
  `is_active` tinyint DEFAULT 1,
  `logs` text DEFAULT NULL,
  `allow_save_contact` tinyint DEFAULT 0,
  `fcm_data` text DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `agent_chats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_uid` varchar(255) NOT NULL,
  `uid` varchar(255) NOT NULL,
  `chat_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `agent_task` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_uid` varchar(255) NOT NULL,
  `uid` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'PENDING',
  `agent_comments` text DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `meta_api` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `waba_id` varchar(255) DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `business_phone_number_id` varchar(255) DEFAULT NULL,
  `app_id` varchar(255) DEFAULT NULL,
  `login_type` varchar(50) DEFAULT NULL,
  `embed_data` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `meta_templet_media` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `templet_name` varchar(255) DEFAULT NULL,
  `meta_hash` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `templets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gen_links` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `short_url` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `quick_reply` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `msg` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `warmers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `instances` text DEFAULT NULL,
  `is_active` tinyint DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `warmer_script` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `g_auth` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `url` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chat_widget` (
  `id` int NOT NULL AUTO_INCREMENT,
  `unique_id` varchar(255) DEFAULT NULL,
  `uid` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `whatsapp_number` varchar(50) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `place` varchar(50) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chat_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `hex` varchar(20) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fcm_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `token` text DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `instagram_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `webhook_id` varchar(255) DEFAULT NULL,
  `ig_graph_id` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `page_id` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `profile_pic` text DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `token_type` varchar(50) DEFAULT NULL,
  `expires_in` bigint DEFAULT NULL,
  `connected_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `telegram_session` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `session_data` text DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wa_call_flows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `flow_id` varchar(255) NOT NULL,
  `source` varchar(100) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `data` longtext DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wa_call_bot` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `flow_id` varchar(255) DEFAULT NULL,
  `active` tinyint DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wa_call_broadcasts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `campaign_id` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `flow_id` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'draft',
  `contacts` longtext DEFAULT NULL,
  `call_delay` int DEFAULT 5000,
  `max_concurrent_calls` int DEFAULT 1,
  `retry_failed` tinyint DEFAULT 0,
  `retry_count` int DEFAULT 0,
  `total_contacts` int DEFAULT 0,
  `logs` longtext DEFAULT NULL,
  `meta_data` text DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wa_call_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `campaign_id` varchar(255) DEFAULT NULL,
  `contact_mobile` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `error` text DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wa_forms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `flow_id` varchar(255) DEFAULT NULL,
  `flow_status` varchar(50) DEFAULT NULL,
  `fields_json` text DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wa_form_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `flow_id` varchar(255) DEFAULT NULL,
  `form_name` varchar(255) DEFAULT NULL,
  `from_phone` varchar(50) DEFAULT NULL,
  `raw_payload` text DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `beta_api_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `msg_id` varchar(255) DEFAULT NULL,
  `request` text DEFAULT NULL,
  `response` text DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `err` text DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mobile_app` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fcmJson` text DEFAULT NULL,
  `appTheme` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `socket_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `webhook` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `webhook_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `url` text NOT NULL,
  `secret` varchar(255) DEFAULT NULL,
  `events` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `webhook_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `webhook_id` int DEFAULT NULL,
  `event` varchar(100) DEFAULT NULL,
  `payload` text DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `http_status` int DEFAULT NULL,
  `response_body` text DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial data
INSERT IGNORE INTO `web_public` (`id`, `app_name`, `currency`, `currency_symbol`, `rtl`) VALUES (1, 'WhatsCRM', 'USD', '$', 0);
INSERT IGNORE INTO `web_private` (`id`, `qr_storage`) VALUES (1, 'local');
