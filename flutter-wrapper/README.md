# Happy Tail — Flutter mobile wrapper

This directory contains the Flutter source for a branded Android/iOS shell around the existing Happy Tail web app.

## What is included

- Branded **Happy Tail** app name and dark navy/orange styling
- WebView connected to https://happytail-tan.vercel.app
- Page-load progress, reload control, Android back navigation
- Friendly connectivity/load error screen with retry
- Safe basic PWA shell support in the website; authenticated API responses are not cached
- GitHub Actions workflow to generate platform projects, run Flutter analysis, build a release APK, and publish it as a downloadable workflow artifact

## Build it yourself

Requires Flutter stable and Android tooling. From this directory:

```bash
flutter create --platforms=android,ios --org com.happytail --project-name happy_tail .
flutter pub get
flutter analyze
flutter run
```

Build the Android APK:

```bash
flutter build apk --release
```

Output: `build/app/outputs/flutter-apk/app-release.apk`.

## Build the APK in GitHub

Open [Actions](https://github.com/avadhgupta64-png/happytail/actions/workflows/happy-tail-android.yml), select **Build Happy Tail Android APK**, and run the workflow. When it completes successfully, download the `happy-tail-android-apk` artifact from the run.

## Important release checks

This wrapper loads the existing hosted web app; it does not bundle the website/backend offline. Verify Google sign-in and OAuth redirects, camera/photo upload, file selection, external links, and app lifecycle on a physical Android device before distributing. The PWA manifest uses the site's favicon as a fallback icon for now; use the original Happy Tail logo artwork to generate proper launcher and PWA icon sizes before a public release.
