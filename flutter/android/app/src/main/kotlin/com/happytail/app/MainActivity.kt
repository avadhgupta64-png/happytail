package com.happytail.app

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : FlutterActivity() {

    companion object {
        private const val CHANNEL = "com.happytail.app/bridge"
        private const val FILE_CHOOSER_REQUEST = 1001
        private const val CAMERA_PERMISSION_REQUEST = 1002
        private const val STORAGE_PERMISSION_REQUEST = 1003

        // Permissions required on all Android versions
        private val BASE_PERMISSIONS = arrayOf(
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO,
        )

        // Storage permissions vary by Android version
        private fun storagePermissions(): Array<String> {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                arrayOf(
                    Manifest.permission.READ_MEDIA_IMAGES,
                    Manifest.permission.READ_MEDIA_VIDEO,
                )
            } else {
                arrayOf(
                    Manifest.permission.READ_EXTERNAL_STORAGE,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE,
                )
            }
        }
    }

    // WebChromeClient file-chooser callback
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var cameraImageUri: Uri? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestAllPermissions()
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        // MethodChannel for JS ↔ Flutter communication
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "requestPermissions" -> {
                        requestAllPermissions()
                        result.success(null)
                    }
                    "openSettings" -> {
                        val intent = Intent(
                            android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                            Uri.parse("package:$packageName")
                        )
                        startActivity(intent)
                        result.success(null)
                    }
                    else -> result.notImplemented()
                }
            }

        // Configure the WebView that the Flutter webview_flutter plugin creates
        // so it can handle file inputs and camera/mic requests.
        WebView.setWebContentsDebuggingEnabled(false)
    }

    // ── Permission helpers ──────────────────────────────────────────────────

    private fun requestAllPermissions() {
        val allPermissions = BASE_PERMISSIONS + storagePermissions()
        val missing = allPermissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missing.toTypedArray(), CAMERA_PERMISSION_REQUEST)
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray,
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        // Results are handled by Flutter's permission_handler plugin.
        // We just log for debugging:
        permissions.forEachIndexed { i, perm ->
            val granted = grantResults.getOrNull(i) == PackageManager.PERMISSION_GRANTED
            android.util.Log.d("HappyTail", "Permission $perm: ${if (granted) "GRANTED" else "DENIED"}")
        }
    }

    // ── File chooser (input[type=file] in WebView) ──────────────────────────

    /**
     * Called by the Flutter webview_flutter plugin's WebChromeClient bridge.
     * We override the standard file chooser to also offer the camera.
     */
    fun onShowFileChooser(
        webView: WebView?,
        filePathCallback: ValueCallback<Array<Uri>>,
        fileChooserParams: WebChromeClient.FileChooserParams,
    ): Boolean {
        // Cancel any previous callback
        this.filePathCallback?.onReceiveValue(null)
        this.filePathCallback = filePathCallback

        val acceptTypes = fileChooserParams.acceptTypes?.joinToString(",") ?: "*/*"
        val captureEnabled = fileChooserParams.isCaptureEnabled
        val isVideo = acceptTypes.contains("video")
        val isImage = acceptTypes.contains("image")

        val chooserIntents = mutableListOf<Intent>()

        // Camera intent
        if (captureEnabled || isImage || isVideo) {
            if (isVideo) {
                val videoIntent = Intent(MediaStore.ACTION_VIDEO_CAPTURE)
                if (videoIntent.resolveActivity(packageManager) != null) {
                    chooserIntents.add(videoIntent)
                }
            } else {
                val photoFile = createImageFile()
                cameraImageUri = FileProvider.getUriForFile(
                    this,
                    "$packageName.fileprovider",
                    photoFile,
                )
                val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                    putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri)
                }
                if (cameraIntent.resolveActivity(packageManager) != null) {
                    chooserIntents.add(cameraIntent)
                }
            }
        }

        // Gallery / file picker intent
        val galleryIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = if (isVideo) "video/*" else if (isImage) "image/*" else "*/*"
            addCategory(Intent.CATEGORY_OPENABLE)
            if (fileChooserParams.mode == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE) {
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            }
        }
        chooserIntents.add(galleryIntent)

        if (chooserIntents.isEmpty()) {
            this.filePathCallback?.onReceiveValue(null)
            this.filePathCallback = null
            return false
        }

        val chooser = if (chooserIntents.size == 1) {
            chooserIntents[0]
        } else {
            val lastIntent = chooserIntents.removeLast()
            Intent.createChooser(lastIntent, "Choose file").apply {
                putExtra(Intent.EXTRA_INITIAL_INTENTS, chooserIntents.toTypedArray())
            }
        }

        startActivityForResult(chooser, FILE_CHOOSER_REQUEST)
        return true
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode != FILE_CHOOSER_REQUEST) return

        val callback = filePathCallback ?: return
        filePathCallback = null

        if (resultCode != Activity.RESULT_OK) {
            callback.onReceiveValue(null)
            return
        }

        val results = mutableListOf<Uri>()

        // Multiple selection
        val clipData = data?.clipData
        if (clipData != null) {
            for (i in 0 until clipData.itemCount) {
                clipData.getItemAt(i).uri?.let { results.add(it) }
            }
        } else if (data?.data != null) {
            results.add(data.data!!)
        } else if (cameraImageUri != null) {
            // Camera capture — use the pre-set URI
            results.add(cameraImageUri!!)
        }

        cameraImageUri = null
        callback.onReceiveValue(if (results.isNotEmpty()) results.toTypedArray() else null)
    }

    private fun createImageFile(): File {
        val ts = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val dir = getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile("HappyTail_${ts}_", ".jpg", dir)
    }

    // ── WebChromeClient permission (camera/mic in WebView) ──────────────────

    /**
     * Grant camera and microphone to the web page automatically once
     * the Android-level permissions are already granted.
     */
    fun onPermissionRequest(request: PermissionRequest) {
        val granted = request.resources.filter { resource ->
            when (resource) {
                PermissionRequest.RESOURCE_VIDEO_CAPTURE ->
                    ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) ==
                        PackageManager.PERMISSION_GRANTED
                PermissionRequest.RESOURCE_AUDIO_CAPTURE ->
                    ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) ==
                        PackageManager.PERMISSION_GRANTED
                else -> true
            }
        }
        if (granted.isNotEmpty()) {
            request.grant(granted.toTypedArray())
        } else {
            request.deny()
        }
    }
}
