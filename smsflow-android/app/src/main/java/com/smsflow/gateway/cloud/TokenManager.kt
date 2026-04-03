package com.smsflow.gateway.cloud

import android.content.Context
import android.util.Log
import com.smsflow.gateway.core.constants.AppConstants
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.data.remote.api.SMSFlowApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class TokenManager(
    private val context: Context,
    private val api: SMSFlowApi,
    private val preferencesManager: PreferencesManager
) {
    companion object {
        private const val TAG = "TokenManager"
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    suspend fun getValidAccessToken(): String? {
        val token = preferencesManager.accessToken.first()
        val expiresAt = preferencesManager.tokenExpiresAt.first()
        val now = System.currentTimeMillis()

        if (token.isNullOrEmpty()) return null

        // Refresh if within 5 minutes of expiry
        if (now >= expiresAt - (5 * 60 * 1000L)) {
            return refreshToken() ?: token
        }
        return token
    }

    suspend fun refreshToken(): String? {
        return try {
            val refreshToken = preferencesManager.refreshToken.first()
                ?: return null

            val response = api.refreshToken(mapOf("refreshToken" to refreshToken))
            if (response.isSuccessful) {
                val body = response.body()!!
                val newToken = body["accessToken"] ?: return null
                val expiresAt = body["expiresAt"]?.toLongOrNull()
                    ?: (System.currentTimeMillis() + 3600000L)
                preferencesManager.saveAccessToken(newToken, expiresAt)
                Log.i(TAG, "Token refreshed successfully")
                newToken
            } else {
                Log.e(TAG, "Token refresh failed: ${response.code()}")
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Token refresh error", e)
            null
        }
    }

    fun scheduleTokenRefresh() {
        scope.launch {
            val expiresAt = preferencesManager.tokenExpiresAt.first()
            val now = System.currentTimeMillis()
            val refreshAt = expiresAt - (5 * 60 * 1000L)
            val delay = (refreshAt - now).coerceAtLeast(0)
            kotlinx.coroutines.delay(delay)
            refreshToken()
        }
    }
}
