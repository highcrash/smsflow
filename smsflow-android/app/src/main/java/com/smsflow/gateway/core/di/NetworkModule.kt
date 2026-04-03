package com.smsflow.gateway.core.di

import com.smsflow.gateway.data.remote.api.AuthInterceptor
import com.smsflow.gateway.data.remote.api.SMSFlowApi
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import org.koin.dsl.module
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

val networkModule = module {

    single {
        val preferencesManager = get<PreferencesManager>()
        AuthInterceptor(preferencesManager)
    }

    // Interceptor that dynamically resolves the base URL from preferences
    single<Interceptor>(qualifier = org.koin.core.qualifier.named("baseUrl")) {
        val preferencesManager = get<PreferencesManager>()
        Interceptor { chain ->
            val serverUrl = try {
                runBlocking { preferencesManager.serverUrl.first() }
            } catch (e: Exception) {
                "http://localhost:3001/api/v1"
            }
            val original = chain.request()
            val originalUrl = original.url
            // Replace the placeholder host with the real server URL
            val newUrl = serverUrl.trimEnd('/') +
                originalUrl.encodedPath +
                (if (originalUrl.encodedQuery != null) "?${originalUrl.encodedQuery}" else "")
            val newRequest = original.newBuilder()
                .url(newUrl.toHttpUrl())
                .build()
            chain.proceed(newRequest)
        }
    }

    single {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        OkHttpClient.Builder()
            .addInterceptor(get<Interceptor>(qualifier = org.koin.core.qualifier.named("baseUrl")))
            .addInterceptor(get<AuthInterceptor>())
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    single {
        val json = get<Json>()
        val contentType = "application/json".toMediaType()

        // Use a placeholder base URL - the interceptor overrides it per-request
        Retrofit.Builder()
            .baseUrl("http://localhost/")
            .client(get())
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
            .create(SMSFlowApi::class.java)
    }
}
