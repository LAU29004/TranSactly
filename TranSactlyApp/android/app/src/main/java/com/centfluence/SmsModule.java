package com.centfluence;

import android.database.Cursor;
import android.net.Uri;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

public class SmsModule extends ReactContextBaseJavaModule {

    public SmsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "SmsModule";
    }

    @ReactMethod
    public void getSMS(Promise promise) {
        try {
            WritableArray smsArray = Arguments.createArray();

            Cursor cursor = getReactApplicationContext()
                    .getContentResolver()
                    .query(Uri.parse("content://sms/inbox"),
                            null,
                            null,
                            null,
                            "date DESC");

            if (cursor != null) {
                while (cursor.moveToNext()) {
                    WritableMap sms = Arguments.createMap();

                    sms.putString(
                            "body",
                            cursor.getString(
                                    cursor.getColumnIndexOrThrow("body")));

                    sms.putString(
                            "date",
                            cursor.getString(
                                    cursor.getColumnIndexOrThrow("date")));

                    smsArray.pushMap(sms);
                }

                cursor.close();
            }

            promise.resolve(smsArray);

        } catch (Exception e) {
            promise.reject("SMS_ERROR", e);
        }
    }
}