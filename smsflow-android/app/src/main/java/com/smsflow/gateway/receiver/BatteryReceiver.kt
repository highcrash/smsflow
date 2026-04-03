package com.smsflow.gateway.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.BatteryManager
import android.util.Log
import com.smsflow.gateway.health.BatteryMonitor
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

class BatteryReceiver : BroadcastReceiver(), KoinComponent {

    companion object {
        private const val TAG = "BatteryReceiver"
    }

    private val batteryMonitor: BatteryMonitor by inject()

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BATTERY_CHANGED) return

        val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
        val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
        val isCharging = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1).let {
            it == BatteryManager.BATTERY_STATUS_CHARGING || it == BatteryManager.BATTERY_STATUS_FULL
        }

        val batteryPercent = if (level >= 0 && scale > 0) (level * 100 / scale) else -1
        Log.d(TAG, "Battery: $batteryPercent%, charging=$isCharging")

        batteryMonitor.updateBatteryStatus(batteryPercent, isCharging)
    }
}
