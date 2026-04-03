package com.smsflow.gateway.gateway

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.telephony.SmsManager
import android.telephony.SubscriptionManager
import android.util.Log
import com.smsflow.gateway.core.constants.AppConstants
import com.smsflow.gateway.domain.model.Message

class SmsSender(
    private val context: Context,
    private val simSelector: SimSelector
) {
    companion object {
        private const val TAG = "SmsSender"
    }

    suspend fun sendMessage(message: Message): Result<Unit> {
        return try {
            val subscriptionId = simSelector.selectSubscriptionId(message.simSlot)
            val smsManager = getSmsManager(subscriptionId)

            val sentIntent = createSentPendingIntent(message.id)
            val deliveryIntent = createDeliveryPendingIntent(message.id)

            if (message.body.length <= AppConstants.SMS_MAX_LENGTH) {
                smsManager.sendTextMessage(
                    message.phoneNumber,
                    null,
                    message.body,
                    sentIntent,
                    deliveryIntent
                )
            } else {
                val parts = smsManager.divideMessage(message.body)
                val sentIntents = ArrayList<PendingIntent>(parts.size)
                val deliveryIntents = ArrayList<PendingIntent>(parts.size)

                for (i in parts.indices) {
                    sentIntents.add(createSentPendingIntent(message.id, i))
                    deliveryIntents.add(createDeliveryPendingIntent(message.id, i))
                }

                smsManager.sendMultipartTextMessage(
                    message.phoneNumber,
                    null,
                    parts,
                    sentIntents,
                    deliveryIntents
                )
            }

            Log.i(TAG, "SMS sent to ${message.phoneNumber}, id=${message.id}")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send SMS to ${message.phoneNumber}", e)
            Result.failure(e)
        }
    }

    private fun getSmsManager(subscriptionId: Int): SmsManager {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (subscriptionId == SubscriptionManager.INVALID_SUBSCRIPTION_ID) {
                context.getSystemService(SmsManager::class.java)
            } else {
                context.getSystemService(SmsManager::class.java)
                    .createForSubscriptionId(subscriptionId)
            }
        } else {
            @Suppress("DEPRECATION")
            if (subscriptionId == SubscriptionManager.INVALID_SUBSCRIPTION_ID) {
                SmsManager.getDefault()
            } else {
                SmsManager.getSmsManagerForSubscriptionId(subscriptionId)
            }
        }
    }

    private fun createSentPendingIntent(messageId: String, partIndex: Int = 0): PendingIntent {
        val intent = Intent(AppConstants.SMS_SENT_ACTION).apply {
            setPackage(context.packageName)
            putExtra("messageId", messageId)
            putExtra("partIndex", partIndex)
        }
        val requestCode = (messageId.hashCode() + partIndex).and(0x7FFFFFFF)
        return PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun createDeliveryPendingIntent(messageId: String, partIndex: Int = 0): PendingIntent {
        val intent = Intent(AppConstants.SMS_DELIVERED_ACTION).apply {
            setPackage(context.packageName)
            putExtra("messageId", messageId)
            putExtra("partIndex", partIndex)
        }
        val requestCode = (messageId.hashCode() + partIndex + 10000).and(0x7FFFFFFF)
        return PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
}
