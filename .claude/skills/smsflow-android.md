---
name: smsflow-android
description: Build the SMSFlow Android Gateway app - a Kotlin/Jetpack Compose app that turns Android phones into SMS gateways via QR code pairing
user_invocable: true
---

# SMSFlow Android App Builder

You are building the **SMSFlow Gateway** Android app at `D:\SMSGATEWAY\smsflow-android\`.

## Brand Design Tokens (from D:\SMSGATEWAY\brand-guide.html)

### Colors
```kotlin
// Primary Whites (70%)
val WhitePure = Color(0xFFFFFFFF)
val WhiteSoft = Color(0xFFF9FAFB)
val WhiteWarm = Color(0xFFF3F4F6)
val WhiteCool = Color(0xFFE5E7EB)
val WhiteMuted = Color(0xFFD1D5DB)

// Accent Greens (10%)
val Green50 = Color(0xFFECFDF5)
val Green100 = Color(0xFFD1FAE5)
val Green200 = Color(0xFFA7F3D0)
val Green300 = Color(0xFF6EE7B7)
val Green400 = Color(0xFF34D399)
val Green500 = Color(0xFF10B981)  // Primary
val Green600 = Color(0xFF059669)  // CTA
val Green700 = Color(0xFF047857)
val Green800 = Color(0xFF065F46)

// Dark/Black (20%)
val Dark900 = Color(0xFF111827)
val Dark800 = Color(0xFF1F2937)
val Dark700 = Color(0xFF374151)
val Dark600 = Color(0xFF4B5563)
val Dark500 = Color(0xFF6B7280)
val Dark400 = Color(0xFF9CA3AF)

// Semantic
val Success = Color(0xFF10B981)
val Warning = Color(0xFFF59E0B)
val Error = Color(0xFFEF4444)
val Info = Color(0xFF3B82F6)
```

### Typography: Inter (headings) + JetBrains Mono (code)
### Spacing: 4px base unit
### Radius: sm=6dp, md=10dp, lg=16dp, xl=24dp, full=9999dp
### Shadows: sm, md, lg, xl + green glow (0 4dp 14dp rgba(16,185,129,0.25))

## Tech Stack
- **Kotlin 1.9+** with **Jetpack Compose** (Material 3)
- **Retrofit 2 + OkHttp 4** for REST API
- **OkHttp WebSocket** for real-time communication
- **Room 2.6+** for local database
- **Koin 3.5+** for dependency injection
- **CameraX + ML Kit Barcode** for QR scanning
- **WorkManager 2.9+** for background processing
- **Android SmsManager** for SMS sending/receiving
- **Firebase Cloud Messaging** for push notifications
- **Ktor embedded** for local HTTP server
- **kotlinx.serialization** for JSON
- **Min SDK 26 / Target SDK 34**

## Architecture (15 Modules)

### Folder Structure
```
app/src/main/java/com/smsflow/gateway/
├── SMSFlowApp.kt                     # Application class, Koin init
├── MainActivity.kt                    # Single-activity Compose host
├── core/                              # DI, constants, extensions, utils
│   ├── di/ (AppModule, NetworkModule, DatabaseModule)
│   ├── constants/ (AppConstants, ApiEndpoints)
│   └── extensions/ (ContextExt, FlowExt, StringExt)
├── data/
│   ├── local/ (AppDatabase, DAOs, entities, converters)
│   ├── remote/
│   │   ├── api/ (SMSFlowApi, AuthInterceptor)
│   │   ├── dto/ (PairRequest/Response, MessageDto, StatusUpdateDto, DeviceInfoDto)
│   │   └── websocket/ (WebSocketManager, WebSocketMessage, WebSocketState)
│   ├── repository/ (MessageRepo, DeviceRepo, AuthRepo, SettingsRepo)
│   └── preferences/ (PreferencesManager via DataStore)
├── domain/
│   ├── model/ (Message, Device, SimCard, SendResult, ConnectionState)
│   ├── usecase/ (SendSms, ReceiveSms, PairDevice, SyncMessages, GetDeviceStats)
│   └── repository/ (interfaces)
├── gateway/                           # SMS Engine
│   ├── SmsGatewayService.kt          # Foreground service
│   ├── SmsSender.kt                  # SmsManager wrapper, multipart
│   ├── SmsReceiver.kt                # BroadcastReceiver
│   ├── DeliveryReportReceiver.kt
│   ├── SentStatusReceiver.kt
│   ├── MessageQueue.kt               # Rate-limited (1/sec default)
│   └── SimSelector.kt                # DEFAULT, ROUND_ROBIN, RANDOM, SPECIFIC
├── localserver/                       # Ktor on port 8080
│   ├── LocalHttpServer.kt
│   ├── routes/ (MessageRoutes, StatusRoutes, DeviceRoutes)
│   └── auth/ (BasicAuthProvider)
├── cloud/
│   ├── CloudSyncManager.kt
│   ├── WebSocketClient.kt            # wss://api.smsflow.io/ws/device/{deviceId}
│   ├── FcmService.kt
│   ├── TokenManager.kt               # JWT access + refresh
│   └── HeartbeatManager.kt           # Battery, signal, queue depth every 60s
├── workers/
│   ├── SendMessageWorker.kt
│   ├── SyncStatusWorker.kt           # Every 15 min
│   ├── PullMessagesWorker.kt         # Every 5 min (WS fallback)
│   ├── CleanupWorker.kt              # Daily
│   └── HeartbeatWorker.kt            # Every 1 min (WS down)
├── encryption/ (AESEncryption, KeyManager, SecureStorage)
├── pairing/
│   ├── QrScannerScreen.kt            # CameraX + ML Kit
│   ├── PairingViewModel.kt
│   ├── PairingManager.kt
│   └── QrCodeData.kt                 # { v, t, u, e }
├── notification/ (NotificationManager, NotificationChannels)
├── sim/ (SimManager, SimInfo, SimStrategy enum)
├── webhook/ (WebhookManager, WebhookEvent)
├── ui/
│   ├── theme/ (Color.kt, Type.kt, Shape.kt, Theme.kt)
│   ├── navigation/ (NavGraph, Screen sealed class)
│   ├── components/ (SMSFlowButton, SMSFlowCard, SMSFlowTextField, StatusBadge, StatCard, LoadingIndicator)
│   └── screens/
│       ├── onboarding/ (OnboardingScreen, OnboardingViewModel)
│       ├── pairing/ (PairingScanScreen, PairingSuccessScreen, PairingViewModel)
│       ├── dashboard/ (DashboardScreen, DashboardViewModel)
│       ├── messages/ (MessagesScreen, MessagesViewModel)
│       ├── settings/ (SettingsScreen, SettingsViewModel, SimManagementScreen, ServerSettingsScreen)
│       └── logs/ (LogsScreen, LogsViewModel)
├── receiver/ (BootReceiver, SmsReceivedReceiver, BatteryReceiver)
└── health/ (HealthMonitor, BatteryMonitor, ConnectivityMonitor)
```

## Room Database Entities
- **MessageEntity**: id, externalId, phoneNumber, body, status (PENDING/QUEUED/SENDING/SENT/DELIVERED/FAILED), simSlot, createdAt, updatedAt, errorCode
- **ContactEntity**: id, phoneNumber, name, lastUsed
- **LogEntity**: id, level, tag, message, timestamp

## QR Pairing Protocol
```json
{ "v": 1, "t": "<pairing-token-uuid>", "u": "https://api.smsflow.io", "e": 1709234567 }
```
Flow: Scan QR -> POST /api/v1/devices/pair -> receive deviceId, tokens, wsUrl -> connect WebSocket -> start foreground service

## WebSocket Messages (OkHttp WebSocket)
Server->Device: SEND_SMS, PING, CONFIG_UPDATE
Device->Server: STATUS_UPDATE, HEARTBEAT, SMS_RECEIVED, PONG
Envelope: `{ "id": "<uuid>", "type": "<TYPE>", "timestamp": <ms>, "payload": {...} }`

## Required Permissions
SEND_SMS, READ_SMS, RECEIVE_SMS, READ_PHONE_STATE, READ_PHONE_NUMBERS, INTERNET, FOREGROUND_SERVICE, FOREGROUND_SERVICE_SPECIAL_USE, RECEIVE_BOOT_COMPLETED, CAMERA, POST_NOTIFICATIONS, WAKE_LOCK, REQUEST_IGNORE_BATTERY_OPTIMIZATIONS

## Build Order
1. Project scaffold + Gradle + libs.versions.toml + Koin DI
2. Brand theme (Color.kt, Type.kt, Shape.kt, Theme.kt from brand tokens above)
3. Room database + entities + DAOs + migrations
4. Retrofit API client + DTOs + AuthInterceptor
5. QR scanning (CameraX + ML Kit) + pairing flow
6. WebSocket client with jittered exponential backoff reconnect
7. SMS Gateway engine (SmsSender, SmsReceiver, MessageQueue, SimSelector)
8. Foreground service with persistent notification
9. Background workers (WorkManager)
10. FCM integration
11. Encryption module (AES-256-CBC)
12. Local HTTP server (Ktor)
13. All UI screens (Compose)
14. Health monitoring
15. ProGuard rules, signing config, build variants (debug/release)

## Instructions
- Build every file completely - no placeholders, no TODOs
- Follow the brand guide colors/typography exactly
- Use Material 3 with custom SMSFlow theme
- All screens must use Compose with proper state management
- Handle all edge cases (no internet, no permissions, battery optimization)
- Include proper error handling and logging throughout
