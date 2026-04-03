package com.smsflow.gateway.webhook

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class WebhookEvent(
    @SerialName("event") val event: String,
    @SerialName("timestamp") val timestamp: Long,
    @SerialName("data") val data: Map<String, String>
) {
    companion object {
        const val EVENT_SMS_SENT = "sms.sent"
        const val EVENT_SMS_DELIVERED = "sms.delivered"
        const val EVENT_SMS_FAILED = "sms.failed"
        const val EVENT_SMS_RECEIVED = "sms.received"
        const val EVENT_GATEWAY_STARTED = "gateway.started"
        const val EVENT_GATEWAY_STOPPED = "gateway.stopped"
    }
}
