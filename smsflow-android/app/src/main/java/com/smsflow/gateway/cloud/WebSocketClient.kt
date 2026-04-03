package com.smsflow.gateway.cloud

import android.util.Log
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.data.remote.websocket.WebSocketManager
import com.smsflow.gateway.data.remote.websocket.WebSocketMessage
import com.smsflow.gateway.data.remote.websocket.WebSocketMessageType
import com.smsflow.gateway.domain.model.ConnectionState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.UUID

class WebSocketClient(
    private val webSocketManager: WebSocketManager,
    private val preferencesManager: PreferencesManager
) {
    companion object {
        private const val TAG = "WebSocketClient"
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var monitorJob: Job? = null

    val connectionState = webSocketManager.connectionState
    val incomingMessages = webSocketManager.incomingMessages

    fun connect() {
        Log.i(TAG, "Connecting WebSocket client")
        webSocketManager.connect()
        startConnectionMonitor()
    }

    fun disconnect() {
        Log.i(TAG, "Disconnecting WebSocket client")
        monitorJob?.cancel()
        webSocketManager.disconnect()
    }

    fun sendMessage(type: String, payload: kotlinx.serialization.json.JsonElement? = null): Boolean {
        val message = WebSocketMessage(
            id = UUID.randomUUID().toString(),
            type = type,
            timestamp = System.currentTimeMillis(),
            payload = payload
        )
        return webSocketManager.sendMessage(message)
    }

    private fun startConnectionMonitor() {
        monitorJob?.cancel()
        monitorJob = scope.launch {
            connectionState.collectLatest { state ->
                when (state) {
                    is ConnectionState.Connected -> {
                        Log.i(TAG, "WebSocket connected")
                    }
                    is ConnectionState.Disconnected -> {
                        Log.w(TAG, "WebSocket disconnected")
                    }
                    is ConnectionState.Connecting -> {
                        Log.d(TAG, "WebSocket connecting...")
                    }
                    is ConnectionState.Error -> {
                        Log.e(TAG, "WebSocket error: ${state.message} (retry ${state.retryCount})")
                    }
                }
            }
        }
    }
}
