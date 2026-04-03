package com.smsflow.gateway.webhook

import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class WebhookManager(
    private val okHttpClient: OkHttpClient,
    private val json: Json
) {
    companion object {
        private const val TAG = "WebhookManager"
        private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaType()
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val webhookUrls = mutableListOf<String>()

    fun addWebhookUrl(url: String) {
        if (!webhookUrls.contains(url)) {
            webhookUrls.add(url)
            Log.i(TAG, "Added webhook URL: $url")
        }
    }

    fun removeWebhookUrl(url: String) {
        webhookUrls.remove(url)
    }

    fun clearWebhooks() {
        webhookUrls.clear()
    }

    fun dispatch(event: WebhookEvent) {
        if (webhookUrls.isEmpty()) return

        scope.launch {
            val body = json.encodeToString(event)
            for (url in webhookUrls.toList()) {
                try {
                    val request = Request.Builder()
                        .url(url)
                        .post(body.toRequestBody(JSON_MEDIA_TYPE))
                        .addHeader("Content-Type", "application/json")
                        .addHeader("X-SMSFlow-Event", event.event)
                        .build()

                    val response = okHttpClient.newCall(request).execute()
                    if (response.isSuccessful) {
                        Log.d(TAG, "Webhook dispatched to $url for event ${event.event}")
                    } else {
                        Log.w(TAG, "Webhook failed for $url: ${response.code}")
                    }
                    response.close()
                } catch (e: Exception) {
                    Log.e(TAG, "Webhook error for $url", e)
                }
            }
        }
    }
}
