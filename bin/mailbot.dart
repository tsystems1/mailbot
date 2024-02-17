import 'dart:io';

import 'package:mailbot/core/app.dart' as mailbot;
import 'package:dotenv/dotenv.dart';
import 'package:nyxx/nyxx.dart';
import 'package:logging/logging.dart' as logging;

void main() async {
    final env = DotEnv()..load();
    final token = env['TOKEN'];

    if (token == null) {
        stderr.writeln('fatal error: no token provided!');
        exit(1);
    }

    logging.hierarchicalLoggingEnabled = true;    
    Logger.root.level = Level.INFO;
    Logger.root.onRecord.listen((record) {
        print("[${record.time}] [${record.level.name}]   ${record.message}");
    });

    final app = await mailbot.App.create(token);
    await app.boot();
}
