package com.smsflow.gateway.ui.screens.onboarding

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smsflow.gateway.data.preferences.PreferencesManager
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn

class OnboardingViewModel(
    private val preferencesManager: PreferencesManager
) : ViewModel() {

    val isPaired = preferencesManager.isPaired.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = false
    )
}
