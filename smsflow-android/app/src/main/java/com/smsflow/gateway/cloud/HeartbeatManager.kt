package com.smsflow.gateway.cloud

import android.content.Context
import android.util.Log
import com.smsflow.gateway.core.constants.AppConstants
import com.smsflow.gateway.core.extensions.getBatteryLevel
import com.smsflow.gateway.core.extensions.getSignalStrength
import com.smsflow.gateway.core.extensions.isCharging
import com.smsflow.gateway.data.remote.websocket.HeartbeatPayload
import com.smsflow.gateway.data.remote.websocket.WebSocketManager
import com.smsflow.gateway.data.remote.websocket.WebSocketMessage
import com.smsflow.gateway.data.remote.websocket.WebSocketMessageType
import com.smsflow.gateway.data.repository.MessageRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.encodeToJsonElement
import java.util.UUID

class HeartbeatManager(
    private val context: Context,
    private val webSocketManager: WebSocketManager,
    private val messageRepository: MessageRepository,
    private val json: Json
) {
    companion object {
        private const val TAG = "HeartbeatManager"
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var heartbeatJob: Job? = null

    fun start() {
        heartbeatJob?.cancel()
        heartbeatJob = scope.launch {
            while (isActive) {
                delay(AppConstants.WS_HEARTBEAT_INTERVAL_MS)
                sendHeartbeat()
            }
        }
        Log.i(TAG, "Heartbeat manager started")
    }

    fun stop() {
        heartbeatJob?.cancel()
        heartbeatJob = null
        Log.i(TAG, "Heartbeat manager stopped")
    }

    private suspend fun sendHeartbeat() {
        try {
            val queueDepth = messageRepository.getPendingMessages().size
            val batteryLevel = context.getBatteryLevel()
            val signalStrength = context.getSignalStrength()
            val isCharging = context.isCharging()

            val payload = HeartbeatPayload(
                batteryLevel = batteryLevel,
                batteryCharging = isCharging,
                signalStrength = signalStrength,
                queueDepth = queueDepth,
                isGatewayRunning = true
            )

            val message = WebSocketMessage(
                id = UUID.randomUUID().toString(),
                type = WebSocketMessageType.HEARTBEAT,
                timestamp = System.currentTimeMillis(),
                payload = json.encodeToJsonElement(payload)
            )

            val sent = webSocketManager.sendMessage(message)
            if (sent) {
                Log.d(TAG, "Heartbeat sent: battery=$batteryLevel%, signal=$signalStrength, queue=$queueDepth")
            } else {
                Log.w(TAG, "Failed to send heartbeat — WebSocket not connected")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Heartbeat error", e)
        }
    }

    fun sendImmediateHeartbeat() {
        scope.launch { sendHeartbeat() }
    }
}
