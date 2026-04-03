package com.smsflow.gateway.sim

enum class SimStrategy {
    DEFAULT,       // Use default SIM
    ROUND_ROBIN,   // Cycle through available SIMs
    RANDOM,        // Pick a random available SIM
    SPECIFIC       // Use a specific SIM slot
}
