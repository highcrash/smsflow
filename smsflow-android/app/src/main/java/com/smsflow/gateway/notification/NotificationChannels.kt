package com.smsflow.gateway.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import com.smsflow.gateway.core.constants.AppConstants

object NotificationChannels {

    fun createAllChannels(context: Context) {
        val notificationManager = context.getSystemService(NotificationManager::class.java)

        // Gateway Service Channel
        val gatewayChannel = NotificationChannel(
            AppConstants.NOTIFICATION_CHANNEL_GATEWAY,
            "Gateway Service",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "SMSFlow Gateway background service notifications"
            setShowBadge(false)
            enableLights(false)
            enableVibration(false)
        }

        // Messages Channel
        val messagesChannel = NotificationChannel(
            AppConstants.NOTIFICATION_CHANNEL_MESSAGES,
            "Messages",
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = "SMS message notifications"
            setShowBadge(true)
        }

        notificationManager.createNotificationChannels(
            listOf(gatewayChannel, messagesChannel)
        )
    }
}
