package com.smsflow.gateway.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.smsflow.gateway.data.preferences.PreferencesManager
import com.smsflow.gateway.ui.screens.dashboard.DashboardScreen
import com.smsflow.gateway.ui.screens.logs.LogsScreen
import com.smsflow.gateway.ui.screens.messages.MessagesScreen
import com.smsflow.gateway.ui.screens.onboarding.OnboardingScreen
import com.smsflow.gateway.ui.screens.pairing.PairingScanScreen
import com.smsflow.gateway.ui.screens.pairing.PairingSuccessScreen
import com.smsflow.gateway.ui.screens.settings.ServerSettingsScreen
import com.smsflow.gateway.ui.screens.settings.SettingsScreen
import com.smsflow.gateway.ui.screens.settings.SimManagementScreen
import org.koin.compose.koinInject

@Composable
fun NavGraph() {
    val navController = rememberNavController()
    val preferencesManager = koinInject<PreferencesManager>()
    val isPaired by preferencesManager.isPaired.collectAsState(initial = false)

    val startDestination = if (isPaired) Screen.Dashboard.route else Screen.Onboarding.route

    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Onboarding.route) {
            OnboardingScreen(
                onStartPairing = { navController.navigate(Screen.PairingScan.route) }
            )
        }

        composable(Screen.PairingScan.route) {
            PairingScanScreen(
                onPairingSuccess = {
                    navController.navigate(Screen.PairingSuccess.route) {
                        popUpTo(Screen.Onboarding.route) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.PairingSuccess.route) {
            PairingSuccessScreen(
                onContinue = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.PairingSuccess.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Dashboard.route) {
            DashboardScreen(
                onNavigateToMessages = { navController.navigate(Screen.Messages.route) },
                onNavigateToSettings = { navController.navigate(Screen.Settings.route) },
                onNavigateToLogs = { navController.navigate(Screen.Logs.route) }
            )
        }

        composable(Screen.Messages.route) {
            MessagesScreen(onBack = { navController.popBackStack() })
        }

        composable(Screen.Settings.route) {
            SettingsScreen(
                onBack = { navController.popBackStack() },
                onNavigateToSimManagement = { navController.navigate(Screen.SimManagement.route) },
                onNavigateToServerSettings = { navController.navigate(Screen.ServerSettings.route) }
            )
        }

        composable(Screen.SimManagement.route) {
            SimManagementScreen(onBack = { navController.popBackStack() })
        }

        composable(Screen.ServerSettings.route) {
            ServerSettingsScreen(onBack = { navController.popBackStack() })
        }

        composable(Screen.Logs.route) {
            LogsScreen(onBack = { navController.popBackStack() })
        }
    }
}
