package com.smsflow.gateway.ui.screens.pairing

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.smsflow.gateway.pairing.PairingState
import com.smsflow.gateway.pairing.PairingViewModel
import com.smsflow.gateway.pairing.QrScannerScreen
import com.smsflow.gateway.ui.components.LoadingIndicator
import org.koin.androidx.compose.koinViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PairingScanScreen(
    onPairingSuccess: () -> Unit,
    onBack: () -> Unit,
    viewModel: PairingViewModel = koinViewModel()
) {
    val pairingState by viewModel.pairingState.collectAsState()

    LaunchedEffect(pairingState) {
        if (pairingState is PairingState.Success) {
            onPairingSuccess()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Scan QR Code") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (pairingState) {
                is PairingState.Pairing -> {
                    LoadingIndicator(message = "Pairing device...")
                }
                is PairingState.Error -> {
                    val error = (pairingState as PairingState.Error).message
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Spacer(modifier = Modifier.height(64.dp))
                        Text(
                            text = "Pairing Failed",
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.error
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = error,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        com.smsflow.gateway.ui.components.SMSFlowButton(
                            text = "Try Again",
                            onClick = { viewModel.startScanning() }
                        )
                    }
                }
                else -> {
                    QrScannerScreen(
                        onQrCodeScanned = { raw ->
                            viewModel.onQrCodeScanned(raw)
                        },
                        onPermissionDenied = onBack
                    )
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        contentAlignment = Alignment.BottomCenter
                    ) {
                        Text(
                            text = "Point camera at the QR code in your SMSFlow dashboard",
                            style = MaterialTheme.typography.bodyMedium,
                            color = androidx.compose.ui.graphics.Color.White,
                            modifier = Modifier.padding(bottom = 32.dp)
                        )
                    }
                }
            }
        }
    }
}
