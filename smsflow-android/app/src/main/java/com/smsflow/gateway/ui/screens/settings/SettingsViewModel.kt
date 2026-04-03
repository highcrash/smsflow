package com.smsflow.gateway.ui.screens.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.sim.SimInfo
import com.smsflow.gateway.sim.SimManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class SettingsViewModel(
    private val preferencesManager: PreferencesManager,
    private val simManager: SimManager
) : ViewModel() {

    val serverUrl = preferencesManager.serverUrl.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), "https://api.smsflow.io"
    )
    val localServerEnabled = preferencesManager.localServerEnabled.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), false
    )
    val localServerPort = preferencesManager.localServerPort.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), 8080
    )
    val localServerPassword = preferencesManager.localServerPassword.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), ""
    )
    val simStrategy = preferencesManager.simStrategy.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), "DEFAULT"
    )
    val rateLimit = preferencesManager.rateLimit.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), 1
    )
    val darkMode = preferencesManager.darkMode.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), false
    )

    private val _simCards = MutableStateFlow<List<SimInfo>>(emptyList())
    val simCards: StateFlow<List<SimInfo>> = _simCards.asStateFlow()

    init {
        loadSimCards()
    }

    private fun loadSimCards() {
        viewModelScope.launch {
            _simCards.value = simManager.getSimInfoList()
        }
    }

    fun setServerUrl(url: String) = viewModelScope.launch { preferencesManager.setServerUrl(url) }
    fun setLocalServerEnabled(enabled: Boolean) = viewModelScope.launch { preferencesManager.setLocalServerEnabled(enabled) }
    fun setLocalServerPort(port: Int) = viewModelScope.launch { preferencesManager.setLocalServerPort(port) }
    fun setLocalServerPassword(password: String) = viewModelScope.launch { preferencesManager.setLocalServerPassword(password) }
    fun setSimStrategy(strategy: String) = viewModelScope.launch { preferencesManager.setSimStrategy(strategy) }
    fun setRateLimit(limit: Int) = viewModelScope.launch { preferencesManager.setRateLimit(limit) }
    fun setDarkMode(enabled: Boolean) = viewModelScope.launch { preferencesManager.setDarkMode(enabled) }
}
