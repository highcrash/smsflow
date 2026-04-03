package com.smsflow.gateway.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class PairResponse(
    @SerialName("deviceId") val deviceId: String,
    @SerialName("accessToken") val accessToken: String,
    @SerialName("refreshToken") val refreshToken: String,
    @SerialName("encryptionKey") val encryptionKey: String = "",
    @SerialName("wsUrl") val wsUrl: String = "",
    @SerialName("expiresAt") val expiresAt: Long = 0
)
