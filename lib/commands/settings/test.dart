import 'package:mailbot/core/command.dart';
import 'package:nyxx/nyxx.dart';

class TestCommand extends Command {
    TestCommand(super.app);
    
    @override
    String get name => 'test';

    @override
    String get description => 'Runs all tests';

    @override
    String get usage => 'test';

    @override
    Future<void> handle(CommandContext context) async {
        respond(
            MessageBuilder(
                content: 'Test successful'
            )
        );
    }
}