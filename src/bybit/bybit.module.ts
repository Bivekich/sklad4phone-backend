// src/transaction/transaction.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BybitTransaction } from './bybit.entity';
import { BybitService } from './bybit.service';
import { BybitController } from './bybit.controller';
import { SaleModule } from '../sale/sale.module';
import { UserModule } from '../user/user.module'; // Import UserModule

@Module({
  imports: [
    TypeOrmModule.forFeature([BybitTransaction]),
    UserModule,
    SaleModule,
  ],
  controllers: [BybitController],
  providers: [BybitService],
})
export class BybitModule {}
