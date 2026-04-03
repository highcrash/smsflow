package com.smsflow.gateway.health

import android.content.Context
import com.smsflow.gateway.data.remote.websocket.WebSocketManager
import com.smsflow.gateway.domain.model.ConnectionState
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine

class HealthMonitor(
    private val context: Context,
    private val batteryMonitor: BatteryMonitor,
    private val connectivityMonitor: ConnectivityMonitor,
    private val webSocketManager: WebSocketManager
) {

    val batteryLevel: StateFlow<Int> = batteryMonitor.batteryLevel
    val isCharging: StateFlow<Boolean> = batteryMonitor.isCharging
    val isNetworkConnected: StateFlow<Boolean> = connectivityMonitor.isConnected
    val connectionState: StateFlow<ConnectionState> = webSocketManager.connectionState

    fun start() {
        connectivityMonitor.start()
    }

    fun stop() {
        connectivityMonitor.stop()
    }

    fun isHealthy(): Boolean {
        return connectivityMonitor.isConnected.value &&
                webSocketManager.connectionState.value is ConnectionState.Connected &&
                batteryMonitor.batteryLevel.value > 5
    }
}
