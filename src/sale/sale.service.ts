import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './sale.entity';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async createSale(
    name: string,
    description: string, // Use "description" here as well
    image: string,
    collected_now: number,
    collected_need: number,
    price: number,
  ): Promise<Sale> {
    const sale = this.saleRepository.create({
      name,
      description, // Updated to match the corrected entity
      image,
      collected_now,
      collected_need,
      price,
    });
    return await this.saleRepository.save(sale);
  }

  async getAllSales(): Promise<Sale[]> {
    return await this.saleRepository.find();
  }

  async getSaleById(id: number): Promise<Sale> {
    const sale = await this.saleRepository.findOneBy({ id });
    if (!sale) {
      throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
    }
    return sale;
  }

  async updateSale(id: number, updateData: Partial<Sale>): Promise<Sale> {
    await this.saleRepository.update(id, updateData);
    return await this.getSaleById(id);
  }

  async deleteSale(id: number): Promise<void> {
    await this.saleRepository.delete(id);
  }
}
