# Happy Tail — Flutter Android Wrapper

## Prerequisites

| Tool | Version |
|------|---------|
| Flutter | 3.19.x or later (stable channel) |
| Dart | 3.3.x (bundled with Flutter) |
| Java | 17 (required by AGP 8.2) |
| Android SDK | API 34 |
| Android NDK | as reported by `flutter doctor` |

Install Flutter: https://docs.flutter.dev/get-started/install/linux

## One-step build (debug APK)

```bash
cd flutter/
flutter pub get
flutter build apk --debug
# APK: build/app/outputs/flutter-apk/app-debug.apk
```

## Release APK (unsigned — for testing)

```bash
flutter build apk --release --no-tree-shake-icons
# APK: build/app/outputs/flutter-apk/app-release.apk
```

## Release APK (signed — for Play Store)

1. Generate a keystore (one-time):
   ```bash
   keytool -genkey -v -keystore android/keystore/release.jks \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias happytail
   ```

2. Add to `android/local.properties`:
   ```
   keystore.path=../keystore/release.jks
   keystore.keyAlias=happytail
   keystore.keyPassword=YOUR_KEY_PASSWORD
   keystore.storePassword=YOUR_STORE_PASSWORD
   ```

3. Build:
   ```bash
   flutter build apk --release
   ```

## Changing the app URL

Edit `lib/screens/webview_screen.dart` line:

```dart
const String kAppUrl = 'https://happy-tail.onrender.com';
```

Replace with your actual deployment URL.

## Permissions

The wrapper requests these permissions at runtime:

| Permission | Why |
|-----------|-----|
| `CAMERA` | Photo/video capture for AI analysis |
| `RECORD_AUDIO` | Bark Translator video recording |
| `READ_MEDIA_IMAGES` / `READ_EXTERNAL_STORAGE` | Upload photos from gallery |
| `READ_MEDIA_VIDEO` | Upload videos from gallery |
| `ACCESS_FINE_LOCATION` | Nearby dog-friendly places |
| `INTERNET` | Load the web app |

Camera and microphone permissions are granted to the WebView automatically once the Android-level permissions are accepted.

## Troubleshooting

**Gradle sync fails:** Make sure `android/local.properties` has `flutter.sdk` pointing to your Flutter installation.

**Camera not working in WebView:** Verify `CAMERA` and `RECORD_AUDIO` permissions are granted in Android Settings → Apps → Happy Tail → Permissions.

**File upload not working:** The `MainActivity.onShowFileChooser` handles this via the `file_chooser_service`. Check that storage permissions are granted.

**APK too large:** Use `flutter build apk --split-per-abi` to generate per-architecture APKs (arm64-v8a, armeabi-v7a, x86_64).
