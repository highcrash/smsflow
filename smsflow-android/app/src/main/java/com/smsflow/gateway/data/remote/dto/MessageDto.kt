package com.smsflow.gateway.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class MessageDto(
    @SerialName("id") val id: String,
    @SerialName("to") val to: String,
    @SerialName("body") val body: String,
    @SerialName("sim") val sim: Int = 0,
    @SerialName("priority") val priority: Int = 0,
    @SerialName("externalId") val externalId: String? = null
)
