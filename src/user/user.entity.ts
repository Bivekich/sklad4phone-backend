import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  phone_number: string;

  @Column({ default: 0 }) // Default value for balance
  balance: number;

  @Column({ default: 10 }) // Default value for balance
  raiting: number;

  @Column({ default: false }) // Default value for admin
  admin: boolean;
}
