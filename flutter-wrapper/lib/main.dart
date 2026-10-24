import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:permission_handler/permission_handler.dart';

const appUrl = 'https://happytail-tan.vercel.app';
const brandOrange = Color(0xFFFFA000);
const ink = Color(0xFF101827);

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: ink,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: ink,
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  runApp(const HappyTailApp());
}

class HappyTailApp extends StatelessWidget {
  const HappyTailApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'Happy Tail',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(seedColor: brandOrange, brightness: Brightness.light),
          scaffoldBackgroundColor: const Color(0xFFF8FAFC),
          appBarTheme: const AppBarTheme(
            backgroundColor: ink,
            foregroundColor: Colors.white,
            elevation: 0,
            centerTitle: false,
            systemOverlayStyle: SystemUiOverlayStyle.light,
          ),
        ),
        home: const HappyTailWebShell(),
      );
}

class HappyTailWebShell extends StatefulWidget {
  const HappyTailWebShell({super.key});

  @override
  State<HappyTailWebShell> createState() => _HappyTailWebShellState();
}

class _HappyTailWebShellState extends State<HappyTailWebShell> {
  late final WebViewController _controller;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySub;
  bool _loading = true;
  bool _offline = false;
  bool _hasError = false;
  double _progress = 0;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFFF8FAFC))
      ..clearCache()
      ..setNavigationDelegate(NavigationDelegate(
        onProgress: (progress) {
          if (!mounted) return;
          setState(() {
            _progress = progress / 100;
            _loading = progress < 100;
          });
        },
        onPageStarted: (_) {
          if (!mounted) return;
          setState(() {
            _loading = true;
            _hasError = false;
          });
        },
        onPageFinished: (_) {
          if (!mounted) return;
          setState(() {
            _loading = false;
            _hasError = false;
            _progress = 1;
          });
        },
        onWebResourceError: (error) {
          if (error.isForMainFrame == false || !mounted) return;
          setState(() {
            _loading = false;
            _hasError = true;
          });
        },
        onNavigationRequest: (request) {
          final uri = Uri.tryParse(request.url);
          if (uri == null) return NavigationDecision.prevent;
          if (uri.scheme == 'https' &&
              (uri.host == 'happytail-tan.vercel.app' ||
                  uri.host.endsWith('.vercel.app'))) {
            return NavigationDecision.navigate;
          }
          // Keep authentication/payment providers and other secure external flows
          // available in the WebView so OAuth redirects can return to Happy Tail.
          if (uri.scheme == 'https' || uri.scheme == 'http') {
            return NavigationDecision.navigate;
          }
          return NavigationDecision.prevent;
        },
      ))
      ..loadRequest(Uri.parse(appUrl));

    // WebView media capture needs Android runtime permissions as well as
    // granting the website's camera/microphone request.
    if (_controller.platform is AndroidWebViewController) {
      (_controller.platform as AndroidWebViewController)
          .setOnPlatformPermissionRequest((request) async {
        final wantsVideo = request.types.contains(WebViewPermissionResourceType.camera);
        final wantsAudio = request.types.contains(WebViewPermissionResourceType.microphone);
        final permissions = <Permission>[
          if (wantsVideo) Permission.camera,
          if (wantsAudio) Permission.microphone,
        ];
        if (permissions.isEmpty) {
          request.deny();
          return;
        }
        final results = await permissions.request();
        final allGranted = results.values.every((status) => status.isGranted);
        if (allGranted) {
          request.grant();
        } else {
          request.deny();
          if (mounted && results.values.any((status) => status.isPermanentlyDenied)) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: const Text('Enable camera or microphone permission in Android Settings to record media.'),
                action: SnackBarAction(
                  label: 'Settings',
                  onPressed: openAppSettings,
                ),
              ),
            );
          }
        }
      });
    }

    _connectivitySub = Connectivity().onConnectivityChanged.listen((results) {
      if (!mounted) return;
      setState(() => _offline = results.contains(ConnectivityResult.none));
    });
    Connectivity().checkConnectivity().then((results) {
      if (mounted) setState(() => _offline = results.contains(ConnectivityResult.none));
    });
  }

  @override
  void dispose() {
    _connectivitySub?.cancel();
    super.dispose();
  }

  Future<bool> _handleBack() async {
    if (await _controller.canGoBack()) {
      await _controller.goBack();
      return false;
    }
    return true;
  }

  Future<void> _retry() async {
    setState(() {
      _hasError = false;
      _loading = true;
    });
    await _controller.reload();
  }

  @override
  Widget build(BuildContext context) => PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, result) async {
          if (didPop) return;
          final shouldExit = await _handleBack();
          if (shouldExit && mounted) {
            SystemNavigator.pop();
          }
        },
        child: Scaffold(
          appBar: AppBar(
            toolbarHeight: 62,
            titleSpacing: 16,
            title: Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Padding(
                    padding: const EdgeInsets.all(3),
                    child: Image.asset(
                      'assets/happy_tail_logo.png',
                      fit: BoxFit.contain,
                      filterQuality: FilterQuality.high,
                    ),
                  ),
                ),
                const SizedBox(width: 11),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Happy Tail', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                    Text('A happier world for dogs', style: TextStyle(fontSize: 11, color: Color(0xFFCBD5E1), fontWeight: FontWeight.w500)),
                  ],
                ),
              ],
            ),
            actions: [
              IconButton(
                tooltip: 'Reload',
                onPressed: _retry,
                icon: const Icon(Icons.refresh_rounded),
              ),
              const SizedBox(width: 4),
            ],
            bottom: _loading
                ? PreferredSize(
                    preferredSize: const Size.fromHeight(2),
                    child: LinearProgressIndicator(
                      value: _progress > 0 && _progress < 1 ? _progress : null,
                      minHeight: 2,
                      backgroundColor: Colors.white12,
                      color: brandOrange,
                    ),
                  )
                : null,
          ),
          body: Stack(
            children: [
              WebViewWidget(controller: _controller),
              if (_offline || _hasError)
                Positioned.fill(
                  child: Container(
                    color: const Color(0xFFF8FAFC),
                    padding: const EdgeInsets.all(28),
                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 360),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 76,
                              height: 76,
                              decoration: BoxDecoration(
                                color: brandOrange.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(24),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(12),
                                child: Image.asset(
                                  'assets/happy_tail_logo.png',
                                  fit: BoxFit.contain,
                                  filterQuality: FilterQuality.high,
                                ),
                              ),
                            ),
                            const SizedBox(height: 22),
                            const Text('Let’s get you reconnected', textAlign: TextAlign.center,
                                style: TextStyle(fontSize: 23, fontWeight: FontWeight.w800, color: ink)),
                            const SizedBox(height: 10),
                            Text(
                              _offline ? 'You appear to be offline. Check your connection and try again.' : 'Happy Tail could not load right now. Please try again.',
                              textAlign: TextAlign.center,
                              style: const TextStyle(height: 1.5, color: Color(0xFF64748B)),
                            ),
                            const SizedBox(height: 24),
                            FilledButton.icon(
                              onPressed: _retry,
                              icon: const Icon(Icons.refresh_rounded),
                              label: const Text('Try again'),
                              style: FilledButton.styleFrom(
                                backgroundColor: brandOrange,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      );
}
