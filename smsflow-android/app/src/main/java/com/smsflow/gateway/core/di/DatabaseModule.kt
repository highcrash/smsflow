package com.smsflow.gateway.core.di

import androidx.room.Room
import com.smsflow.gateway.core.constants.AppConstants
import com.smsflow.gateway.data.local.AppDatabase
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.module

val databaseModule = module {

    single {
        Room.databaseBuilder(
            androidContext(),
            AppDatabase::class.java,
            AppConstants.DATABASE_NAME
        )
            .fallbackToDestructiveMigration()
            .build()
    }

    single { get<AppDatabase>().messageDao() }

    single { get<AppDatabase>().logDao() }
}
