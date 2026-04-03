package com.smsflow.gateway.cloud

import android.content.Context
import android.util.Log
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.data.remote.websocket.WebSocketManager
import com.smsflow.gateway.data.remote.websocket.WebSocketMessage
import com.smsflow.gateway.data.remote.websocket.WebSocketMessageType
import com.smsflow.gateway.data.remote.websocket.SendSmsPayload
import com.smsflow.gateway.data.remote.websocket.SmsReceivedPayload
import com.smsflow.gateway.data.remote.websocket.StatusUpdatePayload
import com.smsflow.gateway.data.repository.MessageRepository
import com.smsflow.gateway.domain.model.Message
import com.smsflow.gateway.domain.model.MessageStatus
import com.smsflow.gateway.domain.usecase.SendSmsUseCase
import com.smsflow.gateway.gateway.MessageQueue
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.encodeToJsonElement
import java.util.UUID

class CloudSyncManager(
    private val context: Context,
    private val webSocketManager: WebSocketManager,
    private val messageRepository: MessageRepository,
    private val messageQueue: MessageQueue,
    private val heartbeatManager: HeartbeatManager,
    private val sendSmsUseCase: SendSmsUseCase,
    private val json: Json
) {
    companion object {
        private const val TAG = "CloudSyncManager"
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    fun start() {
        Log.i(TAG, "CloudSyncManager starting")
        webSocketManager.connect()
        heartbeatManager.start()

        // Listen for incoming WebSocket messages
        webSocketManager.incomingMessages
            .onEach { message ->
                message?.let { handleIncomingMessage(it) }
            }
            .launchIn(scope)
    }

    fun stop() {
        Log.i(TAG, "CloudSyncManager stopping")
        heartbeatManager.stop()
        webSocketManager.disconnect()
    }

    private suspend fun handleIncomingMessage(message: WebSocketMessage) {
        when (message.type) {
            WebSocketMessageType.SEND_SMS -> {
                handleSendSmsCommand(message)
            }
            WebSocketMessageType.CONFIG_UPDATE -> {
                Log.d(TAG, "Config update received")
            }
            WebSocketMessageType.PING -> {
                // Pong is sent by WebSocketManager automatically
            }
            else -> {
                Log.d(TAG, "Unhandled message type: ${message.type}")
            }
        }
    }

    private suspend fun handleSendSmsCommand(message: WebSocketMessage) {
        try {
            val payload = message.payload?.let {
                json.decodeFromJsonElement<SendSmsPayload>(it)
            } ?: return

            Log.i(TAG, "Received SEND_SMS command: to=${payload.to}, id=${payload.messageId}")

            sendSmsUseCase(
                phoneNumber = payload.to,
                body = payload.body,
                simSlot = payload.sim,
                externalId = payload.externalId ?: payload.messageId
            )
        } catch (e: Exception) {
            Log.e(TAG, "Failed to handle SEND_SMS command", e)
        }
    }

    fun notifySmsReceived(from: String, body: String, timestamp: Long, simSlot: Int) {
        scope.launch {
            try {
                val payload = SmsReceivedPayload(
                    from = from,
                    body = body,
                    timestamp = timestamp,
                    simSlot = simSlot
                )
                val message = WebSocketMessage(
                    id = UUID.randomUUID().toString(),
                    type = WebSocketMessageType.SMS_RECEIVED,
                    timestamp = System.currentTimeMillis(),
                    payload = json.encodeToJsonElement(SmsReceivedPayload.serializer(), payload)
                )
                webSocketManager.sendMessage(message)
                Log.d(TAG, "Notified server of incoming SMS from $from")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to notify SMS received", e)
            }
        }
    }

    fun notifyStatusUpdate(messageId: String, externalId: String?, status: MessageStatus, errorCode: String?) {
        scope.launch {
            try {
                val payload = StatusUpdatePayload(
                    messageId = messageId,
                    externalId = externalId,
                    status = status.name,
                    errorCode = errorCode,
                    timestamp = System.currentTimeMillis()
                )
                val wsMessage = WebSocketMessage(
                    id = UUID.randomUUID().toString(),
                    type = WebSocketMessageType.STATUS_UPDATE,
                    timestamp = System.currentTimeMillis(),
                    payload = json.encodeToJsonElement(StatusUpdatePayload.serializer(), payload)
                )
                webSocketManager.sendMessage(wsMessage)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to notify status update", e)
            }
        }
    }
}
