package com.smsflow.gateway.localserver

import android.util.Log
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.data.repository.MessageRepository
import com.smsflow.gateway.domain.usecase.SendSmsUseCase
import com.smsflow.gateway.localserver.auth.BasicAuthProvider
import com.smsflow.gateway.localserver.routes.messageRoutes
import com.smsflow.gateway.localserver.routes.statusRoutes
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.basic
import io.ktor.server.engine.ApplicationEngine
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import kotlinx.coroutines.flow.first
import kotlinx.serialization.json.Json

class LocalHttpServer(
    private val sendSmsUseCase: SendSmsUseCase,
    private val messageRepository: MessageRepository,
    private val preferencesManager: PreferencesManager,
    private val json: Json
) {
    companion object {
        private const val TAG = "LocalHttpServer"
    }

    private var server: ApplicationEngine? = null
    private var isRunning = false

    suspend fun start() {
        if (isRunning) return

        val port = preferencesManager.localServerPort.first()
        val password = preferencesManager.localServerPassword.first()
        val authProvider = BasicAuthProvider(password)

        try {
            server = embeddedServer(Netty, port = port) {
                install(ContentNegotiation) {
                    json(json)
                }
                install(Authentication) {
                    basic("basic") {
                        realm = "SMSFlow Gateway"
                        validate { credentials ->
                            authProvider.validate(credentials)
                        }
                    }
                }
                routing {
                    get("/") {
                        call.respond(HttpStatusCode.OK, mapOf("service" to "SMSFlow Gateway", "version" to "1.0.0"))
                    }
                    messageRoutes(sendSmsUseCase)
                    statusRoutes(messageRepository) { isRunning }
                }
            }
            server?.start(wait = false)
            isRunning = true
            Log.i(TAG, "Local HTTP server started on port $port")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start local HTTP server", e)
        }
    }

    fun stop() {
        try {
            server?.stop(1000, 5000)
            server = null
            isRunning = false
            Log.i(TAG, "Local HTTP server stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping local HTTP server", e)
        }
    }

    fun isServerRunning(): Boolean = isRunning
}
