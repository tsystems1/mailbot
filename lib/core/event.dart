import 'package:mailbot/core/app.dart';
import 'package:nyxx/nyxx.dart';

abstract class EventListener<T extends DispatchEvent> {
    final App app;

    EventListener(this.app);
    void handle(T event) {}
    Stream<T>? get stream => null;
    void register(NyxxGateway client) {}
}