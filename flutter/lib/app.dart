import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'screens/splash_screen.dart';

class HappyTailApp extends StatelessWidget {
  final SharedPreferences prefs;
  const HappyTailApp({super.key, required this.prefs});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Happy Tail',
      debugShowCheckedModeBanner: false,
      // Use a neutral white/light theme — no orange anywhere in the shell
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFE07B39),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: Colors.white,
        useMaterial3: true,
      ),
      themeMode: ThemeMode.light,
      // Restore the animated native loading screen before opening the WebView.
      home: SplashScreen(prefs: prefs),
    );
  }
}
