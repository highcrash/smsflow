package com.smsflow.gateway.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.Color
import com.smsflow.gateway.data.preferences.PreferencesManager
import org.koin.compose.koinInject

private val LightColorScheme = lightColorScheme(
    primary = Green500,
    onPrimary = WhitePure,
    primaryContainer = Green100,
    onPrimaryContainer = Green800,
    secondary = Green600,
    onSecondary = WhitePure,
    secondaryContainer = Green50,
    onSecondaryContainer = Green700,
    tertiary = Info,
    background = WhitePure,
    onBackground = Dark900,
    surface = WhiteSoft,
    onSurface = Dark900,
    surfaceVariant = WhiteWarm,
    onSurfaceVariant = Dark600,
    outline = WhiteMuted,
    error = Error,
    onError = WhitePure,
    errorContainer = Color(0xFFFFEDED),
    onErrorContainer = Color(0xFF9B1C1C)
)

private val DarkColorScheme = darkColorScheme(
    primary = Green400,
    onPrimary = Dark900,
    primaryContainer = Green800,
    onPrimaryContainer = Green100,
    secondary = Green500,
    onSecondary = Dark900,
    secondaryContainer = Green700,
    onSecondaryContainer = Green50,
    tertiary = Info,
    background = Dark900,
    onBackground = WhitePure,
    surface = Dark800,
    onSurface = WhitePure,
    surfaceVariant = Dark700,
    onSurfaceVariant = Dark400,
    outline = Dark600,
    error = Error,
    onError = WhitePure,
    errorContainer = Color(0xFF7F1D1D),
    onErrorContainer = Color(0xFFFECACA)
)

@Composable
fun SMSFlowTheme(
    content: @Composable () -> Unit
) {
    val preferencesManager = koinInject<PreferencesManager>()
    val darkMode by preferencesManager.darkMode.collectAsState(initial = false)
    val systemDark = isSystemInDarkTheme()
    val useDark = darkMode || systemDark

    val colorScheme = if (useDark) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = SMSFlowTypography,
        shapes = SMSFlowShapes,
        content = content
    )
}
