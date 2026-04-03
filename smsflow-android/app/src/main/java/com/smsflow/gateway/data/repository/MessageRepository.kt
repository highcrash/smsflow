package com.smsflow.gateway.data.repository

import com.smsflow.gateway.core.constants.AppConstants
import com.smsflow.gateway.data.local.LogDao
import com.smsflow.gateway.data.local.LogEntity
import com.smsflow.gateway.data.local.MessageDao
import com.smsflow.gateway.data.local.MessageEntity
import com.smsflow.gateway.domain.model.Message
import com.smsflow.gateway.domain.model.MessageStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class MessageRepository(
    private val messageDao: MessageDao,
    private val logDao: LogDao
) {

    fun getRecentMessages(limit: Int = 50): Flow<List<Message>> {
        return messageDao.getRecentMessages(limit).map { entities ->
            entities.map { it.toDomain() }
        }
    }

    fun observePendingMessages(): Flow<List<Message>> {
        return messageDao.observePendingMessages().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    fun observePendingCount(): Flow<Int> = messageDao.observePendingCount()

    fun observeTodaySentCount(): Flow<Int> {
        val startOfDay = System.currentTimeMillis() - (System.currentTimeMillis() % 86400000L)
        return messageDao.observeTodaySentCount(startOfDay)
    }

    suspend fun getPendingMessages(): List<Message> {
        return messageDao.getPendingMessages().map { it.toDomain() }
    }

    suspend fun getById(id: String): Message? {
        return messageDao.getById(id)?.toDomain()
    }

    suspend fun insert(message: Message) {
        messageDao.insert(message.toEntity())
    }

    suspend fun insertAll(messages: List<Message>) {
        messageDao.insertAll(messages.map { it.toEntity() })
    }

    suspend fun updateStatus(id: String, status: MessageStatus) {
        messageDao.updateStatus(id, status.name, System.currentTimeMillis())
    }

    suspend fun updateStatusWithError(id: String, status: MessageStatus, errorCode: String?) {
        messageDao.updateStatusWithError(id, status.name, errorCode, System.currentTimeMillis())
    }

    suspend fun deleteOlderThan(days: Long) {
        val cutoff = System.currentTimeMillis() - (days * 24 * 60 * 60 * 1000L)
        messageDao.deleteOlderThan(cutoff)
    }

    suspend fun log(level: String, tag: String, message: String) {
        logDao.insert(
            LogEntity(
                level = level,
                tag = tag,
                message = message,
                timestamp = System.currentTimeMillis()
            )
        )
    }

    private fun MessageEntity.toDomain() = Message(
        id = id,
        externalId = externalId,
        phoneNumber = phoneNumber,
        body = body,
        status = MessageStatus.fromString(status),
        simSlot = simSlot,
        createdAt = createdAt,
        updatedAt = updatedAt,
        errorCode = errorCode
    )

    private fun Message.toEntity() = MessageEntity(
        id = id,
        externalId = externalId,
        phoneNumber = phoneNumber,
        body = body,
        status = status.name,
        simSlot = simSlot,
        createdAt = createdAt,
        updatedAt = updatedAt,
        errorCode = errorCode
    )
}
