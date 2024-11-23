import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './sale.entity';
import { UserSales } from './user-sales.entity';
import { User } from '../user/user.entity'; // Import the User entity
import { SaleService } from './sale.service';
import { LogModule } from '../log/log.module'; // Import the LogModule
import { SaleController } from './sale.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, UserSales, User]), // Register entities here
    LogModule, // Import LogModule to use LogService
  ],
  providers: [SaleService],
  controllers: [SaleController],
  exports: [SaleService, TypeOrmModule], // Export SaleService if needed in other modules
})
export class SaleModule {}
