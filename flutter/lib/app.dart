import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/splash_screen.dart';
import 'screens/webview_screen.dart';
class HappyTailApp extends StatefulWidget {
 final SharedPreferences prefs;
 const HappyTailApp({super.key,required this.prefs});
 @override State<HappyTailApp> createState()=>_HappyTailAppState();
}
class _HappyTailAppState extends State<HappyTailApp>{
 bool ready=false,minTime=false,show=true;
 @override void initState(){super.initState();Future.delayed(const Duration(milliseconds:1900),(){if(!mounted)return;minTime=true;hideIfReady();});}
 void pageReady(){ready=true;hideIfReady();}
 void hideIfReady(){if(ready&&minTime&&show&&mounted)setState(()=>show=false);}
 @override Widget build(BuildContext context)=>MaterialApp(title:'Happy Tail',debugShowCheckedModeBanner:false,
 theme:ThemeData(colorScheme:ColorScheme.fromSeed(seedColor:const Color(0xFFFF5C8A)),scaffoldBackgroundColor:Colors.white,useMaterial3:true),
 home:Stack(fit:StackFit.expand,children:[WebViewScreen(onPageReady:pageReady),if(show)AnimatedOpacity(opacity:show?1:0,duration:const Duration(milliseconds:650),child:const SplashScreen())]));
}