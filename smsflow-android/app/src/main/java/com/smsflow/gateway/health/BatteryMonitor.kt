package com.smsflow.gateway.health

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class BatteryMonitor {

    private val _batteryLevel = MutableStateFlow(100)
    val batteryLevel: StateFlow<Int> = _batteryLevel.asStateFlow()

    private val _isCharging = MutableStateFlow(false)
    val isCharging: StateFlow<Boolean> = _isCharging.asStateFlow()

    fun updateBatteryStatus(level: Int, charging: Boolean) {
        if (level >= 0) _batteryLevel.value = level
        _isCharging.value = charging
    }

    fun getCurrentLevel(): Int = _batteryLevel.value
    fun isCurrentlyCharging(): Boolean = _isCharging.value
}
