import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Access ConfigService globally
    }),
    BotModule,
    UserModule,
  ],
})
export class AppModule {}
