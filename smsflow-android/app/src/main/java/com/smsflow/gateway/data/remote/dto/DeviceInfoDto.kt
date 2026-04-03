package com.smsflow.gateway.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class DeviceInfoDto(
    @SerialName("name") val name: String,
    @SerialName("model") val model: String,
    @SerialName("manufacturer") val manufacturer: String,
    @SerialName("osVersion") val osVersion: String,
    @SerialName("appVersion") val appVersion: String,
    @SerialName("simCount") val simCount: Int,
    @SerialName("sims") val sims: List<SimInfoDto> = emptyList()
)

@Serializable
data class SimInfoDto(
    @SerialName("slot") val slot: Int,
    @SerialName("carrier") val carrier: String,
    @SerialName("phoneNumber") val phoneNumber: String? = null
)
