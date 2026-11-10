import 'package:permission_handler/permission_handler.dart';

/// Requests all permissions the WebView may need proactively,
/// before the web page actually asks. This prevents the browser
/// permission prompt from appearing mid-flow and confusing users.
class PermissionService {
  /// Request camera, microphone, photos, and storage in one shot.
  static Future<void> requestAll() async {
    await [
      Permission.camera,
      Permission.microphone,
      Permission.photos,
      Permission.storage,
      Permission.manageExternalStorage,
    ].request();
  }

  static Future<bool> hasCameraPermission() async =>
      await Permission.camera.isGranted;

  static Future<bool> hasMicrophonePermission() async =>
      await Permission.microphone.isGranted;

  static Future<bool> hasStoragePermission() async =>
      await Permission.storage.isGranted ||
      await Permission.photos.isGranted;

  /// Returns true if the user has permanently denied a permission
  /// (they need to go to Settings to re-enable it).
  static Future<bool> isPermanentlyDenied(Permission p) async =>
      await p.isPermanentlyDenied;

  /// Opens app Settings so the user can re-enable permissions.
  static Future<void> openSettings() => openAppSettings();
}
