package com.smsflow.gateway.sim

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.telephony.SubscriptionInfo
import android.telephony.SubscriptionManager
import android.telephony.TelephonyManager
import androidx.core.content.ContextCompat
import com.smsflow.gateway.domain.model.SimCard

class SimManager(private val context: Context) {

    fun getSimCards(): List<SimCard> {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE)
            != PackageManager.PERMISSION_GRANTED
        ) return emptyList()

        return try {
            val subscriptionManager = context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE)
                as? SubscriptionManager ?: return emptyList()

            val activeSubscriptions = subscriptionManager.activeSubscriptionInfoList
                ?: return getDefaultSimCard()

            val defaultSubId = SubscriptionManager.getDefaultSmsSubscriptionId()

            activeSubscriptions.mapIndexed { index, info ->
                SimCard(
                    slotIndex = info.simSlotIndex,
                    subscriptionId = info.subscriptionId,
                    displayName = info.displayName?.toString() ?: "SIM ${index + 1}",
                    carrierName = info.carrierName?.toString() ?: "Unknown",
                    phoneNumber = getPhoneNumber(info),
                    isActive = true,
                    isDefault = info.subscriptionId == defaultSubId
                )
            }
        } catch (e: Exception) {
            getDefaultSimCard()
        }
    }

    fun getSimInfoList(): List<SimInfo> {
        return getSimCards().map { card ->
            SimInfo(
                slotIndex = card.slotIndex,
                subscriptionId = card.subscriptionId,
                displayName = card.displayName,
                carrierName = card.carrierName,
                phoneNumber = card.phoneNumber,
                isActive = card.isActive,
                isDefault = card.isDefault
            )
        }
    }

    fun getSubscriptionIdForSlot(slotIndex: Int): Int {
        return try {
            val subscriptionManager = context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE)
                as? SubscriptionManager ?: return SubscriptionManager.INVALID_SUBSCRIPTION_ID

            val activeSubscriptions = subscriptionManager.activeSubscriptionInfoList
                ?: return SubscriptionManager.INVALID_SUBSCRIPTION_ID

            activeSubscriptions.firstOrNull { it.simSlotIndex == slotIndex }?.subscriptionId
                ?: SubscriptionManager.INVALID_SUBSCRIPTION_ID
        } catch (e: Exception) {
            SubscriptionManager.INVALID_SUBSCRIPTION_ID
        }
    }

    fun getDefaultSubscriptionId(): Int {
        return SubscriptionManager.getDefaultSmsSubscriptionId()
    }

    private fun getPhoneNumber(info: SubscriptionInfo): String? {
        return try {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_NUMBERS)
                == PackageManager.PERMISSION_GRANTED
            ) {
                info.number?.takeIf { it.isNotEmpty() }
            } else null
        } catch (e: Exception) {
            null
        }
    }

    private fun getDefaultSimCard(): List<SimCard> {
        return try {
            val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
            listOf(
                SimCard(
                    slotIndex = 0,
                    subscriptionId = SubscriptionManager.getDefaultSmsSubscriptionId(),
                    displayName = "SIM 1",
                    carrierName = telephonyManager?.networkOperatorName ?: "Unknown",
                    phoneNumber = null,
                    isActive = true,
                    isDefault = true
                )
            )
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun getSimCount(): Int = getSimCards().size
}
