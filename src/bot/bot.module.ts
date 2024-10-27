import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, ConfigModule],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
