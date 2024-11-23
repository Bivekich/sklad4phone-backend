// src/transaction/transaction.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BybitTransaction } from './bybit.entity';
import { BybitService } from './bybit.service';
import { BybitController } from './bybit.controller';
import { SaleModule } from '../sale/sale.module';
import { UserModule } from '../user/user.module'; // Import UserModule
import { LogModule } from '../log/log.module'; // Import the LogModule

@Module({
  imports: [
    TypeOrmModule.forFeature([BybitTransaction]),
    UserModule,
    LogModule,
    SaleModule,
  ],
  controllers: [BybitController],
  providers: [BybitService],
})
export class BybitModule {}
