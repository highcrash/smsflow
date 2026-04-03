package com.smsflow.gateway.ui.screens.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.data.remote.websocket.WebSocketManager
import com.smsflow.gateway.data.repository.MessageRepository
import com.smsflow.gateway.domain.model.ConnectionState
import com.smsflow.gateway.domain.model.Message
import com.smsflow.gateway.health.BatteryMonitor
import com.smsflow.gateway.health.ConnectivityMonitor
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn

data class DashboardUiState(
    val isGatewayRunning: Boolean = false,
    val connectionState: ConnectionState = ConnectionState.Disconnected,
    val todaySentCount: Int = 0,
    val pendingCount: Int = 0,
    val batteryLevel: Int = 100,
    val isCharging: Boolean = false,
    val signalStrength: Int = 0,
    val lastHeartbeatTime: Long? = null,
    val recentMessages: List<Message> = emptyList(),
    val isNetworkConnected: Boolean = false
)

class DashboardViewModel(
    private val messageRepository: MessageRepository,
    private val preferencesManager: PreferencesManager,
    private val webSocketManager: WebSocketManager,
    private val batteryMonitor: BatteryMonitor,
    private val connectivityMonitor: ConnectivityMonitor
) : ViewModel() {

    private val _lastHeartbeatTime = MutableStateFlow<Long?>(null)
    val lastHeartbeatTime: StateFlow<Long?> = _lastHeartbeatTime.asStateFlow()

    // Combine device status flows (max 5 params per combine)
    private val deviceStatusFlow = combine(
        preferencesManager.isGatewayRunning,
        webSocketManager.connectionState,
        connectivityMonitor.isConnected
    ) { isRunning, connState, netConnected ->
        Triple(isRunning, connState, netConnected)
    }

    // Combine stats flows
    private val statsFlow = combine(
        messageRepository.observeTodaySentCount(),
        messageRepository.observePendingCount(),
        messageRepository.getRecentMessages(20)
    ) { sentCount, pendingCount, messages ->
        Triple(sentCount, pendingCount, messages)
    }

    // Combine battery/health flows
    private val healthFlow = combine(
        batteryMonitor.batteryLevel,
        batteryMonitor.isCharging
    ) { level, charging ->
        Pair(level, charging)
    }

    val uiState: StateFlow<DashboardUiState> = combine(
        deviceStatusFlow,
        statsFlow,
        healthFlow,
        _lastHeartbeatTime
    ) { deviceStatus, stats, health, heartbeat ->
        val (isRunning, connState, netConnected) = deviceStatus
        val (sentCount, pendingCount, messages) = stats
        val (batteryLevel, isCharging) = health

        DashboardUiState(
            isGatewayRunning = isRunning,
            connectionState = connState,
            todaySentCount = sentCount,
            pendingCount = pendingCount,
            batteryLevel = batteryLevel,
            isCharging = isCharging,
            signalStrength = 3,
            lastHeartbeatTime = heartbeat,
            recentMessages = messages,
            isNetworkConnected = netConnected
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = DashboardUiState()
    )

    fun updateLastHeartbeat() {
        _lastHeartbeatTime.value = System.currentTimeMillis()
    }
}
