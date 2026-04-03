package com.smsflow.gateway.gateway

import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.sim.SimManager
import com.smsflow.gateway.sim.SimStrategy
import kotlinx.coroutines.flow.first
import java.util.concurrent.atomic.AtomicInteger

class SimSelector(
    private val simManager: SimManager,
    private val preferencesManager: PreferencesManager
) {

    private val roundRobinIndex = AtomicInteger(0)

    suspend fun selectSubscriptionId(requestedSlot: Int = -1): Int {
        val strategyStr = preferencesManager.simStrategy.first()
        val strategy = try {
            SimStrategy.valueOf(strategyStr)
        } catch (e: IllegalArgumentException) {
            SimStrategy.DEFAULT
        }

        val availableSims = simManager.getSimCards()
        if (availableSims.isEmpty()) {
            return simManager.getDefaultSubscriptionId()
        }

        return when (strategy) {
            SimStrategy.DEFAULT -> simManager.getDefaultSubscriptionId()

            SimStrategy.ROUND_ROBIN -> {
                val index = roundRobinIndex.getAndIncrement() % availableSims.size
                availableSims[index].subscriptionId
            }

            SimStrategy.RANDOM -> {
                availableSims.random().subscriptionId
            }

            SimStrategy.SPECIFIC -> {
                val preferredSlot = if (requestedSlot >= 0) requestedSlot
                else preferencesManager.preferredSimSlot.first()
                simManager.getSubscriptionIdForSlot(preferredSlot)
                    .takeIf { it >= 0 }
                    ?: simManager.getDefaultSubscriptionId()
            }
        }
    }
}
