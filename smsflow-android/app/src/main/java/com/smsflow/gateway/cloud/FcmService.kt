package com.smsflow.gateway.cloud

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.domain.usecase.SendSmsUseCase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import org.koin.android.ext.android.inject

class FcmService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "FcmService"
    }

    private val preferencesManager: PreferencesManager by inject()
    private val sendSmsUseCase: SendSmsUseCase by inject()
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun onNewToken(token: String) {
        Log.i(TAG, "New FCM token received")
        scope.launch {
            preferencesManager.saveFcmToken(token)
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        Log.i(TAG, "FCM message received: ${message.messageType}")
        val data = message.data

        when (data["type"]) {
            "SEND_SMS" -> {
                val to = data["to"] ?: return
                val body = data["body"] ?: return
                val sim = data["sim"]?.toIntOrNull() ?: 0
                val externalId = data["externalId"]

                scope.launch {
                    sendSmsUseCase(
                        phoneNumber = to,
                        body = body,
                        simSlot = sim,
                        externalId = externalId
                    )
                }
            }
            else -> {
                Log.d(TAG, "Unhandled FCM message type: ${data["type"]}")
            }
        }
    }
}
