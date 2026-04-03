package com.smsflow.gateway.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.smsflow.gateway.core.constants.AppConstants
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(
    name = AppConstants.PREFS_NAME
)

class PreferencesManager(private val context: Context) {

    companion object {
        val KEY_ACCESS_TOKEN = stringPreferencesKey("access_token")
        val KEY_REFRESH_TOKEN = stringPreferencesKey("refresh_token")
        val KEY_DEVICE_ID = stringPreferencesKey("device_id")
        val KEY_SERVER_URL = stringPreferencesKey("server_url")
        val KEY_WS_URL = stringPreferencesKey("ws_url")
        val KEY_IS_PAIRED = booleanPreferencesKey("is_paired")
        val KEY_IS_GATEWAY_RUNNING = booleanPreferencesKey("is_gateway_running")
        val KEY_LOCAL_SERVER_ENABLED = booleanPreferencesKey("local_server_enabled")
        val KEY_LOCAL_SERVER_PORT = intPreferencesKey("local_server_port")
        val KEY_LOCAL_SERVER_PASSWORD = stringPreferencesKey("local_server_password")
        val KEY_SIM_STRATEGY = stringPreferencesKey("sim_strategy")
        val KEY_PREFERRED_SIM_SLOT = intPreferencesKey("preferred_sim_slot")
        val KEY_RATE_LIMIT = intPreferencesKey("rate_limit")
        val KEY_DARK_MODE = booleanPreferencesKey("dark_mode")
        val KEY_FCM_TOKEN = stringPreferencesKey("fcm_token")
        val KEY_TOKEN_EXPIRES_AT = stringPreferencesKey("token_expires_at")
    }

    val accessToken: Flow<String?> = context.dataStore.data.map { it[KEY_ACCESS_TOKEN] }
    val refreshToken: Flow<String?> = context.dataStore.data.map { it[KEY_REFRESH_TOKEN] }
    val deviceId: Flow<String?> = context.dataStore.data.map { it[KEY_DEVICE_ID] }
    val serverUrl: Flow<String> = context.dataStore.data.map { it[KEY_SERVER_URL] ?: "https://api.smsflow.io" }
    val wsUrl: Flow<String?> = context.dataStore.data.map { it[KEY_WS_URL] }
    val isPaired: Flow<Boolean> = context.dataStore.data.map { it[KEY_IS_PAIRED] ?: false }
    val isGatewayRunning: Flow<Boolean> = context.dataStore.data.map { it[KEY_IS_GATEWAY_RUNNING] ?: false }
    val localServerEnabled: Flow<Boolean> = context.dataStore.data.map { it[KEY_LOCAL_SERVER_ENABLED] ?: false }
    val localServerPort: Flow<Int> = context.dataStore.data.map { it[KEY_LOCAL_SERVER_PORT] ?: AppConstants.LOCAL_SERVER_PORT }
    val localServerPassword: Flow<String> = context.dataStore.data.map { it[KEY_LOCAL_SERVER_PASSWORD] ?: AppConstants.LOCAL_SERVER_DEFAULT_PASSWORD }
    val simStrategy: Flow<String> = context.dataStore.data.map { it[KEY_SIM_STRATEGY] ?: "DEFAULT" }
    val preferredSimSlot: Flow<Int> = context.dataStore.data.map { it[KEY_PREFERRED_SIM_SLOT] ?: 0 }
    val rateLimit: Flow<Int> = context.dataStore.data.map { it[KEY_RATE_LIMIT] ?: AppConstants.DEFAULT_RATE_LIMIT_PER_SECOND }
    val darkMode: Flow<Boolean> = context.dataStore.data.map { it[KEY_DARK_MODE] ?: false }
    val fcmToken: Flow<String?> = context.dataStore.data.map { it[KEY_FCM_TOKEN] }
    val tokenExpiresAt: Flow<Long> = context.dataStore.data.map { it[KEY_TOKEN_EXPIRES_AT]?.toLongOrNull() ?: 0L }

    suspend fun saveAuthData(accessToken: String, refreshToken: String, deviceId: String, wsUrl: String, expiresAt: Long) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ACCESS_TOKEN] = accessToken
            prefs[KEY_REFRESH_TOKEN] = refreshToken
            prefs[KEY_DEVICE_ID] = deviceId
            prefs[KEY_WS_URL] = wsUrl
            prefs[KEY_IS_PAIRED] = true
            prefs[KEY_TOKEN_EXPIRES_AT] = expiresAt.toString()
        }
    }

    suspend fun saveAccessToken(token: String, expiresAt: Long) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ACCESS_TOKEN] = token
            prefs[KEY_TOKEN_EXPIRES_AT] = expiresAt.toString()
        }
    }

    suspend fun setServerUrl(url: String) {
        context.dataStore.edit { prefs -> prefs[KEY_SERVER_URL] = url }
    }

    suspend fun setGatewayRunning(running: Boolean) {
        context.dataStore.edit { prefs -> prefs[KEY_IS_GATEWAY_RUNNING] = running }
    }

    suspend fun setLocalServerEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs -> prefs[KEY_LOCAL_SERVER_ENABLED] = enabled }
    }

    suspend fun setLocalServerPort(port: Int) {
        context.dataStore.edit { prefs -> prefs[KEY_LOCAL_SERVER_PORT] = port }
    }

    suspend fun setLocalServerPassword(password: String) {
        context.dataStore.edit { prefs -> prefs[KEY_LOCAL_SERVER_PASSWORD] = password }
    }

    suspend fun setSimStrategy(strategy: String) {
        context.dataStore.edit { prefs -> prefs[KEY_SIM_STRATEGY] = strategy }
    }

    suspend fun setPreferredSimSlot(slot: Int) {
        context.dataStore.edit { prefs -> prefs[KEY_PREFERRED_SIM_SLOT] = slot }
    }

    suspend fun setRateLimit(limit: Int) {
        context.dataStore.edit { prefs -> prefs[KEY_RATE_LIMIT] = limit }
    }

    suspend fun setDarkMode(enabled: Boolean) {
        context.dataStore.edit { prefs -> prefs[KEY_DARK_MODE] = enabled }
    }

    suspend fun saveFcmToken(token: String) {
        context.dataStore.edit { prefs -> prefs[KEY_FCM_TOKEN] = token }
    }

    suspend fun clearAuthData() {
        context.dataStore.edit { prefs ->
            prefs.remove(KEY_ACCESS_TOKEN)
            prefs.remove(KEY_REFRESH_TOKEN)
            prefs.remove(KEY_DEVICE_ID)
            prefs.remove(KEY_WS_URL)
            prefs[KEY_IS_PAIRED] = false
        }
    }
}
