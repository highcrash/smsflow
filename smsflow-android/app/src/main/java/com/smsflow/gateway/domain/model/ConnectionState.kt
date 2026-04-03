package com.smsflow.gateway.domain.model

sealed class ConnectionState {
    object Disconnected : ConnectionState()
    object Connecting : ConnectionState()
    object Connected : ConnectionState()
    data class Error(val message: String, val retryCount: Int = 0) : ConnectionState()

    fun isConnected(): Boolean = this is Connected
    fun isConnecting(): Boolean = this is Connecting
}
