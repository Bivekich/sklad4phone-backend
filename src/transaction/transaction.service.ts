// transaction.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { User } from '../user/user.entity';
import { Sale } from '../sale/sale.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async createTransaction(
    phoneNumber: string,
    amount: number,
    saleId: number,
  ): Promise<Transaction> {
    const sanitizedPhoneNumber = phoneNumber.startsWith('+')
      ? phoneNumber.slice(1)
      : phoneNumber;
    // Step 1: Find the user by phone number
    const user = await this.userRepository.findOne({
      where: { phone_number: sanitizedPhoneNumber },
    });

    if (!user) {
      throw new NotFoundException(
        `User with phone number ${phoneNumber} not found`,
      );
    }

    // Step 2: Use user.id to create the transaction
    const transaction = this.transactionRepository.create({
      userId: user.id,
      amount,
      saleId,
    });

    // Step 3: Save and return the transaction
    return await this.transactionRepository.save(transaction);
  }

  async findAll(): Promise<Transaction[]> {
    return await this.transactionRepository.find({ where: { paid: false } });
  }

  async findOne(id: number): Promise<Transaction> {
    return await this.transactionRepository.findOne({ where: { id } });
  }

  async updateStatus(id: number, paid: boolean): Promise<void> {
    // Find the transaction
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });

    if (!transaction || !transaction.saleId) {
      throw new Error('Transaction or related sale not found');
    }

    const saleId = transaction.saleId;

    // Find the corresponding sale
    const sale = await this.saleRepository.findOne({
      where: { id: saleId },
    });

    if (!sale) {
      throw new Error('Sale not found');
    }

    // Ensure price is valid to avoid division by zero
    if (sale.price <= 0) {
      throw new Error('Invalid sale price');
    }

    // Calculate the quantity to add to collected_now
    const contributionQuantity = transaction.amount / sale.price;

    // Update the collected_now field in the Sale entity
    await this.saleRepository.update(sale.id, {
      collected_now: sale.collected_now + contributionQuantity,
    });

    // Update the transaction's paid status
    await this.transactionRepository.update(id, { paid });
  }
}
