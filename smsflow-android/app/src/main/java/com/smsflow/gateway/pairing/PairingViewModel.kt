package com.smsflow.gateway.pairing

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smsflow.gateway.domain.model.SimCard
import com.smsflow.gateway.domain.usecase.PairDeviceUseCase
import com.smsflow.gateway.sim.SimManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class PairingState {
    object Idle : PairingState()
    object Scanning : PairingState()
    object Pairing : PairingState()
    data class Success(val deviceId: String) : PairingState()
    data class Error(val message: String) : PairingState()
}

class PairingViewModel(
    private val pairDeviceUseCase: PairDeviceUseCase,
    private val simManager: SimManager
) : ViewModel() {

    private val _pairingState = MutableStateFlow<PairingState>(PairingState.Idle)
    val pairingState: StateFlow<PairingState> = _pairingState.asStateFlow()

    private val _simCards = MutableStateFlow<List<SimCard>>(emptyList())
    val simCards: StateFlow<List<SimCard>> = _simCards.asStateFlow()

    init {
        loadSimCards()
    }

    private fun loadSimCards() {
        viewModelScope.launch {
            _simCards.value = simManager.getSimCards()
        }
    }

    fun startScanning() {
        _pairingState.value = PairingState.Scanning
    }

    fun onQrCodeScanned(rawValue: String) {
        val qrData = QrCodeData.fromJson(rawValue)
        if (qrData == null) {
            _pairingState.value = PairingState.Error("Invalid QR code format")
            return
        }
        if (qrData.isExpired()) {
            _pairingState.value = PairingState.Error("QR code has expired. Please generate a new one.")
            return
        }
        pairWithQrData(qrData)
    }

    private fun pairWithQrData(qrData: QrCodeData) {
        _pairingState.value = PairingState.Pairing
        viewModelScope.launch {
            val result = pairDeviceUseCase(qrData, _simCards.value)
            _pairingState.value = result.fold(
                onSuccess = { PairingState.Success("paired") },
                onFailure = { PairingState.Error(it.message ?: "Pairing failed") }
            )
        }
    }

    fun reset() {
        _pairingState.value = PairingState.Idle
    }
}
