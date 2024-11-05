// notification.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  async sendNotification(
    @Body('phoneNumber') phoneNumber: string,
    @Body('message') message: string,
  ): Promise<void> {
    await this.notificationService.notifyUserByPhone(phoneNumber, message);
  }
}
