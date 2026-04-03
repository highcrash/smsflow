package com.smsflow.gateway.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class PairRequest(
    @SerialName("token") val token: String,
    @SerialName("device") val device: DeviceInfoDto
)
