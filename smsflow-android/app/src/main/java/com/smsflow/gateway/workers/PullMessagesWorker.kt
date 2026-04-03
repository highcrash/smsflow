package com.smsflow.gateway.workers

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.smsflow.gateway.domain.usecase.SyncMessagesUseCase
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

class PullMessagesWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params), KoinComponent {

    private val syncMessagesUseCase: SyncMessagesUseCase by inject()

    override suspend fun doWork(): Result {
        return try {
            val result = syncMessagesUseCase()
            if (result.isSuccess) Result.success()
            else Result.retry()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
