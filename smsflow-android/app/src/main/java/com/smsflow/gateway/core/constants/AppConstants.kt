package com.smsflow.gateway.core.constants

object AppConstants {
    const val APP_NAME = "SMSFlow Gateway"
    const val VERSION = "1.0.0"

    // Database
    const val DATABASE_NAME = "smsflow_db"
    const val DATABASE_VERSION = 1

    // Preferences
    const val PREFS_NAME = "smsflow_prefs"

    // WebSocket
    const val WS_HEARTBEAT_INTERVAL_MS = 60_000L
    const val WS_RECONNECT_BASE_DELAY_MS = 1_000L
    const val WS_RECONNECT_MAX_DELAY_MS = 60_000L
    const val WS_RECONNECT_MULTIPLIER = 1.5
    const val WS_RECONNECT_JITTER = 0.2

    // Rate Limiting
    const val DEFAULT_RATE_LIMIT_PER_SECOND = 1
    const val MAX_RATE_LIMIT_PER_SECOND = 10

    // Local HTTP Server
    const val LOCAL_SERVER_PORT = 8080
    const val LOCAL_SERVER_DEFAULT_PASSWORD = "smsflow123"

    // Notification
    const val NOTIFICATION_CHANNEL_GATEWAY = "gateway_service"
    const val NOTIFICATION_CHANNEL_MESSAGES = "messages"
    const val NOTIFICATION_ID_GATEWAY = 1001
    const val NOTIFICATION_ID_MESSAGE = 2001

    // SMS
    const val SMS_MAX_LENGTH = 160
    const val SMS_SENT_ACTION = "com.smsflow.gateway.SMS_SENT"
    const val SMS_DELIVERED_ACTION = "com.smsflow.gateway.SMS_DELIVERED"

    // Message Status
    const val STATUS_PENDING = "PENDING"
    const val STATUS_QUEUED = "QUEUED"
    const val STATUS_SENDING = "SENDING"
    const val STATUS_SENT = "SENT"
    const val STATUS_DELIVERED = "DELIVERED"
    const val STATUS_FAILED = "FAILED"

    // Worker Tags
    const val WORKER_SEND_MESSAGE = "send_message_worker"
    const val WORKER_SYNC_STATUS = "sync_status_worker"
    const val WORKER_PULL_MESSAGES = "pull_messages_worker"
    const val WORKER_CLEANUP = "cleanup_worker"
    const val WORKER_HEARTBEAT = "heartbeat_worker"

    // Encryption
    const val KEY_ALGORITHM = "AES"
    const val KEY_SIZE = 256
    const val PBKDF2_ITERATIONS = 10000
    const val PBKDF2_KEY_LENGTH = 256

    // Cleanup
    const val LOG_RETENTION_DAYS = 7L
    const val MESSAGE_RETENTION_DAYS = 30L
}
