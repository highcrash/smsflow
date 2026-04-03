package com.smsflow.gateway.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class StatusUpdateDto(
    @SerialName("messageId") val messageId: String,
    @SerialName("externalId") val externalId: String?,
    @SerialName("status") val status: String,
    @SerialName("errorCode") val errorCode: String?,
    @SerialName("timestamp") val timestamp: Long
)
