package com.smsflow.gateway.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface LogDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(log: LogEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(logs: List<LogEntity>)

    @Query("SELECT * FROM logs ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentLogs(limit: Int = 200): Flow<List<LogEntity>>

    @Query("SELECT * FROM logs WHERE level = :level ORDER BY timestamp DESC LIMIT :limit")
    fun getLogsByLevel(level: String, limit: Int = 100): Flow<List<LogEntity>>

    @Query("SELECT * FROM logs WHERE tag = :tag ORDER BY timestamp DESC LIMIT :limit")
    fun getLogsByTag(tag: String, limit: Int = 100): Flow<List<LogEntity>>

    @Query("DELETE FROM logs WHERE timestamp < :before")
    suspend fun deleteOlderThan(before: Long)

    @Query("DELETE FROM logs")
    suspend fun clearAll()

    @Query("SELECT COUNT(*) FROM logs")
    suspend fun getCount(): Int
}
