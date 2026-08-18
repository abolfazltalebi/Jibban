export const ANDROID_SMS_RECEIVER_MODULE_JAVA = `package com.jibban.smslistener;

import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SmsReceiverModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "SmsReceiverModule";
    private static ReactApplicationContext reactContext;
    private SmsBroadcastReceiver smsReceiver;

    public SmsReceiverModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void startListener() {
        if (smsReceiver == null) {
            smsReceiver = new SmsBroadcastReceiver();
            IntentFilter filter = new IntentFilter("android.provider.Telephony.SMS_RECEIVED");
            filter.setPriority(999);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getReactApplicationContext().registerReceiver(smsReceiver, filter, Context.RECEIVER_EXPORTED);
            } else {
                getReactApplicationContext().registerReceiver(smsReceiver, filter);
            }
        }
    }

    @ReactMethod
    public void stopListener() {
        if (smsReceiver != null) {
            try {
                getReactApplicationContext().unregisterReceiver(smsReceiver);
            } catch (Exception e) {
                // receiver wasn't registered
            }
            smsReceiver = null;
        }
    }

    public static void emitSmsEvent(String sender, String body, long timestamp) {
        if (reactContext != null && reactContext.hasActiveReactInstance()) {
            WritableMap params = Arguments.createMap();
            params.putString("sender", sender);
            params.putString("body", body);
            params.putDouble("timestamp", (double) timestamp);

            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onSmsReceived", params);
        }
    }
}
`;

export const ANDROID_SMS_BROADCAST_RECEIVER_JAVA = `package com.jibban.smslistener;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

public class SmsBroadcastReceiver extends BroadcastReceiver {
    private static final String TAG = "JibbanSmsReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if ("android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                try {
                    Object[] pdus = (Object[]) bundle.get("pdus");
                    String format = bundle.getString("format");
                    if (pdus != null) {
                        StringBuilder fullBody = new StringBuilder();
                        String sender = "";
                        long timestamp = System.currentTimeMillis();

                        for (Object pdu : pdus) {
                            SmsMessage smsMessage;
                            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                                smsMessage = SmsMessage.createFromPdu((byte[]) pdu, format);
                            } else {
                                smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                            }

                            if (smsMessage != null) {
                                sender = smsMessage.getDisplayOriginatingAddress();
                                fullBody.append(smsMessage.getDisplayMessageBody());
                                timestamp = smsMessage.getTimestampMillis();
                            }
                        }

                        // Emit directly to React Native Event Emitter
                        SmsReceiverModule.emitSmsEvent(sender, fullBody.toString(), timestamp);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing incoming SMS: " + e.getMessage());
                }
            }
        }
    }
}
`;

export const ANDROID_MANIFEST_XML = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.jibban">

    <!-- SMS Permissions -->
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    
    <!-- Biometrics & Security -->
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />
    
    <!-- High Priority Interactive Notifications -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    
    <!-- Storage & Export -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" tools:targetApi="eclair" />

    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme"
        android:supportsRtl="true">
        
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Static Background SMS BroadcastReceiver -->
        <receiver
            android:name=".smslistener.SmsBroadcastReceiver"
            android:permission="android.permission.BROADCAST_SMS"
            android:exported="true">
            <intent-filter android:priority="999">
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>
`;

export const REACT_NATIVE_PACKAGE_JSON = `{
  "name": "jibban",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {
    "@gorhom/bottom-sheet": "^4.6.4",
    "@nozbe/watermelondb": "^0.27.1",
    "@notifee/react-native": "^9.1.8",
    "@react-native-clipboard/clipboard": "^1.14.1",
    "@react-native-community/netinfo": "^11.3.1",
    "@react-navigation/bottom-tabs": "^6.5.20",
    "@react-navigation/native": "^6.1.17",
    "@react-navigation/native-stack": "^6.9.26",
    "jalaali-js": "^1.2.6",
    "lucide-react-native": "^0.378.0",
    "react": "18.2.0",
    "react-native": "0.73.6",
    "react-native-biometrics": "^3.0.1",
    "react-native-fs": "^2.20.0",
    "react-native-gesture-handler": "^2.16.0",
    "react-native-get-sms-android": "^2.1.0",
    "react-native-keychain": "^8.2.0",
    "react-native-mmkv": "^2.12.2",
    "react-native-reanimated": "^3.8.1",
    "react-native-safe-area-context": "^4.9.0",
    "react-native-screens": "^3.30.1",
    "react-native-svg": "^15.1.0",
    "react-native-victory-charts": "^36.6.12",
    "xlsx": "^0.18.5",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@babel/core": "^7.24.4",
    "@babel/preset-env": "^7.24.4",
    "@babel/runtime": "^7.24.4",
    "@react-native/babel-preset": "^0.73.21",
    "@react-native/eslint-config": "^0.73.3",
    "@react-native/metro-config": "^0.73.5",
    "@react-native/typescript-config": "^0.73.1",
    "@types/jest": "^29.5.12",
    "@types/react": "^18.2.79",
    "@types/react-test-renderer": "^18.0.7",
    "babel-jest": "^29.7.0",
    "eslint": "^8.57.0",
    "jest": "^29.7.0",
    "prettier": "^3.2.5",
    "react-test-renderer": "18.2.0",
    "typescript": "5.3.3"
  }
}
`;

export interface NativeFile {
  fileName: string;
  path: string;
  description: string;
  content: string;
}

export const ANDROID_NATIVE_FILES: NativeFile[] = [
  {
    fileName: 'SmsReceiverModule.java',
    path: 'android/app/src/main/java/com/jibban/smslistener/SmsReceiverModule.java',
    description: 'پل ارتباطی نیتیو به جاوااسکریپت برای ثبت و شنود رویداد دریافت پیامک‌های بانکی.',
    content: ANDROID_SMS_RECEIVER_MODULE_JAVA,
  },
  {
    fileName: 'SmsBroadcastReceiver.java',
    path: 'android/app/src/main/java/com/jibban/smslistener/SmsBroadcastReceiver.java',
    description: 'دریافت‌کننده پیامک پس‌زمینه با اولویت بالا (Priority 999) برای اندروید.',
    content: ANDROID_SMS_BROADCAST_RECEIVER_JAVA,
  },
  {
    fileName: 'AndroidManifest.xml',
    path: 'android/app/src/main/AndroidManifest.xml',
    description: 'پیکربندی دسترسی‌های READ_SMS و RECEIVE_SMS و ثبت BroadcastReceiver.',
    content: ANDROID_MANIFEST_XML,
  },
  {
    fileName: 'package.json',
    path: 'package.json (React Native CLI)',
    description: 'پیکربندی وابستگی‌های پروژه نیتیو شامل WatermelonDB, Notifee, Reanimated و غیره.',
    content: REACT_NATIVE_PACKAGE_JSON,
  },
];
