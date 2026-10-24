# Happy Tail — Flutter wrapper

A polished Flutter Android/iOS shell for the existing Happy Tail web app. It keeps the current production app and backend in place while adding native system bars, an app header, page progress, reload, Android back navigation, and an offline/error recovery screen.

## Requirements

- Flutter stable (Dart 3.3+)
- Android Studio / Android SDK for Android builds
- Xcode on macOS for iOS builds

## Create platform folders

From this directory, run:

```bash
flutter create --platforms=android,ios .
flutter pub get
flutter run
```

The wrapper points to `https://happytail-tan.vercel.app`. It does not bundle the website or replace its backend. Authentication, uploads, and other flows should be tested on a real device before release.

## Build an Android APK

```bash
flutter build apk --release
```

APK output: `build/app/outputs/flutter-apk/app-release.apk`

## Brand assets

The in-app header attempts to load the existing site's favicon and falls back to a paw icon. Before publishing, replace that fallback with the original Happy Tail logo image asset and add Android launcher icons generated from the same original logo (for example with `flutter_launcher_icons`). Do not publish until the OAuth, camera/file upload, external payment links, and navigation flows have been tested on physical devices.
