package com.smsflow.gateway.data.remote.websocket

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class WebSocketMessage(
    @SerialName("id") val id: String,
    @SerialName("type") val type: String,
    @SerialName("timestamp") val timestamp: Long,
    @SerialName("payload") val payload: JsonElement? = null
)

object WebSocketMessageType {
    // Server to Device
    const val SEND_SMS = "SEND_SMS"
    const val PING = "PING"
    const val CONFIG_UPDATE = "CONFIG_UPDATE"

    // Device to Server
    const val STATUS_UPDATE = "STATUS_UPDATE"
    const val HEARTBEAT = "HEARTBEAT"
    const val SMS_RECEIVED = "SMS_RECEIVED"
    const val PONG = "PONG"
}

@Serializable
data class HeartbeatPayload(
    @SerialName("batteryLevel") val batteryLevel: Int,
    @SerialName("batteryCharging") val batteryCharging: Boolean,
    @SerialName("signalStrength") val signalStrength: Int,
    @SerialName("queueDepth") val queueDepth: Int,
    @SerialName("isGatewayRunning") val isGatewayRunning: Boolean
)

@Serializable
data class SmsReceivedPayload(
    @SerialName("from") val from: String,
    @SerialName("body") val body: String,
    @SerialName("timestamp") val timestamp: Long,
    @SerialName("simSlot") val simSlot: Int
)

@Serializable
data class SendSmsPayload(
    @SerialName("messageId") val messageId: String,
    @SerialName("to") val to: String,
    @SerialName("body") val body: String,
    @SerialName("sim") val sim: Int = 0,
    @SerialName("externalId") val externalId: String? = null
)

@Serializable
data class ConfigUpdatePayload(
    @SerialName("rateLimit") val rateLimit: Int? = null,
    @SerialName("serverUrl") val serverUrl: String? = null
)

@Serializable
data class StatusUpdatePayload(
    @SerialName("messageId") val messageId: String,
    @SerialName("externalId") val externalId: String?,
    @SerialName("status") val status: String,
    @SerialName("errorCode") val errorCode: String?,
    @SerialName("timestamp") val timestamp: Long
)
