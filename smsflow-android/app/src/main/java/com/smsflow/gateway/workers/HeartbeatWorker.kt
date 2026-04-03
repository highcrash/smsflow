package com.smsflow.gateway.workers

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.smsflow.gateway.cloud.HeartbeatManager
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

class HeartbeatWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params), KoinComponent {

    private val heartbeatManager: HeartbeatManager by inject()

    override suspend fun doWork(): Result {
        return try {
            heartbeatManager.sendImmediateHeartbeat()
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
