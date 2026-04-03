package com.smsflow.gateway.sim

data class SimInfo(
    val slotIndex: Int,
    val subscriptionId: Int,
    val displayName: String,
    val carrierName: String,
    val phoneNumber: String?,
    val isActive: Boolean,
    val isDefault: Boolean,
    val dataRoaming: Boolean = false
)
