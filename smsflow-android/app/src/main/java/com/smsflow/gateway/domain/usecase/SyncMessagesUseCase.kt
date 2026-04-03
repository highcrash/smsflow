package com.smsflow.gateway.domain.usecase

import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.data.remote.api.SMSFlowApi
import com.smsflow.gateway.data.repository.MessageRepository
import com.smsflow.gateway.domain.model.Message
import com.smsflow.gateway.domain.model.MessageStatus
import kotlinx.coroutines.flow.first
import java.util.UUID

class SyncMessagesUseCase(
    private val api: SMSFlowApi,
    private val messageRepository: MessageRepository,
    private val preferencesManager: PreferencesManager
) {

    suspend operator fun invoke(): Result<Int> {
        return try {
            val deviceId = preferencesManager.deviceId.first()
                ?: return Result.failure(Exception("Not paired"))

            val response = api.getPendingMessages(deviceId)
            if (!response.isSuccessful) {
                return Result.failure(Exception("Failed to fetch messages: ${response.code()}"))
            }

            val messages = response.body() ?: emptyList()
            val now = System.currentTimeMillis()
            val domainMessages = messages.map { dto ->
                Message(
                    id = UUID.randomUUID().toString(),
                    externalId = dto.externalId ?: dto.id,
                    phoneNumber = dto.to,
                    body = dto.body,
                    status = MessageStatus.QUEUED,
                    simSlot = dto.sim,
                    createdAt = now,
                    updatedAt = now,
                    errorCode = null
                )
            }

            if (domainMessages.isNotEmpty()) {
                messageRepository.insertAll(domainMessages)
            }

            Result.success(domainMessages.size)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
