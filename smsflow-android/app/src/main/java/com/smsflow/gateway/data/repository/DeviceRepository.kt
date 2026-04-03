package com.smsflow.gateway.data.repository

import android.os.Build
import com.smsflow.gateway.core.constants.AppConstants
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.data.remote.api.SMSFlowApi
import com.smsflow.gateway.data.remote.dto.DeviceInfoDto
import com.smsflow.gateway.data.remote.dto.PairRequest
import com.smsflow.gateway.data.remote.dto.SimInfoDto
import com.smsflow.gateway.domain.model.SimCard
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first

class DeviceRepository(
    private val api: SMSFlowApi,
    private val preferencesManager: PreferencesManager
) {

    val deviceId: Flow<String?> = preferencesManager.deviceId
    val isPaired: Flow<Boolean> = preferencesManager.isPaired
    val serverUrl: Flow<String> = preferencesManager.serverUrl

    suspend fun pairDevice(token: String, simCards: List<SimCard>, serverUrl: String): Result<Unit> {
        return try {
            val deviceInfo = DeviceInfoDto(
                name = Build.MODEL,
                model = "${Build.MANUFACTURER} ${Build.MODEL}",
                manufacturer = Build.MANUFACTURER,
                osVersion = Build.VERSION.RELEASE,
                appVersion = AppConstants.VERSION,
                simCount = simCards.size,
                sims = simCards.map { sim ->
                    SimInfoDto(
                        slot = sim.slotIndex,
                        carrier = sim.carrierName,
                        phoneNumber = sim.phoneNumber
                    )
                }
            )
            val response = api.pairDevice(PairRequest(token = token, device = deviceInfo))
            if (response.isSuccessful) {
                val body = response.body()!!
                preferencesManager.saveAuthData(
                    accessToken = body.accessToken,
                    refreshToken = body.refreshToken,
                    deviceId = body.deviceId,
                    wsUrl = body.wsUrl,
                    expiresAt = body.expiresAt
                )
                Result.success(Unit)
            } else {
                Result.failure(Exception("Pairing failed: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun sendHeartbeat(
        batteryLevel: Int,
        signalStrength: Int,
        queueDepth: Int
    ): Result<Unit> {
        val deviceId = preferencesManager.deviceId.first() ?: return Result.failure(Exception("Not paired"))
        return try {
            val response = api.sendHeartbeat(
                deviceId = deviceId,
                heartbeat = mapOf(
                    "batteryLevel" to batteryLevel,
                    "signalStrength" to signalStrength,
                    "queueDepth" to queueDepth,
                    "timestamp" to System.currentTimeMillis()
                )
            )
            if (response.isSuccessful) Result.success(Unit)
            else Result.failure(Exception("Heartbeat failed: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun setServerUrl(url: String) {
        preferencesManager.setServerUrl(url)
    }

    suspend fun unpairDevice() {
        preferencesManager.clearAuthData()
    }
}
