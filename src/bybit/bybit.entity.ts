// src/transaction/transaction.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class BybitTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phoneNumber: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  balanceAfterTransaction: number;

  @Column({ nullable: true })
  saleId: number; // Nullable, in case there's no sale associated with a transaction

  @Column({ default: false })
  paid: boolean; // Indicates whether the transaction has been marked as paid

  @CreateDateColumn()
  createdAt: Date;
}
