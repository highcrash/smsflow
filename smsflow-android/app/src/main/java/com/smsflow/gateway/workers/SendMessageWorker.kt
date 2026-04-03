package com.smsflow.gateway.workers

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.smsflow.gateway.domain.usecase.SendSmsUseCase
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

class SendMessageWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params), KoinComponent {

    private val sendSmsUseCase: SendSmsUseCase by inject()

    override suspend fun doWork(): Result {
        val phoneNumber = inputData.getString("phoneNumber") ?: return Result.failure()
        val body = inputData.getString("body") ?: return Result.failure()
        val simSlot = inputData.getInt("simSlot", 0)
        val externalId = inputData.getString("externalId")

        return try {
            val result = sendSmsUseCase(phoneNumber, body, simSlot, externalId)
            if (result.isSuccess) Result.success()
            else Result.retry()
        } catch (e: Exception) {
            Result.failure()
        }
    }
}
