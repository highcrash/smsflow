package com.smsflow.gateway.ui.screens.logs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smsflow.gateway.data.local.LogDao
import com.smsflow.gateway.data.local.LogEntity
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class LogsViewModel(
    private val logDao: LogDao
) : ViewModel() {

    val logs: StateFlow<List<LogEntity>> = logDao
        .getRecentLogs(200)
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    fun clearLogs() {
        viewModelScope.launch {
            logDao.clearAll()
        }
    }
}
