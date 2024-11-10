import { Injectable } from '@nestjs/common';
import { BotService } from '../bot/bot.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  constructor(
    private readonly botService: BotService,
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}

  async sendNotificationToAll(
    message: string,
    photoUrl?: string,
  ): Promise<void> {
    const users = await this.userService.getAllUsers();

    for (const user of users) {
      const chatId = user.chat_id;

      try {
        if (photoUrl) {
          console.log(`Sending photo with caption to chatId ${chatId}`);
          await this.botService.sendPhotoWithText(
            chatId,
            `${this.configService.get<string>('SERVER_URL')}${photoUrl}`,
            message,
          );
        } else {
          console.log(`Sending text message only to chatId ${chatId}`);
          await this.botService.sendNotification(chatId, message);
        }
      } catch (error) {
        if (
          error.code === 'ETELEGRAM' &&
          error.response.body.error_code === 400
        ) {
          console.warn(`Skipping invalid or inaccessible chatId ${chatId}`);
        } else {
          console.error(
            `Error sending notification to chatId ${chatId}:`,
            error,
          );
        }
      }
    }
  }
}
