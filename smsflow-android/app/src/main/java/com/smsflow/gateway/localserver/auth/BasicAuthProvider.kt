package com.smsflow.gateway.localserver.auth

import io.ktor.server.auth.UserIdPrincipal
import io.ktor.server.auth.UserPasswordCredential

class BasicAuthProvider(private var password: String) {

    fun updatePassword(newPassword: String) {
        password = newPassword
    }

    fun validate(credentials: UserPasswordCredential): UserIdPrincipal? {
        return if (credentials.name == "smsflow" && credentials.password == password) {
            UserIdPrincipal(credentials.name)
        } else {
            null
        }
    }
}
