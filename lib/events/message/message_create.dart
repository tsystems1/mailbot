import 'package:mailbot/core/event.dart';
import 'package:nyxx/nyxx.dart';

const prefix = "=";

class MessageCreateEventListener extends EventListener<MessageCreateEvent> {
    MessageCreateEventListener(super.app);

    @override
    Stream<MessageCreateEvent>? get stream => app.client.onMessageCreate;

    @override
    void handle(MessageCreateEvent event) {
        final author = event.message.author;
        final content = event.message.content;

        if (author is! User || author.isBot || !content.startsWith(prefix)) {
            return;
        }

        final argv = content
            .substring(prefix.length)
            .trimLeft()
            .split(r'\s+');
        final commandName = argv.firstOrNull;
        final args = argv.skip(1);

        if (commandName == null) {
            return;
        }

        print(argv);

        final command = app.commands[commandName];

        if (command == null) {
            return;
        }

        command.invoke(messageCreateEvent: event);
    }
}