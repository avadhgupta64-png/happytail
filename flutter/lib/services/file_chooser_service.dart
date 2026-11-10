import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';

/// Handles file selection requests originating from the WebView
/// (input[type=file] taps). Android WebView's onShowFileChooser
/// is intercepted by the MainActivity and routed here.
class FileChooserService {
  static final _imagePicker = ImagePicker();

  /// Pick one or more images from the gallery.
  static Future<List<File>> pickImages({bool multiple = false}) async {
    if (multiple) {
      final files = await _imagePicker.pickMultiImage(imageQuality: 85);
      return files.map((xf) => File(xf.path)).toList();
    }
    final file = await _imagePicker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (file == null) return [];
    return [File(file.path)];
  }

  /// Take a photo with the camera.
  static Future<File?> takePhoto() async {
    final file = await _imagePicker.pickImage(
      source: ImageSource.camera,
      imageQuality: 90,
    );
    if (file == null) return null;
    return File(file.path);
  }

  /// Record a video with the camera.
  static Future<File?> recordVideo({Duration? maxDuration}) async {
    final file = await _imagePicker.pickVideo(
      source: ImageSource.camera,
      maxDuration: maxDuration ?? const Duration(minutes: 5),
    );
    if (file == null) return null;
    return File(file.path);
  }

  /// Generic file picker (any type).
  static Future<List<File>> pickFiles({
    List<String>? allowedExtensions,
    bool multiple = false,
  }) async {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: multiple,
      type: allowedExtensions != null ? FileType.custom : FileType.any,
      allowedExtensions: allowedExtensions,
    );
    if (result == null) return [];
    return result.paths
        .whereType<String>()
        .map((p) => File(p))
        .toList();
  }

  /// Pick video from gallery.
  static Future<File?> pickVideo() async {
    final file = await _imagePicker.pickVideo(source: ImageSource.gallery);
    if (file == null) return null;
    return File(file.path);
  }
}
