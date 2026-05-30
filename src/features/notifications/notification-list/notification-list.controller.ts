import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { ApiResponseService } from 'src/shared/services';
import type { UserPayload } from 'src/shared/interfaces';
import { CurrentUser } from 'src/shared/decorators';

import { NotificationListDto } from './dto/notification-list-dto';
import { NotificationListService } from './notification-list.service';

@Controller('notifications')
@ApiTags('notifications')
@ApiBearerAuth()
export class NotificationListController {
  constructor(
    private readonly notificationListService: NotificationListService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for the current user' })
  async getMyNotifications(
    @CurrentUser() user: UserPayload,
    @Query() query: NotificationListDto,
  ) {
    const result = await this.notificationListService.getNotificationsForUser(
      user.id,
      query,
    );
    return this.responseService.pagination({
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      limit: result.limit,
      message: 'Notifications retrieved successfully',
    });
  }
}
