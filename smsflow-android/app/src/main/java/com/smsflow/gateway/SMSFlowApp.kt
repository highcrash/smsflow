package com.smsflow.gateway

import android.app.Application
import com.smsflow.gateway.core.di.appModule
import com.smsflow.gateway.core.di.databaseModule
import com.smsflow.gateway.core.di.networkModule
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin
import org.koin.core.logger.Level

class SMSFlowApp : Application() {

    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidLogger(Level.ERROR)
            androidContext(this@SMSFlowApp)
            modules(
                appModule,
                networkModule,
                databaseModule
            )
        }
    }
}
