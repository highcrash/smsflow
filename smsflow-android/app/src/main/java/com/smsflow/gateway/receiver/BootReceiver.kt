package com.smsflow.gateway.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.gateway.SmsGatewayService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

class BootReceiver : BroadcastReceiver(), KoinComponent {

    companion object {
        private const val TAG = "BootReceiver"
    }

    private val preferencesManager: PreferencesManager by inject()

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED &&
            intent.action != Intent.ACTION_MY_PACKAGE_REPLACED
        ) return

        Log.i(TAG, "Boot completed, checking if gateway should restart")

        val scope = CoroutineScope(Dispatchers.IO)
        scope.launch {
            val isPaired = preferencesManager.isPaired.first()
            val wasRunning = preferencesManager.isGatewayRunning.first()

            if (isPaired && wasRunning) {
                Log.i(TAG, "Restarting SMS Gateway after boot")
                val serviceIntent = SmsGatewayService.startIntent(context)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            } else {
                Log.d(TAG, "Gateway not restarted: paired=$isPaired, wasRunning=$wasRunning")
            }
        }
    }
}
