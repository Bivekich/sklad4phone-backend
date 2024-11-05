// transaction.controller.ts
import { Controller, Get, Post, Param, Body, Patch } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Transaction } from './transaction.entity';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(
    @Body('phoneNumber') phoneNumber: string,
    @Body('amount') amount: number,
    @Body('saleId') saleId: number,
  ): Promise<Transaction> {
    return await this.transactionService.createTransaction(
      phoneNumber,
      amount,
      saleId,
    );
  }

  @Get()
  async findAll(): Promise<Transaction[]> {
    return await this.transactionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Transaction> {
    return await this.transactionService.findOne(id);
  }

  @Patch(':id/setpaidstatus')
  async updateStatus(
    @Param('id') id: number,
    @Body('paid') paid: boolean,
  ): Promise<void> {
    return await this.transactionService.updateStatus(id, paid);
  }
}
