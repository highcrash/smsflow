package com.smsflow.gateway.core.di

import com.smsflow.gateway.cloud.CloudSyncManager
import com.smsflow.gateway.cloud.HeartbeatManager
import com.smsflow.gateway.cloud.TokenManager
import com.smsflow.gateway.cloud.WebSocketClient
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.data.remote.websocket.WebSocketManager
import com.smsflow.gateway.data.repository.AuthRepository
import com.smsflow.gateway.data.repository.DeviceRepository
import com.smsflow.gateway.data.repository.MessageRepository
import com.smsflow.gateway.domain.usecase.PairDeviceUseCase
import com.smsflow.gateway.domain.usecase.SendSmsUseCase
import com.smsflow.gateway.domain.usecase.SyncMessagesUseCase
import com.smsflow.gateway.encryption.SecureStorage
import com.smsflow.gateway.gateway.MessageQueue
import com.smsflow.gateway.gateway.SimSelector
import com.smsflow.gateway.gateway.SmsSender
import com.smsflow.gateway.health.BatteryMonitor
import com.smsflow.gateway.health.ConnectivityMonitor
import com.smsflow.gateway.health.HealthMonitor
import com.smsflow.gateway.localserver.LocalHttpServer
import com.smsflow.gateway.notification.NotificationHelper
import com.smsflow.gateway.pairing.PairingManager
import com.smsflow.gateway.pairing.PairingViewModel
import com.smsflow.gateway.sim.SimManager
import com.smsflow.gateway.ui.screens.dashboard.DashboardViewModel
import com.smsflow.gateway.ui.screens.logs.LogsViewModel
import com.smsflow.gateway.ui.screens.messages.MessagesViewModel
import com.smsflow.gateway.ui.screens.onboarding.OnboardingViewModel
import com.smsflow.gateway.ui.screens.settings.SettingsViewModel
import com.smsflow.gateway.webhook.WebhookManager
import kotlinx.serialization.json.Json
import org.koin.android.ext.koin.androidContext
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.dsl.module

val appModule = module {

    // JSON serialization
    single {
        Json {
            ignoreUnknownKeys = true
            isLenient = true
            encodeDefaults = true
            coerceInputValues = true
        }
    }

    // Preferences
    single { PreferencesManager(androidContext()) }

    // Encryption
    single { SecureStorage(androidContext()) }

    // Notification
    single { NotificationHelper(androidContext()) }

    // SIM
    single { SimManager(androidContext()) }

    // Health
    single { BatteryMonitor() }
    single { ConnectivityMonitor(androidContext()) }
    single {
        HealthMonitor(
            context = androidContext(),
            batteryMonitor = get(),
            connectivityMonitor = get(),
            webSocketManager = get()
        )
    }

    // Gateway
    single { SimSelector(get(), get()) }
    single { SmsSender(androidContext(), get()) }
    single {
        MessageQueue(
            smsSender = get(),
            messageRepository = get(),
            preferencesManager = get()
        )
    }

    // Cloud
    single {
        WebSocketManager(
            okHttpClient = get(),
            preferencesManager = get(),
            json = get()
        )
    }
    single { WebSocketClient(get(), get()) }
    single { TokenManager(androidContext(), get(), get()) }
    single {
        HeartbeatManager(
            context = androidContext(),
            webSocketManager = get(),
            messageRepository = get(),
            json = get()
        )
    }
    single {
        CloudSyncManager(
            context = androidContext(),
            webSocketManager = get(),
            messageRepository = get(),
            messageQueue = get(),
            heartbeatManager = get(),
            sendSmsUseCase = get(),
            json = get()
        )
    }

    // Webhook
    single { WebhookManager(get(), get()) }

    // Local Server
    single {
        LocalHttpServer(
            sendSmsUseCase = get(),
            messageRepository = get(),
            preferencesManager = get(),
            json = get()
        )
    }

    // Repositories
    single {
        MessageRepository(
            messageDao = get(),
            logDao = get()
        )
    }
    single {
        DeviceRepository(
            api = get(),
            preferencesManager = get()
        )
    }
    single {
        AuthRepository(
            api = get(),
            preferencesManager = get()
        )
    }

    // Use Cases
    single { SendSmsUseCase(get(), get()) }
    single { PairDeviceUseCase(get()) }
    single { SyncMessagesUseCase(get(), get(), get()) }

    // Pairing
    single { PairingManager(androidContext(), get(), get()) }

    // ViewModels
    viewModel { OnboardingViewModel(get()) }
    viewModel { PairingViewModel(get(), get()) }
    viewModel {
        DashboardViewModel(
            messageRepository = get(),
            preferencesManager = get(),
            webSocketManager = get(),
            batteryMonitor = get(),
            connectivityMonitor = get()
        )
    }
    viewModel { MessagesViewModel(get()) }
    viewModel { SettingsViewModel(get(), get()) }
    viewModel { LogsViewModel(get()) }
}
