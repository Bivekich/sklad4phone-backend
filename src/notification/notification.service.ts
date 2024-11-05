// notification.service.ts
import { Injectable } from '@nestjs/common';
import { BotService } from '../bot/bot.service';
import { UserService } from '../user/user.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly botService: BotService,
    private readonly userService: UserService,
  ) {}

  async notifyUserByPhone(phoneNumber: string, message: string): Promise<void> {
    const chatId = await this.userService.findChatIdByPhoneNumber(phoneNumber);
    if (!chatId) {
      throw new Error('User not  found');
    }
    await this.botService.sendNotification(chatId, message);
  }
}
