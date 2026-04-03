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

class SentStatusReceiver : BroadcastReceiver(), KoinComponent {

    companion object {
        private const val TAG = "SentStatusReceiver"
    }

    private val messageRepository: MessageRepository by inject()

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != AppConstants.SMS_SENT_ACTION) return

        val messageId = intent.getStringExtra("messageId") ?: return

        val scope = CoroutineScope(Dispatchers.IO)
        scope.launch {
            when (resultCode) {
                Activity.RESULT_OK -> {
                    Log.i(TAG, "SMS sent successfully: $messageId")
                    messageRepository.updateStatus(messageId, MessageStatus.SENT)
                }
                SmsManager.RESULT_ERROR_GENERIC_FAILURE -> {
                    Log.e(TAG, "SMS generic failure: $messageId")
                    messageRepository.updateStatusWithError(messageId, MessageStatus.FAILED, "GENERIC_FAILURE")
                }
                SmsManager.RESULT_ERROR_NO_SERVICE -> {
                    Log.e(TAG, "SMS no service: $messageId")
                    messageRepository.updateStatusWithError(messageId, MessageStatus.FAILED, "NO_SERVICE")
                }
                SmsManager.RESULT_ERROR_NULL_PDU -> {
                    Log.e(TAG, "SMS null PDU: $messageId")
                    messageRepository.updateStatusWithError(messageId, MessageStatus.FAILED, "NULL_PDU")
                }
                SmsManager.RESULT_ERROR_RADIO_OFF -> {
                    Log.e(TAG, "SMS radio off: $messageId")
                    messageRepository.updateStatusWithError(messageId, MessageStatus.FAILED, "RADIO_OFF")
                }
                else -> {
                    Log.e(TAG, "SMS unknown error: $messageId, code=$resultCode")
                    messageRepository.updateStatusWithError(messageId, MessageStatus.FAILED, "ERROR_$resultCode")
                }
            }
        }
    }
}
