package com.smsflow.gateway.ui.screens.dashboard

import android.content.Intent
import android.os.Build
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.smsflow.gateway.domain.model.ConnectionState
import com.smsflow.gateway.domain.model.Message
import com.smsflow.gateway.domain.model.MessageStatus
import com.smsflow.gateway.gateway.SmsGatewayService
import com.smsflow.gateway.ui.components.BadgeStatus
import com.smsflow.gateway.ui.components.SMSFlowButton
import com.smsflow.gateway.ui.components.SMSFlowCard
import com.smsflow.gateway.ui.components.SMSFlowOutlinedButton
import com.smsflow.gateway.ui.components.StatRow
import com.smsflow.gateway.ui.components.StatusBadge
import com.smsflow.gateway.ui.theme.Error
import com.smsflow.gateway.ui.theme.Green500
import com.smsflow.gateway.ui.theme.Warning
import org.koin.androidx.compose.koinViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToMessages: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onNavigateToLogs: () -> Unit,
    viewModel: DashboardViewModel = koinViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "SMSFlow Gateway",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                },
                actions = {
                    IconButton(onClick = onNavigateToSettings) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings")
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = true,
                    onClick = { },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = null) },
                    label = { Text("Dashboard") }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = onNavigateToMessages,
                    icon = { Icon(Icons.Default.Sms, contentDescription = null) },
                    label = { Text("Messages") }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = onNavigateToLogs,
                    icon = { Icon(Icons.Default.History, contentDescription = null) },
                    label = { Text("Logs") }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = onNavigateToSettings,
                    icon = { Icon(Icons.Default.Settings, contentDescription = null) },
                    label = { Text("Settings") }
                )
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { Spacer(modifier = Modifier.height(4.dp)) }

            // Status Card
            item {
                SMSFlowCard {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Gateway Status",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            if (uiState.isGatewayRunning) {
                                Text(
                                    text = "Running since today",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        StatusBadge(
                            status = when {
                                !uiState.isGatewayRunning -> BadgeStatus.OFFLINE
                                uiState.connectionState is ConnectionState.Connected -> BadgeStatus.ONLINE
                                uiState.connectionState is ConnectionState.Connecting -> BadgeStatus.CONNECTING
                                uiState.connectionState is ConnectionState.Error -> BadgeStatus.ERROR
                                else -> BadgeStatus.OFFLINE
                            }
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    if (uiState.isGatewayRunning) {
                        SMSFlowOutlinedButton(
                            text = "Stop Gateway",
                            onClick = {
                                context.stopService(Intent(context, SmsGatewayService::class.java))
                            },
                            fullWidth = true
                        )
                    } else {
                        SMSFlowButton(
                            text = "Start Gateway",
                            onClick = {
                                val intent = SmsGatewayService.startIntent(context)
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                    context.startForegroundService(intent)
                                } else {
                                    context.startService(intent)
                                }
                            },
                            fullWidth = true
                        )
                    }
                }
            }

            // Stats Row
            item {
                StatRow(
                    stats = listOf(
                        "Today Sent" to uiState.todaySentCount.toString(),
                        "Pending" to uiState.pendingCount.toString()
                    )
                )
            }

            // Device Health Row
            item {
                StatRow(
                    stats = listOf(
                        "Battery" to "${uiState.batteryLevel}%",
                        "Signal" to "${uiState.signalStrength}/4"
                    )
                )
            }

            // Last Heartbeat
            item {
                SMSFlowCard {
                    Text(
                        text = "Last Heartbeat",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = uiState.lastHeartbeatTime?.let {
                            SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date(it))
                        } ?: "Never",
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Recent Messages
            if (uiState.recentMessages.isNotEmpty()) {
                item {
                    Text(
                        text = "Recent Messages",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
                items(uiState.recentMessages.take(10)) { message ->
                    MessageListItem(message = message)
                }
            }

            item { Spacer(modifier = Modifier.height(8.dp)) }
        }
    }
}

@Composable
private fun MessageListItem(message: Message) {
    SMSFlowCard(contentPadding = 12.dp) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = message.phoneNumber,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = message.body.take(60) + if (message.body.length > 60) "..." else "",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1
                )
            }
            val statusColor = when (message.status) {
                MessageStatus.DELIVERED -> Green500
                MessageStatus.SENT -> Green500
                MessageStatus.FAILED -> Error
                MessageStatus.SENDING -> Warning
                else -> MaterialTheme.colorScheme.onSurfaceVariant
            }
            Text(
                text = message.status.name,
                style = MaterialTheme.typography.labelSmall,
                color = statusColor
            )
        }
    }
}
