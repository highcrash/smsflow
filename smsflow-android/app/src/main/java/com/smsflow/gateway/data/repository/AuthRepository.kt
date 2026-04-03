package com.smsflow.gateway.data.repository

import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.data.remote.api.SMSFlowApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first

class AuthRepository(
    private val api: SMSFlowApi,
    private val preferencesManager: PreferencesManager
) {

    val isPaired: Flow<Boolean> = preferencesManager.isPaired
    val accessToken: Flow<String?> = preferencesManager.accessToken
    val deviceId: Flow<String?> = preferencesManager.deviceId

    suspend fun refreshAccessToken(): Result<String> {
        return try {
            val refreshToken = preferencesManager.refreshToken.first()
                ?: return Result.failure(Exception("No refresh token"))
            val response = api.refreshToken(mapOf("refreshToken" to refreshToken))
            if (response.isSuccessful) {
                val body = response.body()!!
                val newToken = body["accessToken"] ?: return Result.failure(Exception("No access token in response"))
                val expiresAt = body["expiresAt"]?.toLongOrNull() ?: (System.currentTimeMillis() + 3600000L)
                preferencesManager.saveAccessToken(newToken, expiresAt)
                Result.success(newToken)
            } else {
                Result.failure(Exception("Token refresh failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun isTokenExpired(): Boolean {
        val expiresAt = preferencesManager.tokenExpiresAt.first()
        return System.currentTimeMillis() >= (expiresAt - 60000L) // Refresh 1 min before expiry
    }

    suspend fun logout() {
        preferencesManager.clearAuthData()
    }
}
