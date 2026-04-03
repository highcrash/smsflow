package com.smsflow.gateway.data.local

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "logs",
    indices = [Index(value = ["timestamp"])]
)
data class LogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val level: String,  // DEBUG/INFO/WARN/ERROR
    val tag: String,
    val message: String,
    val timestamp: Long
)
