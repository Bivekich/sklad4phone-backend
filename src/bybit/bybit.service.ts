// src/transaction/transaction.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BybitTransaction } from './bybit.entity';
import * as Bybit from 'bybit-api';
import { Sale } from '../sale/sale.entity';
import { User } from '../user/user.entity';
import { LogService } from '../log/log.service'; // Import the LogService

@Injectable()
export class BybitService {
  private readonly bybitClient: Bybit.RestClientV5;

  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(BybitTransaction)
    private readonly transactionRepository: Repository<BybitTransaction>,
    private logService: LogService,
  ) {
    this.bybitClient = new Bybit.RestClientV5({
      key: process.env.BYBIT_API_KEY,
      secret: process.env.BYBIT_API_SECRET,
    });
  }

  // Retrieve the user's wallet balance
  async getWalletBalance() {
    try {
      const result = await this.bybitClient.getWalletBalance({
        accountType: 'UNIFIED',
        coin: 'USDT',
      });

      const usdtBalance = result?.result?.list?.[0]?.coin?.find(
        (c) => c.coin === 'USDT',
      );

      if (usdtBalance && usdtBalance.walletBalance !== undefined) {
        return Number(usdtBalance.walletBalance); // Ensure the balance is returned as a number
      }

      return 0; // Default to 0 if no balance is found
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw new InternalServerErrorException('Failed to fetch wallet balance');
    }
  }

  // Create a transaction and update balance
  async createTransaction(
    phoneNumber: string,
    additionalAmount: number,
    saleId: number | null = null,
  ) {
    try {
      const currentBalance = await this.getWalletBalance();
      const newBalance = parseFloat(
        (Number(currentBalance) + Number(additionalAmount)).toFixed(8),
      );
      const transaction = this.transactionRepository.create({
        phoneNumber,
        amount: additionalAmount,
        balanceAfterTransaction: newBalance,
        saleId: saleId ?? null, // Associate the saleId with the transaction
      });

      await this.transactionRepository.save(transaction);
      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new InternalServerErrorException('Failed to create transaction');
    }
  }

  // Verify the updated balance
  async verifyTransaction(phoneNumber: string, saleId: number | null = null) {
    const lastTransaction = await this.transactionRepository.findOne({
      where: { phoneNumber, saleId },
    });

    if (!lastTransaction) {
      return { verified: false };
    }

    const currentBalance = await this.getWalletBalance();

    if (currentBalance !== lastTransaction.balanceAfterTransaction) {
      return { verified: false };
    }

    const transaction = await this.transactionRepository.findOne({
      where: { phoneNumber, saleId },
    });

    if (saleId) {
      const saleId = transaction.saleId;

      // Find the corresponding sale by saleId
      const sale = await this.saleRepository.findOne({
        where: { id: saleId },
      });

      if (!sale) {
        return { verified: false };
      }

      // Ensure price is valid to avoid division by zero
      if (sale.price <= 0) {
        return { verified: false };
      }

      // Calculate the contribution quantity to add to collected_now
      const contributionQuantity = transaction.amount / sale.price;

      // Update the collected_now field in the Sale entity
      await this.saleRepository.update(sale.id, {
        collected_now: sale.collected_now + contributionQuantity,
      });

      // Update the transaction's paid status
      const id = transaction.id;
      await this.transactionRepository.update(id, { paid: true });
    } else {
      const user = await this.userRepository.findOne({
        where: { phone_number: phoneNumber },
      });

      await this.logService.createLog(
        user.id,
        `Пополнил баланс через USDT(bybit) на $${Number(user.balance) + Number(transaction.amount)}`,
      );

      await this.userRepository.update(user.id, {
        balance: Number(user.balance) + Number(transaction.amount),
      });
    }

    return { verified: true, balance: currentBalance };
  }
}
