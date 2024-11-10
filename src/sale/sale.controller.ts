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
} from '@nestjs/common';
import { UserSales } from './user-sales.entity';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
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
    FilesInterceptor('images', 10, {
      // Allow up to 10 images
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename: string = uuidv4() + path.extname(file.originalname);
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: (req, file, cb) => {
          const filename: string = uuidv4() + path.extname(file.originalname);
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(mp4|avi|mkv|mov)$/)) {
          return cb(new Error('Only video files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async createSale(
    @UploadedFiles() images: Express.Multer.File[],
    @UploadedFile() video: Express.Multer.File,
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('collected_now') collected_now: number,
    @Body('collected_need') collected_need: number,
    @Body('price') price: number,
  ): Promise<Sale> {
    // Create image URLs
    const imageUrls = images.map((image) => `/uploads/${image.filename}`);

    // If a video is uploaded, create its URL
    const videoUrl = video ? `/uploads/videos/${video.filename}` : null;

    return this.saleService.createSale(
      name,
      description,
      imageUrls,
      videoUrl, // Pass the video URL to the service
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
