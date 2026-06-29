# Capacitor
-keep class com.getcapacitor.** { *; }
-keep class com.jurir.app.** { *; }

# Reflection
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable

# WebView JS Interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# OkHttp (usado internamente pelo Capacitor)
-dontwarn okhttp3.**
-dontwarn okio.**
