import 'package:mailbot/core/event.dart';
import 'package:nyxx/nyxx.dart';

class ReadyEventListener extends EventListener<ReadyEvent> {
    ReadyEventListener(super.app);

    @override
    Stream<ReadyEvent>? get stream => app.client.onReady;

    @override
    void handle(ReadyEvent event) {
        app.logger.info('The bot has logged in!');
    }
}