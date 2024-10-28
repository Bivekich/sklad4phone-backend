import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { SaleService } from './sale.service';
import { Sale } from './sale.entity';

@Controller('sales')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  async createSale(@Body() saleData: Partial<Sale>): Promise<Sale> {
    return await this.saleService.createSale(
      saleData.name,
      saleData.description,
      saleData.image,
      saleData.collected_now,
      saleData.collected_need,
      saleData.price,
    );
  }

  @Get()
  async getAllSales(): Promise<Sale[]> {
    return await this.saleService.getAllSales();
  }

  @Get(':id')
  async getSaleById(@Param('id') id: number): Promise<Sale> {
    return await this.saleService.getSaleById(id);
  }

  @Put(':id')
  async updateSale(
    @Param('id') id: number,
    @Body() updateData: Partial<Sale>,
  ): Promise<Sale> {
    return await this.saleService.updateSale(id, updateData);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteSale(@Param('id') id: number): Promise<void> {
    return await this.saleService.deleteSale(id);
  }
}
