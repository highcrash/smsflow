package com.smsflow.gateway.localserver.routes

import com.smsflow.gateway.domain.usecase.SendSmsUseCase
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import kotlinx.serialization.Serializable

@Serializable
data class SendMessageRequest(
    val to: String,
    val body: String,
    val sim: Int = 0
)

@Serializable
data class SendMessageResponse(
    val success: Boolean,
    val messageId: String? = null,
    val error: String? = null
)

fun Route.messageRoutes(sendSmsUseCase: SendSmsUseCase) {
    authenticate("basic") {
        post("/send") {
            try {
                val request = call.receive<SendMessageRequest>()
                if (request.to.isBlank()) {
                    call.respond(HttpStatusCode.BadRequest, SendMessageResponse(false, error = "Missing 'to' field"))
                    return@post
                }
                if (request.body.isBlank()) {
                    call.respond(HttpStatusCode.BadRequest, SendMessageResponse(false, error = "Missing 'body' field"))
                    return@post
                }

                val result = sendSmsUseCase(
                    phoneNumber = request.to,
                    body = request.body,
                    simSlot = request.sim
                )

                result.fold(
                    onSuccess = { message ->
                        call.respond(HttpStatusCode.OK, SendMessageResponse(true, messageId = message.id))
                    },
                    onFailure = { e ->
                        call.respond(HttpStatusCode.InternalServerError, SendMessageResponse(false, error = e.message))
                    }
                )
            } catch (e: Exception) {
                call.respond(HttpStatusCode.BadRequest, SendMessageResponse(false, error = "Invalid request: ${e.message}"))
            }
        }
    }
}
