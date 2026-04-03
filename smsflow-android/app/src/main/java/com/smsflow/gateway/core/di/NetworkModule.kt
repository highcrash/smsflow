package com.smsflow.gateway.core.di

import com.smsflow.gateway.data.remote.api.AuthInterceptor
import com.smsflow.gateway.data.remote.api.SMSFlowApi
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.module
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

val networkModule = module {

    single {
        val preferencesManager = get<PreferencesManager>()
        AuthInterceptor(preferencesManager)
    }

    single {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        OkHttpClient.Builder()
            .addInterceptor(get<AuthInterceptor>())
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    single {
        val preferencesManager = get<PreferencesManager>()
        val baseUrl = try {
            runBlocking { preferencesManager.serverUrl.first() }
        } catch (e: Exception) {
            "https://api.smsflow.io"
        }
        val json = get<Json>()
        val contentType = "application/json".toMediaType()

        Retrofit.Builder()
            .baseUrl("$baseUrl/")
            .client(get())
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
            .create(SMSFlowApi::class.java)
    }
}
