import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  HttpCode,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserSales } from './user-sales.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { SaleService } from './sale.service';
import { Sale } from './sale.entity';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Controller('sales')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post('create')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads', // Folder where images will be saved
        filename: (req, file, cb) => {
          // Use a unique filename
          const filename: string = uuidv4() + path.extname(file.originalname);
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accept only image files
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async createSale(
    @UploadedFile() image: Express.Multer.File,
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('collected_now') collected_now: number,
    @Body('collected_need') collected_need: number,
    @Body('price') price: number,
  ): Promise<Sale> {
    const imageUrl = `/uploads/${image.filename}`; // Relative path for saving to DB
    return this.saleService.createSale(
      name,
      description,
      imageUrl,
      collected_now,
      collected_need,
      price,
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

  @Post(':id/buy')
  async buyForSale(
    @Param('id') id: number,
    @Body('quantity') quantity: number,
    @Body('phoneNumber') phoneNumber: string,
  ): Promise<Sale> {
    return await this.saleService.buyForSale(id, quantity, phoneNumber);
  }

  @Get('userorders/:phoneNumber')
  async getUserOrders(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<Sale[]> {
    return await this.saleService.getUserOrders(phoneNumber);
  }
}
