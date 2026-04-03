package com.smsflow.gateway.gateway

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.SmsManager
import android.util.Log
import com.smsflow.gateway.core.constants.AppConstants
import com.smsflow.gateway.data.repository.MessageRepository
import com.smsflow.gateway.domain.model.MessageStatus
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

class DeliveryReportReceiver : BroadcastReceiver(), KoinComponent {

    companion object {
        private const val TAG = "DeliveryReportReceiver"
    }

    private val messageRepository: MessageRepository by inject()

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != AppConstants.SMS_DELIVERED_ACTION) return

        val messageId = intent.getStringExtra("messageId") ?: return

        val scope = CoroutineScope(Dispatchers.IO)
        scope.launch {
            when (resultCode) {
                Activity.RESULT_OK -> {
                    Log.i(TAG, "SMS delivered: $messageId")
                    messageRepository.updateStatus(messageId, MessageStatus.DELIVERED)
                }
                else -> {
                    Log.w(TAG, "SMS delivery failed: $messageId, resultCode=$resultCode")
                    // Don't change status here — it was already SENT
                }
            }
        }
    }
}
