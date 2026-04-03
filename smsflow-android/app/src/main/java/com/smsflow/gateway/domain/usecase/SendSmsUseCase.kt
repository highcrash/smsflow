package com.smsflow.gateway.domain.usecase

import com.smsflow.gateway.data.repository.MessageRepository
import com.smsflow.gateway.domain.model.Message
import com.smsflow.gateway.domain.model.MessageStatus
import com.smsflow.gateway.gateway.MessageQueue
import java.util.UUID

class SendSmsUseCase(
    private val messageRepository: MessageRepository,
    private val messageQueue: MessageQueue
) {

    suspend operator fun invoke(
        phoneNumber: String,
        body: String,
        simSlot: Int = 0,
        externalId: String? = null
    ): Result<Message> {
        return try {
            val now = System.currentTimeMillis()
            val message = Message(
                id = UUID.randomUUID().toString(),
                externalId = externalId,
                phoneNumber = phoneNumber,
                body = body,
                status = MessageStatus.PENDING,
                simSlot = simSlot,
                createdAt = now,
                updatedAt = now,
                errorCode = null
            )
            messageRepository.insert(message)
            messageQueue.enqueue(message)
            Result.success(message)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
