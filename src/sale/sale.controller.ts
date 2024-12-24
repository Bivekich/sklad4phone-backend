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
  UploadedFiles,
  UploadedFile,
  NotFoundException,
} from '@nestjs/common';
import { UserSales } from './user-sales.entity';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { SaleService } from './sale.service';
import { Sale } from './sale.entity';
import { UserService } from '../user/user.service'; // Import UserService
import { User } from '../user/user.entity'; // Import User entity
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

interface OrderBookEntry {
  price: number;
  amount: number;
  volume: number;
}

@Controller('sales')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post('create')
  @UseInterceptors(
    FilesInterceptor('files', 11, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename: string = uuidv4() + path.extname(file.originalname);
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB per file
        fieldSize: 500 * 1024 * 1024, // 500MB field size
      },
      fileFilter: (req, file, cb) => {
        if (file.size > 500 * 1024 * 1024) {
          cb(new Error('File is too large'), false);
        }
        cb(null, true);
      },
    }),
  )
  async createSale(
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    body: {
      name: string;
      description: string;
      collected_now: number;
      collected_need: number;
      price: number;
    },
  ) {
    if (!files) {
      console.error('No files uploaded');
      // Handle the case where no files are uploaded
      // throw new Error('No files uploaded');
      return;
    }
    console.log('Uploaded Files:', files);
    const images = files.filter((file) => file.mimetype.startsWith('image/'));
    const video = files.find((file) => file.mimetype.startsWith('video/'));

    // Prepare the file URLs
    const imageUrls = images.map((image) => `/uploads/${image.filename}`);
    const videoUrl = video ? `/uploads/${video.filename}` : null;

    // Proceed with the service call
    return this.saleService.createSale(
      body.name,
      body.description,
      imageUrls,
      videoUrl,
      body.collected_now,
      body.collected_need,
      body.price,
    );
  }

  @Get()
  async getAllSales(): Promise<Sale[]> {
    return await this.saleService.getAllSales();
  }

  @Get(':id')
  async getSaleById(@Param('id') id: string): Promise<Sale | OrderBookEntry> {
    const saleId = parseInt(id, 10);
    if (isNaN(saleId) && id === 'getCource') {
      return await this.saleService.getCource();
    } else if (isNaN(saleId)) {
      return;
    }
    return await this.saleService.getSaleById(saleId);
  }

  @Get(':id/history')
  async getSaleInHistoryById(@Param('id') id: number): Promise<Sale> {
    return await this.saleService.getSaleInHistoryById(id);
  }

  @Get('getCource')
  async getCource(): Promise<OrderBookEntry | null> {
    const orderBookEntry = await this.saleService.getCource();
    if (!orderBookEntry) {
      throw new NotFoundException('Не удалось получить данные курса');
    }
    return orderBookEntry;
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

  @Post(':id/cancel')
  @HttpCode(200)
  async cancelSale(@Param('id') id: number): Promise<Sale> {
    return await this.saleService.cancelSale(id);
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
  @Get('getOrderUsers/:sale_id')
  async getOrderUsers(@Param('sale_id') sale_id: number): Promise<User[]> {
    return await this.saleService.getOrderUsers(sale_id);
  }
}
