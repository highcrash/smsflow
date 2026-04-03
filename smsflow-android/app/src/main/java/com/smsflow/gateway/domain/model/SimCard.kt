package com.smsflow.gateway.domain.model

data class SimCard(
    val slotIndex: Int,
    val subscriptionId: Int,
    val displayName: String,
    val carrierName: String,
    val phoneNumber: String?,
    val isActive: Boolean,
    val isDefault: Boolean
)
