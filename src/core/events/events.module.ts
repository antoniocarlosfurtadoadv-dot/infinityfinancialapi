import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { QueueModule } from '../queue/queue.module';

import { AuthListener } from './listeners/auth.listener';
import { UserListener } from './listeners/user.listener';
import { RoleProfileListener } from './listeners/role-profile.listener';
import { EventDispatcherService } from './services/event-dispatcher.service';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    QueueModule,
  ],
  providers: [AuthListener, UserListener, RoleProfileListener, EventDispatcherService],
  exports: [EventDispatcherService],
})
export class EventsModule {}
