package com.smsflow.gateway.ui.navigation

sealed class Screen(val route: String) {
    object Onboarding : Screen("onboarding")
    object PairingScan : Screen("pairing_scan")
    object PairingSuccess : Screen("pairing_success")
    object Dashboard : Screen("dashboard")
    object Messages : Screen("messages")
    object Settings : Screen("settings")
    object SimManagement : Screen("sim_management")
    object ServerSettings : Screen("server_settings")
    object Logs : Screen("logs")
}
