package com.smsflow.gateway.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface MessageDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(message: MessageEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(messages: List<MessageEntity>)

    @Update
    suspend fun update(message: MessageEntity)

    @Query("SELECT * FROM messages WHERE id = :id")
    suspend fun getById(id: String): MessageEntity?

    @Query("SELECT * FROM messages WHERE externalId = :externalId")
    suspend fun getByExternalId(externalId: String): MessageEntity?

    @Query("SELECT * FROM messages ORDER BY createdAt DESC LIMIT :limit")
    fun getRecentMessages(limit: Int = 50): Flow<List<MessageEntity>>

    @Query("SELECT * FROM messages WHERE status IN ('PENDING', 'QUEUED') ORDER BY createdAt ASC")
    suspend fun getPendingMessages(): List<MessageEntity>

    @Query("SELECT * FROM messages WHERE status IN ('PENDING', 'QUEUED') ORDER BY createdAt ASC")
    fun observePendingMessages(): Flow<List<MessageEntity>>

    @Query("SELECT COUNT(*) FROM messages WHERE status IN ('PENDING', 'QUEUED')")
    fun observePendingCount(): Flow<Int>

    @Query("UPDATE messages SET status = :status, updatedAt = :updatedAt WHERE id = :id")
    suspend fun updateStatus(id: String, status: String, updatedAt: Long)

    @Query("UPDATE messages SET status = :status, errorCode = :errorCode, updatedAt = :updatedAt WHERE id = :id")
    suspend fun updateStatusWithError(id: String, status: String, errorCode: String?, updatedAt: Long)

    @Query("SELECT COUNT(*) FROM messages WHERE status = 'SENT' AND createdAt >= :startOfDay")
    fun observeTodaySentCount(startOfDay: Long): Flow<Int>

    @Query("DELETE FROM messages WHERE createdAt < :before")
    suspend fun deleteOlderThan(before: Long)

    @Query("SELECT * FROM messages WHERE status = :status ORDER BY createdAt DESC LIMIT :limit")
    fun getMessagesByStatus(status: String, limit: Int = 100): Flow<List<MessageEntity>>

    @Query("SELECT * FROM messages ORDER BY createdAt DESC LIMIT :limit OFFSET :offset")
    suspend fun getMessagesPaged(limit: Int, offset: Int): List<MessageEntity>
}
