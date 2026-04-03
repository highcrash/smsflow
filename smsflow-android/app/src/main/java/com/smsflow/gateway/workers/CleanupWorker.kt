package com.smsflow.gateway.workers

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.smsflow.gateway.core.constants.AppConstants
import com.smsflow.gateway.data.local.LogDao
import com.smsflow.gateway.data.repository.MessageRepository
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

class CleanupWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params), KoinComponent {

    private val messageRepository: MessageRepository by inject()
    private val logDao: LogDao by inject()

    override suspend fun doWork(): Result {
        return try {
            // Clean old messages
            messageRepository.deleteOlderThan(AppConstants.MESSAGE_RETENTION_DAYS)

            // Clean old logs
            val logCutoff = System.currentTimeMillis() - (AppConstants.LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000L)
            logDao.deleteOlderThan(logCutoff)

            Result.success()
        } catch (e: Exception) {
            Result.failure()
        }
    }
}
