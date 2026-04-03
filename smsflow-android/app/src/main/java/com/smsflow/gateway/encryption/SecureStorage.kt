package com.smsflow.gateway.encryption

import android.content.Context
import android.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import kotlin.random.Random

class SecureStorage(private val context: Context) {

    private val masterKey = KeyManager.getOrCreateMasterKey()
    private val prefs = context.getSharedPreferences("secure_storage", Context.MODE_PRIVATE)

    fun store(key: String, value: String) {
        val encrypted = encryptWithKeystore(value)
        prefs.edit().putString(key, encrypted).apply()
    }

    fun retrieve(key: String): String? {
        val encrypted = prefs.getString(key, null) ?: return null
        return try {
            decryptWithKeystore(encrypted)
        } catch (e: Exception) {
            null
        }
    }

    fun remove(key: String) {
        prefs.edit().remove(key).apply()
    }

    fun clear() {
        prefs.edit().clear().apply()
    }

    private fun encryptWithKeystore(plaintext: String): String {
        val iv = Random.nextBytes(16)
        val cipher = Cipher.getInstance("AES/CBC/PKCS7Padding")
        cipher.init(Cipher.ENCRYPT_MODE, masterKey, IvParameterSpec(iv))
        val encrypted = cipher.doFinal(plaintext.toByteArray(Charsets.UTF_8))
        val combined = iv + encrypted
        return Base64.encodeToString(combined, Base64.NO_WRAP)
    }

    private fun decryptWithKeystore(ciphertext: String): String {
        val combined = Base64.decode(ciphertext, Base64.NO_WRAP)
        val iv = combined.sliceArray(0 until 16)
        val encrypted = combined.sliceArray(16 until combined.size)
        val cipher = Cipher.getInstance("AES/CBC/PKCS7Padding")
        cipher.init(Cipher.DECRYPT_MODE, masterKey, IvParameterSpec(iv))
        val decrypted = cipher.doFinal(encrypted)
        return String(decrypted, Charsets.UTF_8)
    }
}
