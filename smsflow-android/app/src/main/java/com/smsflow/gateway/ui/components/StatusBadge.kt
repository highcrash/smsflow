package com.smsflow.gateway.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smsflow.gateway.ui.theme.Dark600
import com.smsflow.gateway.ui.theme.Error
import com.smsflow.gateway.ui.theme.Green500
import com.smsflow.gateway.ui.theme.Warning

enum class BadgeStatus {
    ONLINE, OFFLINE, CONNECTING, WARNING, ERROR
}

@Composable
fun StatusBadge(
    status: BadgeStatus,
    label: String? = null,
    modifier: Modifier = Modifier
) {
    val (bgColor, dotColor, textColor) = when (status) {
        BadgeStatus.ONLINE -> Triple(Color(0xFFD1FAE5), Green500, Color(0xFF065F46))
        BadgeStatus.OFFLINE -> Triple(Color(0xFFF3F4F6), Dark600, Color(0xFF374151))
        BadgeStatus.CONNECTING -> Triple(Color(0xFFFEF3C7), Warning, Color(0xFF92400E))
        BadgeStatus.WARNING -> Triple(Color(0xFFFEF3C7), Warning, Color(0xFF92400E))
        BadgeStatus.ERROR -> Triple(Color(0xFFFEE2E2), Error, Color(0xFF991B1B))
    }

    val displayLabel = label ?: when (status) {
        BadgeStatus.ONLINE -> "Online"
        BadgeStatus.OFFLINE -> "Offline"
        BadgeStatus.CONNECTING -> "Connecting"
        BadgeStatus.WARNING -> "Warning"
        BadgeStatus.ERROR -> "Error"
    }

    Box(
        modifier = modifier
            .background(bgColor, RoundedCornerShape(50))
            .padding(horizontal = 10.dp, vertical = 4.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(dotColor, CircleShape)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = displayLabel,
                color = textColor,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}
