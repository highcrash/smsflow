package com.smsflow.gateway.ui.screens.messages

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smsflow.gateway.data.repository.MessageRepository
import com.smsflow.gateway.domain.model.Message
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn

class MessagesViewModel(
    private val messageRepository: MessageRepository
) : ViewModel() {

    val messages: StateFlow<List<Message>> = messageRepository
        .getRecentMessages(100)
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )
}
