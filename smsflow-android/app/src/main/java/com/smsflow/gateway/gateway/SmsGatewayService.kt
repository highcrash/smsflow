package com.smsflow.gateway.gateway

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.smsflow.gateway.MainActivity
import com.smsflow.gateway.R
import com.smsflow.gateway.cloud.CloudSyncManager
import com.smsflow.gateway.core.constants.AppConstants
import com.smsflow.gateway.data.preferences.PreferencesManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import org.koin.android.ext.android.inject

class SmsGatewayService : Service() {

    companion object {
        private const val TAG = "SmsGatewayService"
        const val ACTION_START = "com.smsflow.gateway.START_GATEWAY"
        const val ACTION_STOP = "com.smsflow.gateway.STOP_GATEWAY"

        fun startIntent(context: Context): Intent {
            return Intent(context, SmsGatewayService::class.java).apply {
                action = ACTION_START
            }
        }

        fun stopIntent(context: Context): Intent {
            return Intent(context, SmsGatewayService::class.java).apply {
                action = ACTION_STOP
            }
        }
    }

    private val messageQueue: MessageQueue by inject()
    private val cloudSyncManager: CloudSyncManager by inject()
    private val preferencesManager: PreferencesManager by inject()

    private val serviceScope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        Log.i(TAG, "SmsGatewayService created")
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopGateway()
                return START_NOT_STICKY
            }
            else -> {
                startForeground(AppConstants.NOTIFICATION_ID_GATEWAY, buildNotification())
                startGateway()
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        Log.i(TAG, "SmsGatewayService destroyed")
        stopGateway()
        serviceScope.cancel()
        super.onDestroy()
    }

    private fun startGateway() {
        Log.i(TAG, "Starting SMS gateway")
        serviceScope.launch {
            preferencesManager.setGatewayRunning(true)
        }
        messageQueue.start()
        cloudSyncManager.start()
    }

    private fun stopGateway() {
        Log.i(TAG, "Stopping SMS gateway")
        serviceScope.launch {
            preferencesManager.setGatewayRunning(false)
        }
        messageQueue.stop()
        cloudSyncManager.stop()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            AppConstants.NOTIFICATION_CHANNEL_GATEWAY,
            getString(R.string.notification_channel_gateway),
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "SMSFlow Gateway background service"
            setShowBadge(false)
        }
        val notificationManager = getSystemService(NotificationManager::class.java)
        notificationManager.createNotificationChannel(channel)
    }

    private fun buildNotification(): Notification {
        val activityIntent = Intent(this, MainActivity::class.java)
        val contentIntent = PendingIntent.getActivity(
            this, 0, activityIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val stopIntent = PendingIntent.getService(
            this, 1, stopIntent(this),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, AppConstants.NOTIFICATION_CHANNEL_GATEWAY)
            .setContentTitle(getString(R.string.notification_gateway_title))
            .setContentText(getString(R.string.notification_gateway_text))
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(contentIntent)
            .setOngoing(true)
            .setSilent(true)
            .addAction(0, "Stop", stopIntent)
            .build()
    }
}
