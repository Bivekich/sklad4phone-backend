import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Transaction } from '../transaction/transaction.entity'; // Adjust path as needed

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' }) // Default value for balance
  chat_id: number;

  @Column()
  first_name: string;

  @Column()
  phone_number: string;

  @Column({ nullable: true })
  username: string;

  @Column({ default: 0 }) // Default value for balance
  balance: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 1.0 })
  raiting: number;

  @Column({ default: false }) // Default value for admin
  admin: boolean;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];
}
