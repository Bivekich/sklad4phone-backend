import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserSales } from './user-sales.entity';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string; // Corrected this to "description"

  @Column()
  image: string;

  @Column()
  collected_now: number;

  @Column()
  collected_need: number;

  @Column()
  price: number;
}
