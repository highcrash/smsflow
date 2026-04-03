package com.smsflow.gateway.domain.usecase

import com.smsflow.gateway.data.repository.DeviceRepository
import com.smsflow.gateway.domain.model.SimCard
import com.smsflow.gateway.pairing.QrCodeData

class PairDeviceUseCase(
    private val deviceRepository: DeviceRepository
) {

    suspend operator fun invoke(
        qrData: QrCodeData,
        simCards: List<SimCard>
    ): Result<Unit> {
        if (qrData.isExpired()) {
            return Result.failure(Exception("QR code has expired"))
        }
        if (qrData.version != 1) {
            return Result.failure(Exception("Unsupported QR code version: ${qrData.version}"))
        }
        deviceRepository.setServerUrl(qrData.serverUrl)
        return deviceRepository.pairDevice(
            token = qrData.token,
            simCards = simCards,
            serverUrl = qrData.serverUrl
        )
    }
}
