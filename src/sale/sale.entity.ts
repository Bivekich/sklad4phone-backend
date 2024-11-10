import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserSales } from './user-sales.entity';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('text', { array: true }) // Handles an array of image URLs or paths
  images: string[];

  @Column()
  collected_now: number;

  @Column()
  collected_need: number;

  @Column()
  price: number;

  @Column({ nullable: true }) // Nullable if video is optional
  video: string; // Stores the video URL or path
}
