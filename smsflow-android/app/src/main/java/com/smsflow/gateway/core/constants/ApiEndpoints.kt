package com.smsflow.gateway.core.constants

object ApiEndpoints {
    const val BASE_URL = "https://api.smsflow.io"
    const val WS_BASE_URL = "wss://api.smsflow.io"

    // Auth
    const val PAIR_DEVICE = "/api/v1/devices/pair"
    const val REFRESH_TOKEN = "/api/v1/auth/refresh"

    // Device
    const val DEVICE_INFO = "/api/v1/devices/{deviceId}"
    const val DEVICE_HEARTBEAT = "/api/v1/devices/{deviceId}/heartbeat"
    const val DEVICE_STATUS = "/api/v1/devices/{deviceId}/status"

    // Messages
    const val MESSAGES = "/api/v1/messages"
    const val MESSAGE_STATUS = "/api/v1/messages/{messageId}/status"
    const val PENDING_MESSAGES = "/api/v1/messages/pending"

    // WebSocket
    const val WS_DEVICE = "/ws/device/{deviceId}"
}
