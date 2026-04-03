package com.smsflow.gateway.domain.model

data class Device(
    val id: String,
    val name: String,
    val model: String,
    val osVersion: String,
    val appVersion: String,
    val simCards: List<SimCard>,
    val isPaired: Boolean,
    val lastSeen: Long?
)
