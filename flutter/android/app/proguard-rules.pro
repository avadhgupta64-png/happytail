# Flutter + WebView
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }
-dontwarn io.flutter.**

# WebView
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String, android.graphics.Bitmap);
    public boolean *(android.webkit.WebView, java.lang.String);
}
-keepclassmembers class * extends android.webkit.WebChromeClient {
    public void *(android.webkit.WebView, java.lang.String);
}

# Kotlin
-keep class kotlin.** { *; }
-dontwarn kotlin.**

# OkHttp / Retrofit (used internally by some Flutter plugins)
-dontwarn okhttp3.**
-dontwarn retrofit2.**

# AndroidX
-keep class androidx.** { *; }
-dontwarn androidx.**

# FileProvider
-keep class androidx.core.content.FileProvider { *; }
