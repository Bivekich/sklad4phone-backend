import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './sale.entity'; // Adjust the path as necessary
import { SaleController } from './sale.controller'; // Ensure this is imported
import { SaleService } from './sale.service'; // Ensure this is imported

@Module({
  imports: [TypeOrmModule.forFeature([Sale])], // Register User entity
  controllers: [SaleController], // Ensure the UserController is registered here
  providers: [SaleService],
  exports: [SaleService], // Export UserService if needed in other modules
})
export class SaleModule {}
