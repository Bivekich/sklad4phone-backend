// src/transaction/transaction.controller.ts
import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { BybitService } from './bybit.service';

@Controller('bybit')
export class BybitController {
  constructor(private readonly transactionService: BybitService) {}

  @Post(':phoneNumber/create')
  async createTransaction(
    @Param('phoneNumber') phoneNumber: string,
    @Body('additionalAmount') additionalAmount: number,
    @Body('saleId') saleId: number, // saleId is expected in the request body
  ) {
    return this.transactionService.createTransaction(
      phoneNumber,
      additionalAmount,
      saleId, // Pass saleId to service
    );
  }

  @Get(':phoneNumber/verify')
  async verifyTransaction(
    @Param('phoneNumber') phoneNumber: string,
    @Body('saleId') saleId: number, // saleId is expected in the request body
  ) {
    return this.transactionService.verifyTransaction(phoneNumber, saleId); // Pass saleId to service
  }
}
