import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
