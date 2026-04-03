package com.smsflow.gateway.workers

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.smsflow.gateway.data.remote.api.SMSFlowApi
import com.smsflow.gateway.data.remote.dto.StatusUpdateDto
import com.smsflow.gateway.data.repository.MessageRepository
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

class SyncStatusWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params), KoinComponent {

    private val api: SMSFlowApi by inject()
    private val messageRepository: MessageRepository by inject()

    override suspend fun doWork(): Result {
        val messageId = inputData.getString("messageId") ?: return Result.failure()
        val status = inputData.getString("status") ?: return Result.failure()
        val errorCode = inputData.getString("errorCode")
        val externalId = inputData.getString("externalId")

        return try {
            val response = api.updateMessageStatus(
                messageId = messageId,
                status = StatusUpdateDto(
                    messageId = messageId,
                    externalId = externalId,
                    status = status,
                    errorCode = errorCode,
                    timestamp = System.currentTimeMillis()
                )
            )
            if (response.isSuccessful) Result.success()
            else Result.retry()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
