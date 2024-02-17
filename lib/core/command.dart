import 'package:mailbot/core/app.dart';
import 'package:nyxx/nyxx.dart';
import 'package:nyxx_extensions/nyxx_extensions.dart';

class CommandContext {
    final MessageCreateEvent? messageCreateEvent;
    final ApplicationCommandInteraction? applicationCommandInteraction;
    bool get isApplicationCommandInteraction => applicationCommandInteraction != null;
    bool get isMessage => messageCreateEvent != null;

    CommandContext({this.messageCreateEvent, this.applicationCommandInteraction});
}

abstract class Command {
    String get name;
    String get description;
    String get usage;
    bool get mailThreadOnly => false;
    CommandContext _context = CommandContext();
    CommandContext get context => _context;
    List<String> get aliases => [];
    final App app;

    Command(this.app);

    void handle(CommandContext context) {}
    void handleInteraction(ApplicationCommandInteraction applicationCommandInteraction) {}
    void handleMessage(MessageCreateEvent messageCreateEvent) {}

    void invoke({MessageCreateEvent? messageCreateEvent, ApplicationCommandInteraction? applicationCommandInteraction}) {
        _context = CommandContext(
            messageCreateEvent: messageCreateEvent,
            applicationCommandInteraction: applicationCommandInteraction
        );

        if (messageCreateEvent != null) {
            handleMessage(messageCreateEvent);
        }
        else if (applicationCommandInteraction != null) {
            handleInteraction(applicationCommandInteraction);
        }

        handle(_context);
    }

    Future<Message?> respond(MessageBuilder builder, {bool response = false}) async {
        if (_context.isMessage) {
            final message = await _context.messageCreateEvent?.message.sendReply(builder);

            if (response) {
                return message;
            }
        }
        else if (_context.isApplicationCommandInteraction) {
            await _context.applicationCommandInteraction?.respond(builder);
            
            if (response) {
                return _context.applicationCommandInteraction?.fetchOriginalResponse();
            }
        }

        return null;
    }
}