package com.smsflow.gateway.data.remote.websocket

import android.util.Log
import com.smsflow.gateway.core.constants.AppConstants
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.domain.model.ConnectionState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.util.UUID
import kotlin.math.min
import kotlin.random.Random

class WebSocketManager(
    private val okHttpClient: OkHttpClient,
    private val preferencesManager: PreferencesManager,
    private val json: Json
) {
    companion object {
        private const val TAG = "WebSocketManager"
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var webSocket: WebSocket? = null
    private var reconnectJob: Job? = null
    private var reconnectAttempts = 0

    private val _connectionState = MutableStateFlow<ConnectionState>(ConnectionState.Disconnected)
    val connectionState: StateFlow<ConnectionState> = _connectionState.asStateFlow()

    private val _incomingMessages = MutableStateFlow<WebSocketMessage?>(null)
    val incomingMessages: StateFlow<WebSocketMessage?> = _incomingMessages.asStateFlow()

    fun connect() {
        scope.launch {
            val wsUrl = preferencesManager.wsUrl.first()
            val accessToken = preferencesManager.accessToken.first()
            if (wsUrl.isNullOrEmpty() || accessToken.isNullOrEmpty()) {
                Log.w(TAG, "Cannot connect: missing wsUrl or accessToken")
                return@launch
            }
            connectToUrl(wsUrl, accessToken)
        }
    }

    private fun connectToUrl(wsUrl: String, accessToken: String) {
        _connectionState.value = ConnectionState.Connecting
        val request = Request.Builder()
            .url(wsUrl)
            .addHeader("Authorization", "Bearer $accessToken")
            .build()
        webSocket = okHttpClient.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.i(TAG, "WebSocket connected")
                reconnectAttempts = 0
                _connectionState.value = ConnectionState.Connected
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    val message = json.decodeFromString<WebSocketMessage>(text)
                    _incomingMessages.value = message
                    if (message.type == WebSocketMessageType.PING) {
                        sendPong(message.id)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to parse WebSocket message: $text", e)
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "WebSocket failure: ${t.message}")
                _connectionState.value = ConnectionState.Error(
                    message = t.message ?: "Unknown error",
                    retryCount = reconnectAttempts
                )
                scheduleReconnect()
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                Log.i(TAG, "WebSocket closing: $code $reason")
                webSocket.close(1000, null)
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.i(TAG, "WebSocket closed: $code $reason")
                _connectionState.value = ConnectionState.Disconnected
                if (code != 1000) {
                    scheduleReconnect()
                }
            }
        })
    }

    private fun sendPong(pingId: String) {
        val pong = WebSocketMessage(
            id = pingId,
            type = WebSocketMessageType.PONG,
            timestamp = System.currentTimeMillis()
        )
        sendMessage(pong)
    }

    fun sendMessage(message: WebSocketMessage): Boolean {
        return try {
            val text = json.encodeToString(message)
            webSocket?.send(text) ?: false
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send message", e)
            false
        }
    }

    fun sendRawMessage(type: String, payload: kotlinx.serialization.json.JsonElement? = null): Boolean {
        val message = WebSocketMessage(
            id = UUID.randomUUID().toString(),
            type = type,
            timestamp = System.currentTimeMillis(),
            payload = payload
        )
        return sendMessage(message)
    }

    private fun scheduleReconnect() {
        reconnectJob?.cancel()
        reconnectJob = scope.launch {
            reconnectAttempts++
            val baseDelay = AppConstants.WS_RECONNECT_BASE_DELAY_MS
            val maxDelay = AppConstants.WS_RECONNECT_MAX_DELAY_MS
            val multiplier = AppConstants.WS_RECONNECT_MULTIPLIER
            val jitter = AppConstants.WS_RECONNECT_JITTER

            val exponentialDelay = (baseDelay * Math.pow(multiplier, reconnectAttempts.toDouble())).toLong()
            val clampedDelay = min(exponentialDelay, maxDelay)
            val jitterRange = (clampedDelay * jitter).toLong()
            val finalDelay = clampedDelay + Random.nextLong(-jitterRange, jitterRange)

            Log.i(TAG, "Reconnecting in ${finalDelay}ms (attempt $reconnectAttempts)")
            delay(finalDelay)

            val wsUrl = preferencesManager.wsUrl.first()
            val accessToken = preferencesManager.accessToken.first()
            if (!wsUrl.isNullOrEmpty() && !accessToken.isNullOrEmpty()) {
                connectToUrl(wsUrl, accessToken)
            }
        }
    }

    fun disconnect() {
        reconnectJob?.cancel()
        webSocket?.close(1000, "User disconnected")
        webSocket = null
        _connectionState.value = ConnectionState.Disconnected
    }
}
