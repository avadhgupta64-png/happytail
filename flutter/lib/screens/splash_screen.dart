import 'package:flutter/material.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  static const _navy = Color(0xFF081426);
  static const _pink = Color(0xFFFF5C8A);
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1100),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _navy,
      body: Stack(
        fit: StackFit.expand,
        children: [
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: Alignment(0, -0.2),
                radius: 1.15,
                colors: [Color(0xFF1B3653), _navy, Color(0xFF050B15)],
                stops: [0, 0.58, 1],
              ),
            ),
          ),
          Positioned(
            top: -100,
            right: -90,
            child: _glow(250, _pink.withValues(alpha: 0.16)),
          ),
          Positioned(
            bottom: -140,
            left: -110,
            child: _glow(300, const Color(0xFFFFD6A5).withValues(alpha: 0.10)),
          ),
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                AnimatedBuilder(
                  animation: _controller,
                  builder: (context, child) => Transform.scale(
                    scale: 1 + (_controller.value * 0.035),
                    child: Container(
                      width: 142,
                      height: 142,
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: _pink.withValues(
                            alpha: 0.45 + _controller.value * 0.3,
                          ),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: _pink.withValues(alpha: 0.16),
                            blurRadius: 34 + _controller.value * 12,
                          ),
                        ],
                      ),
                      child: ClipOval(
                        child: Image.asset(
                          'assets/logo.png',
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stack) =>
                              const ColoredBox(
                            color: _pink,
                            child: Icon(Icons.pets, color: Colors.white, size: 70),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                const Text(
                  'HAPPY TAIL',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 29,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 4,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'A happier world for dogs',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.74),
                    fontSize: 14,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 42),
                SizedBox(
                  width: 92,
                  child: AnimatedBuilder(
                    animation: _controller,
                    builder: (context, child) => ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: 0.25 + _controller.value * 0.7,
                        minHeight: 3,
                        backgroundColor: Colors.white.withValues(alpha: 0.13),
                        valueColor: const AlwaysStoppedAnimation(_pink),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 38,
            child: Text(
              'MADE WITH LOVE FOR EVERY PAW',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.42),
                fontSize: 9,
                letterSpacing: 2,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _glow(double size, Color color) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [color, color.withValues(alpha: 0)],
          ),
        ),
      );
}
