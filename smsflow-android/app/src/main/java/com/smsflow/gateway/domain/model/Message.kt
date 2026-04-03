package com.smsflow.gateway.domain.model

data class Message(
    val id: String,
    val externalId: String?,
    val phoneNumber: String,
    val body: String,
    val status: MessageStatus,
    val simSlot: Int,
    val createdAt: Long,
    val updatedAt: Long,
    val errorCode: String?
)

enum class MessageStatus {
    PENDING,
    QUEUED,
    SENDING,
    SENT,
    DELIVERED,
    FAILED;

    companion object {
        fun fromString(value: String): MessageStatus {
            return try {
                valueOf(value.uppercase())
            } catch (e: IllegalArgumentException) {
                FAILED
            }
        }
    }
}
