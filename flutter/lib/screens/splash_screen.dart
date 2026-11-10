import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'webview_screen.dart';

/// Native Flutter splash screen — shown ONLY for ~1.5 s on first cold start,
/// then immediately hands off to the WebView. The web app has its own JS
/// splash; we keep the native one short to avoid a double-splash effect.
class SplashScreen extends StatefulWidget {
  final SharedPreferences prefs;
  const SplashScreen({super.key, required this.prefs});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fadeAnim;
  late final Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _fadeAnim = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _scaleAnim = Tween<double>(begin: 0.75, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );

    _controller.forward();

    // Navigate to WebView after 1.5 s total so the web-app JS splash
    // doesn't overlap the native one for too long.
    Future.delayed(const Duration(milliseconds: 1500), _goToWebView);
  }

  void _goToWebView() {
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const WebViewScreen(),
        transitionsBuilder: (_, animation, __, child) =>
            FadeTransition(opacity: animation, child: child),
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: FadeTransition(
          opacity: _fadeAnim,
          child: ScaleTransition(
            scale: _scaleAnim,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Logo — use asset if present, fallback to icon
                ClipRRect(
                  borderRadius: BorderRadius.circular(28),
                  child: Image.asset(
                    'assets/logo.png',
                    width: 110,
                    height: 110,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 110,
                      height: 110,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE07B39),
                        borderRadius: BorderRadius.circular(28),
                      ),
                      child: const Icon(Icons.pets,
                          color: Colors.white, size: 56),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Happy Tail',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A1A2E),
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Tech for Paws · Care for Life',
                  style: TextStyle(
                    fontSize: 13,
                    color: Color(0xFF9CA3AF),
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 40),
                const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFE07B39)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
