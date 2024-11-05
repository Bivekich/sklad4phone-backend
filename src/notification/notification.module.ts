// notification.module.ts
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { BotModule } from '../bot/bot.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [BotModule, UserModule], // Make sure to import the necessary modules
  providers: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
