package com.smsflow.gateway.data.local

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "messages",
    indices = [
        Index(value = ["externalId"]),
        Index(value = ["status"]),
        Index(value = ["createdAt"])
    ]
)
data class MessageEntity(
    @PrimaryKey val id: String,
    val externalId: String?,
    val phoneNumber: String,
    val body: String,
    val status: String,  // PENDING/QUEUED/SENDING/SENT/DELIVERED/FAILED
    val simSlot: Int,
    val createdAt: Long,
    val updatedAt: Long,
    val errorCode: String?
)
