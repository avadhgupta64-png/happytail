import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

import '../services/permission_service.dart';
import '../services/file_chooser_service.dart';
import '../widgets/no_connection_widget.dart';

/// The production URL of the Happy Tail web app.
/// Change this to your actual deployment URL.
const String kAppUrl = 'https://happy-tail.onrender.com';

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _hasError = false;
  bool _isOffline = false;
  double _loadingProgress = 0;
  late StreamSubscription<List<ConnectivityResult>> _connectivitySub;

  @override
  void initState() {
    super.initState();
    _checkConnectivityAndInit();
    _listenConnectivity();
  }

  Future<void> _checkConnectivityAndInit() async {
    final results = await Connectivity().checkConnectivity();
    final offline = results.every((r) => r == ConnectivityResult.none);
    setState(() => _isOffline = offline);
    if (!offline) _initWebView();
  }

  void _listenConnectivity() {
    _connectivitySub = Connectivity()
        .onConnectivityChanged
        .listen((List<ConnectivityResult> results) {
      final offline = results.every((r) => r == ConnectivityResult.none);
      if (_isOffline && !offline) {
        // Came back online — reload
        setState(() => _isOffline = false);
        _controller.reload();
      } else {
        setState(() => _isOffline = offline);
      }
    });
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.white)
      ..enableZoom(false)
      ..setUserAgent(
        // Appending HappyTailApp/1.0 lets the web app detect it's running
        // inside the Flutter wrapper and skip its own JS splash screen,
        // preventing a double-splash experience.
        'HappyTailApp/1.0',
      )
      ..setNavigationDelegate(_buildNavigationDelegate())
      ..addJavaScriptChannel(
        'FlutterBridge',
        onMessageReceived: _onJsBridgeMessage,
      )
      ..loadRequest(Uri.parse(kAppUrl));

    // Grant camera + microphone permissions before the WebView asks
    _requestPermissionsUpfront();
  }

  Future<void> _requestPermissionsUpfront() async {
    await PermissionService.requestAll();
  }

  NavigationDelegate _buildNavigationDelegate() {
    return NavigationDelegate(
      onPageStarted: (_) => setState(() {
        _isLoading = true;
        _hasError = false;
        _loadingProgress = 0;
      }),
      onProgress: (p) => setState(() => _loadingProgress = p / 100.0),
      onPageFinished: (_) => setState(() => _isLoading = false),
      onWebResourceError: (WebResourceError error) {
        // Ignore sub-resource errors (e.g. a failed image) —
        // only treat main-frame navigation failures as fatal.
        if (error.isForMainFrame ?? false) {
          setState(() {
            _hasError = true;
            _isLoading = false;
          });
        }
      },
      onNavigationRequest: (NavigationRequest request) {
        final uri = Uri.tryParse(request.url);
        if (uri == null) return NavigationDecision.prevent;

        // Allow the app's own domain and localhost
        if (request.url.startsWith(kAppUrl) ||
            request.url.startsWith('http://localhost') ||
            request.url.startsWith('https://localhost')) {
          return NavigationDecision.navigate;
        }

        // Allow OAuth redirect flows (Google)
        if (uri.host.contains('accounts.google.com') ||
            uri.host.contains('google.com') ||
            uri.host.contains('googleapis.com')) {
          return NavigationDecision.navigate;
        }

        // Block all other external navigation (open in browser instead)
        // For now just block; a url_launcher call can be added here
        return NavigationDecision.prevent;
      },
    );
  }

  void _onJsBridgeMessage(JavaScriptMessage message) {
    // Reserved for future JS→Flutter communication (e.g. share sheet, haptics)
    debugPrint('[FlutterBridge] ${message.message}');
  }

  Future<bool> _onWillPop() async {
    if (await _controller.canGoBack()) {
      await _controller.goBack();
      return false;
    }
    return true;
  }

  @override
  void dispose() {
    _connectivitySub.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_isOffline) {
      return NoConnectionWidget(
        onRetry: () => _checkConnectivityAndInit(),
      );
    }

    if (_hasError) {
      return _ErrorWidget(
        onRetry: () {
          setState(() => _hasError = false);
          _controller.reload();
        },
      );
    }

    return Stack(
      children: [
        // The WebView — always in tree so it stays warm
        WebViewWidget(controller: _controller),

        // Thin progress bar at top while loading
        if (_isLoading)
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: LinearProgressIndicator(
              value: _loadingProgress > 0 ? _loadingProgress : null,
              minHeight: 3,
              backgroundColor: Colors.transparent,
              valueColor: const AlwaysStoppedAnimation<Color>(
                Color(0xFFE07B39),
              ),
            ),
          ),
      ],
    );
  }
}

class _ErrorWidget extends StatelessWidget {
  final VoidCallback onRetry;
  const _ErrorWidget({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.cloud_off_rounded,
                size: 64, color: Color(0xFFE07B39)),
            const SizedBox(height: 20),
            const Text(
              'Something went wrong',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A1A2E),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Could not load Happy Tail. Please check your connection and try again.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF6B7280), fontSize: 14),
            ),
            const SizedBox(height: 28),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Try Again'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE07B39),
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
