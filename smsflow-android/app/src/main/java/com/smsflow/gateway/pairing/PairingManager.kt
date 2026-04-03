package com.smsflow.gateway.pairing

import android.content.Context
import com.smsflow.gateway.domain.model.SimCard
import com.smsflow.gateway.domain.usecase.PairDeviceUseCase
import com.smsflow.gateway.sim.SimManager

class PairingManager(
    private val context: Context,
    private val pairDeviceUseCase: PairDeviceUseCase,
    private val simManager: SimManager
) {

    suspend fun pairWithQrCode(rawJson: String): Result<Unit> {
        val qrData = QrCodeData.fromJson(rawJson)
            ?: return Result.failure(Exception("Invalid QR code format"))

        val simCards: List<SimCard> = simManager.getSimCards()
        return pairDeviceUseCase(qrData, simCards)
    }
}
