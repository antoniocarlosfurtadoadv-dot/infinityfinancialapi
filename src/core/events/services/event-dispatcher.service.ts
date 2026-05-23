import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  UserCreatedEvent,
  VerificationCodeEmailEvent,
  PasswordChangedEvent,
  PasswordResetEvent,
  RoleProfileCreatedEvent,
  RoleProfileUpdatedEvent,
  FirstAccessResendEvent,
  NewDeviceAccessEvent,
  UserDeletedEvent,
  UserUpdatedEvent,
  InvoicePaidEvent,
  SubscriptionCreatedEvent,
  SubscriptionPlanChangedEvent,
  SubscriptionCanceledEvent,
} from '../events';

type DomainEvent =
  | UserCreatedEvent
  | VerificationCodeEmailEvent
  | PasswordChangedEvent
  | PasswordResetEvent
  | RoleProfileCreatedEvent
  | RoleProfileUpdatedEvent
  | FirstAccessResendEvent
  | NewDeviceAccessEvent
  | UserDeletedEvent
  | UserUpdatedEvent
  | InvoicePaidEvent
  | SubscriptionCreatedEvent
  | SubscriptionPlanChangedEvent
  | SubscriptionCanceledEvent;

@Injectable()
export class EventDispatcherService {
  private readonly logger = new Logger(EventDispatcherService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  dispatch(eventName: string, event: DomainEvent): void {
    this.logger.debug(`Dispatching event: ${eventName}`);
    this.eventEmitter.emit(eventName, event);
  }
}
