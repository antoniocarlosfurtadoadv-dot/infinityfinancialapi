import { Controller, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import type { UserPayload } from 'src/shared/interfaces';
import { CurrentUser } from 'src/shared/decorators';

import { NotificationMarkAsReadService } from './notification-mark-as-read.service';
import { ApiResponseService } from 'src/shared/services';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications/:id/read')
export class NotificationMarkAsReadController {
  constructor(
    private readonly notificationMarkAsReadService: NotificationMarkAsReadService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Patch()
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const data = await this.notificationMarkAsReadService.markAsRead(
      id,
      user.id,
    );

    return this.responseService.success({
      message: 'Notification marked as read successfully',
      data,
    });
  }
}
