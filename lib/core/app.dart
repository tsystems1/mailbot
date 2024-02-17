import 'package:mailbot/commands/settings/test.dart';
import 'package:mailbot/core/command.dart';
import 'package:mailbot/core/event.dart';
import 'package:mailbot/events/message/message_create.dart';
import 'package:mailbot/events/ready.dart';
import 'package:nyxx/nyxx.dart';

class App {
    final NyxxGateway client;
    final User user;
    final Logger logger = Logger('system');
    final commands = <String, Command>{};

    App(this.client, this.user) {
        logger.level = Level.ALL;
    }

    static Future<App> create(String token) async {
        final client = await Nyxx.connectGateway(token, GatewayIntents.all);
        final user = await client.users.fetchCurrentUser();
        return App(client, user);
    }

    Future<void> boot() async {
        logger.info('Booting up...');
        registerEventListeners();
        registerCommands();
    }

    void registerEventListeners() {
        final listeners = eventListeners();

        for (final listener in listeners) {
            final stream = listener.stream;

            logger.info("Registering listener for ${listener.runtimeType}");

            if (stream != null) {
                stream.listen(listener.handle);
            }
            else {
                listener.register(client);
            }
        }
    }

    void registerCommands() {
        final commands = commandList();

        for (final command in commands) {
            logger.info("Registering command ${command.name}");
            this.commands[command.name] = command;

            for (final alias in command.aliases) {
                logger.info("Registering alias $alias for command ${command.name}");
                this.commands[alias] = command;
            }
        }
    }

    List<Command> commandList() {
        return [
            TestCommand(this)
        ];
    }

    List<EventListener> eventListeners() {
        return [
            ReadyEventListener(this),
            MessageCreateEventListener(this),
        ];
    }
}