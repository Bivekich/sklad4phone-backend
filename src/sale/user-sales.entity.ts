import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sale } from './sale.entity';

@Entity()
export class UserSales {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phoneNumber: string;

  @Column()
  quantity: number;

  @Column()
  sale_id: number;
}
