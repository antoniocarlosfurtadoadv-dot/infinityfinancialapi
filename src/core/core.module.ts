import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { QueueModule } from './queue/queue.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    DatabaseModule,
    QueueModule,
    EventsModule,
    IntegrationsModule,
    WebsocketModule,
  ],
})
export class CoreModule {}
