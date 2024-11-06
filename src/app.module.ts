import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { UserModule } from './user/user.module';
import { SaleModule } from './sale/sale.module';
import { SupportModule } from './support/support.module';
import { TransactionModule } from './transaction/transaction.module';
import { BybitModule } from './bybit/bybit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Be cautious with this in production
    }),
    UserModule,
    BotModule,
    SaleModule,
    SupportModule,
    TransactionModule,
    BybitModule,
  ],
})
export class AppModule {}
