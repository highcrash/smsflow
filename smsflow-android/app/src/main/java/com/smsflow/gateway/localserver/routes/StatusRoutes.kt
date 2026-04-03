package com.smsflow.gateway.localserver.routes

import com.smsflow.gateway.data.repository.MessageRepository
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import kotlinx.coroutines.flow.first
import kotlinx.serialization.Serializable

@Serializable
data class GatewayStatus(
    val running: Boolean,
    val pendingCount: Int,
    val version: String
)

fun Route.statusRoutes(messageRepository: MessageRepository, isRunning: () -> Boolean) {
    authenticate("basic") {
        get("/status") {
            try {
                val pendingCount = messageRepository.observePendingCount().first()
                val status = GatewayStatus(
                    running = isRunning(),
                    pendingCount = pendingCount,
                    version = "1.0.0"
                )
                call.respond(HttpStatusCode.OK, status)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Unknown error")))
            }
        }

        get("/messages") {
            try {
                val messages = messageRepository.getRecentMessages(50).first()
                val dtoList = messages.map { msg ->
                    mapOf(
                        "id" to msg.id,
                        "to" to msg.phoneNumber,
                        "status" to msg.status.name,
                        "createdAt" to msg.createdAt.toString()
                    )
                }
                call.respond(HttpStatusCode.OK, dtoList)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Unknown error")))
            }
        }
    }
}
