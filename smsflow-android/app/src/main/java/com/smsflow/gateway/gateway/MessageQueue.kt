package com.smsflow.gateway.gateway

import android.util.Log
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.data.repository.MessageRepository
import com.smsflow.gateway.domain.model.Message
import com.smsflow.gateway.domain.model.MessageStatus
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class MessageQueue(
    private val smsSender: SmsSender,
    private val messageRepository: MessageRepository,
    private val preferencesManager: PreferencesManager
) {
    companion object {
        private const val TAG = "MessageQueue"
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val channel = Channel<Message>(Channel.UNLIMITED)
    private var processingJob: Job? = null

    fun start() {
        processingJob?.cancel()
        processingJob = scope.launch {
            // Load any pending messages from DB on start
            val pending = messageRepository.getPendingMessages()
            pending.forEach { channel.send(it) }
            Log.i(TAG, "MessageQueue started with ${pending.size} pending messages")

            processQueue()
        }
    }

    fun stop() {
        processingJob?.cancel()
        processingJob = null
    }

    suspend fun enqueue(message: Message) {
        messageRepository.updateStatus(message.id, MessageStatus.QUEUED)
        channel.send(message)
        Log.d(TAG, "Enqueued message ${message.id} to ${message.phoneNumber}")
    }

    fun queueSize(): Int = channel.isEmpty.let { if (it) 0 else -1 } // estimate

    private suspend fun processQueue() {
        for (message in channel) {
            try {
                val rateLimit = preferencesManager.rateLimit.first()
                val delayMs = (1000L / rateLimit).coerceAtLeast(100L)

                messageRepository.updateStatus(message.id, MessageStatus.SENDING)

                val result = smsSender.sendMessage(message)
                if (result.isFailure) {
                    Log.e(TAG, "Failed to send ${message.id}: ${result.exceptionOrNull()?.message}")
                    messageRepository.updateStatusWithError(
                        message.id,
                        MessageStatus.FAILED,
                        result.exceptionOrNull()?.message
                    )
                }

                delay(delayMs)
            } catch (e: Exception) {
                Log.e(TAG, "Error processing message ${message.id}", e)
                messageRepository.updateStatusWithError(message.id, MessageStatus.FAILED, e.message)
            }
        }
    }
}
