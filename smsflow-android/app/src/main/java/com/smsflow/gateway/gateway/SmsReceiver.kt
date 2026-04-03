package com.smsflow.gateway.gateway

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import com.smsflow.gateway.cloud.CloudSyncManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

class SmsReceiver : BroadcastReceiver(), KoinComponent {

    companion object {
        private const val TAG = "SmsReceiver"
    }

    private val cloudSyncManager: CloudSyncManager by inject()

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        if (messages.isNullOrEmpty()) return

        // Merge multipart messages
        val senderMap = mutableMapOf<String, StringBuilder>()
        for (message in messages) {
            val from = message.displayOriginatingAddress ?: continue
            senderMap.getOrPut(from) { StringBuilder() }.append(message.displayMessageBody)
        }

        val scope = CoroutineScope(Dispatchers.IO)
        for ((from, body) in senderMap) {
            Log.i(TAG, "Received SMS from $from: ${body.length} chars")
            scope.launch {
                cloudSyncManager.notifySmsReceived(
                    from = from,
                    body = body.toString(),
                    timestamp = System.currentTimeMillis(),
                    simSlot = 0
                )
            }
        }
    }
}
