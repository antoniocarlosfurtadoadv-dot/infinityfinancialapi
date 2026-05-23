import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { QueueService } from '../../queue/services/queue.service';
import { EVENT_NAMES } from '../constants/event-names.constant';
import { RoleProfileCreatedEvent } from '../events/role-profile-created.event';
import { RoleProfileUpdatedEvent } from '../events/role-profile-updated.event';

@Injectable()
export class RoleProfileListener {
  private readonly logger = new Logger(RoleProfileListener.name);

  constructor(private readonly queueService: QueueService) {}

  @OnEvent(EVENT_NAMES.ROLE_PROFILE_CREATED)
  async handleRoleProfileCreated(payload: RoleProfileCreatedEvent) {
    this.logger.log(`Role profile created: ${payload.name} (${payload.roleProfileId})`);

    await this.queueService.addLogJob({
      action: 'ROLE_PROFILE_CREATED',
      entity: 'RoleProfile',
      entityId: payload.roleProfileId,
      userId: payload.userId,
      tenantId: payload.tenantId,
      metadata: {
        name: payload.name,
        ...payload.metadata,
      },
    });
  }

  @OnEvent(EVENT_NAMES.ROLE_PROFILE_UPDATED)
  async handleRoleProfileUpdated(payload: RoleProfileUpdatedEvent) {
    this.logger.log(`Role profile updated: ${payload.name} (${payload.roleProfileId})`);

    await this.queueService.addLogJob({
      action: 'ROLE_PROFILE_UPDATED',
      entity: 'RoleProfile',
      entityId: payload.roleProfileId,
      userId: payload.userId,
      tenantId: payload.tenantId,
      metadata: {
        name: payload.name,
        changes: payload.metadata,
      },
    });
  }
}
