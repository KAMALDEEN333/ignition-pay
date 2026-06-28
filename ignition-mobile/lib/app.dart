import 'package:flutter/material.dart';
import 'core/design_system/design_system.dart';
import 'features/home/pages/home_page.dart';

class IgnitionPayApp extends StatelessWidget {
  const IgnitionPayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ignition Pay',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.system,
      home: const HomePage(),
    );
  }
}
