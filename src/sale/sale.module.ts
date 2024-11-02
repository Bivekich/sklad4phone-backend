import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './sale.entity';
import { UserSales } from './user-sales.entity';
import { User } from '../user/user.entity'; // Import the User entity
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, UserSales, User]), // Register both entities here
  ],
  providers: [SaleService],
  controllers: [SaleController],
})
export class SaleModule {}
