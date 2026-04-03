package com.smsflow.gateway.pairing

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class QrCodeData(
    @SerialName("v") val version: Int,
    @SerialName("t") val token: String,
    @SerialName("u") val serverUrl: String,
    @SerialName("e") val expiresAt: Long
) {
    fun isExpired(): Boolean = System.currentTimeMillis() / 1000 > expiresAt

    companion object {
        fun fromJson(json: String): QrCodeData? {
            return try {
                Json.decodeFromString<QrCodeData>(json)
            } catch (e: Exception) {
                null
            }
        }
    }
}
