package com.smsflow.gateway.data.remote.api

import com.smsflow.gateway.data.remote.dto.DeviceInfoDto
import com.smsflow.gateway.data.remote.dto.MessageDto
import com.smsflow.gateway.data.remote.dto.PairRequest
import com.smsflow.gateway.data.remote.dto.PairResponse
import com.smsflow.gateway.data.remote.dto.StatusUpdateDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface SMSFlowApi {

    @POST("api/v1/devices/pair")
    suspend fun pairDevice(@Body request: PairRequest): Response<PairResponse>

    @GET("api/v1/devices/{deviceId}")
    suspend fun getDevice(@Path("deviceId") deviceId: String): Response<DeviceInfoDto>

    @POST("api/v1/devices/{deviceId}/heartbeat")
    suspend fun sendHeartbeat(
        @Path("deviceId") deviceId: String,
        @Body heartbeat: Map<String, @JvmSuppressWildcards Any>
    ): Response<Unit>

    @GET("api/v1/messages/pending")
    suspend fun getPendingMessages(
        @Query("deviceId") deviceId: String
    ): Response<List<MessageDto>>

    @PATCH("api/v1/messages/{messageId}/status")
    suspend fun updateMessageStatus(
        @Path("messageId") messageId: String,
        @Body status: StatusUpdateDto
    ): Response<Unit>

    @POST("api/v1/auth/refresh")
    suspend fun refreshToken(
        @Body body: Map<String, String>
    ): Response<Map<String, String>>
}
