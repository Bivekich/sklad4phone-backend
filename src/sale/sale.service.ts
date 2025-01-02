import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Sale } from './sale.entity';
import { UserSales } from './user-sales.entity';
import { User } from '../user/user.entity'; // Import the User entity
import { LogService } from '../log/log.service'; // Import the LogService
import axios from 'axios';

interface SaleWithQuantity extends Sale {
  quantity?: number;
  createdAt?: Date;
}
interface UserWithQuantity extends User {
  quantity?: number;
}

interface OrderBookEntry {
  price: number;
  amount: number;
  volume: number;
}

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(UserSales)
    private userSalesRepository: Repository<UserSales>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private configService: ConfigService,
    private logService: LogService,
    // private logService: LogService,
  ) {}

  async createSale(
    name: string,
    description: string,
    images: string[], // Array of image URLs
    video: string | null, // Single video URL or null if no video
    collected_now: number,
    collected_need: number,
    price: number,
  ): Promise<Sale> {
    const sale = this.saleRepository.create({
      name,
      description,
      images,
      video,
      collected_now,
      collected_need,
      price,
    });
    return await this.saleRepository.save(sale);
  }

  async getAllSales(): Promise<Sale[]> {
    try {
      const sales = await this.saleRepository.find({
        where: { cancel: false, deleted: false },
      });

      // Modify the images URLs if they exist
      for (const sale of sales) {
        if (sale.images.length > 0) {
          sale.images = sale.images.map(
            (image) =>
              `${this.configService.get<string>('SERVER_URL')}${image}`,
          );
        }
        if (sale.video) {
          sale.video = `${this.configService.get<string>('SERVER_URL')}${sale.video}`;
        }
      }

      return sales;
    } catch (error) {
      console.error('Error retrieving sales:', error);
      throw new Error('Failed to retrieve sales. Please try again later.');
    }
  }

  async getSaleById(id: number): Promise<Sale> {
    const sale = await this.saleRepository.findOneBy({ id });
    if (!sale) {
      throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
    }

    // Update each image URL
    if (sale.images.length > 0) {
      sale.images = sale.images.map(
        (image) => `${this.configService.get<string>('SERVER_URL')}${image}`,
      );
      if (sale.video) {
        sale.video = `${this.configService.get<string>('SERVER_URL')}${sale.video}`;
      }
    }

    return sale;
  }

  async getSaleInHistoryById(
    id: number,
    phoneNumber: string,
  ): Promise<SaleWithQuantity> {
    // Fetch the sale by ID
    const sale = await this.saleRepository.findOneBy({ id });

    // Check if the sale exists
    if (!sale) {
      throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
    }

    // Process the sale data
    const processedSale: SaleWithQuantity = {
      ...sale,
      images: sale.images.map(
        (image) => `${this.configService.get<string>('SERVER_URL')}${image}`,
      ),
      video: sale.video
        ? `${this.configService.get<string>('SERVER_URL')}${sale.video}`
        : null,
      quantity: 0, // Default quantity
      createdAt: null, // Initialize createdAt
    };

    // Fetch all user sales associated with the sale
    const userSales = await this.userSalesRepository.find({
      where: { phoneNumber: phoneNumber },
    });

    // Aggregate quantities for the sale
    const totalQuantity = userSales.reduce(
      (acc, userSale) => userSale.quantity,
      0,
    );
    processedSale.quantity = totalQuantity;

    // Find the user sale with the latest timestamps
    if (userSales.length > 0) {
      // Find the user sale with the latest updatedAt
      const latestUserSale = userSales.reduce((latest, userSale) => {
        return userSale.updatedAt > latest.updatedAt ? userSale : latest;
      });

      // Set the timestamps from the latest user sale
      processedSale.createdAt = latestUserSale.createdAt; // If you also want updatedAt
    }

    console.log(processedSale);

    return processedSale;
  }
  async updateSale(id: number, updateData: Partial<Sale>): Promise<Sale> {
    await this.saleRepository.update(id, updateData);
    return await this.getSaleById(id);
  }

  async cancelSale(id: number): Promise<Sale> {
    const userSales = await this.userSalesRepository.find({
      where: { sale_id: id },
    });

    // if (userSales.length === 0) {
    //   throw new Error('Sale not found or already deleted for all users.');
    // }

    // Step 2: Retrieve the sale to get the price for refund calculation
    const sale = await this.saleRepository.findOne({ where: { id } });

    if (!sale) {
      throw new Error('Sale record not found.');
    }

    // Step 3: Process refunds for each user
    for (const userSale of userSales) {
      const refundAmount = sale.price * userSale.quantity * 0.1; // Calculate total refund for each user

      // Step 4:  Update each user's balance by adding the refund amount
      await this.userRepository.increment(
        { phone_number: userSale.phoneNumber },
        'balance',
        refundAmount,
      );
    }

    await this.saleRepository.update(id, { cancel: true });
    return await this.getSaleById(id);
  }

  async deleteSale(id: number): Promise<void> {
    // Step 1: Retrieve all user sales records associated with the given sale ID
    // const userSales = await this.userSalesRepository.find({
    //   where: { sale_id: id },
    // });
    //
    // Step 2: Retrieve the sale to get the price for refund calculation
    const sale = await this.saleRepository.findOne({ where: { id } });

    if (!sale) {
      throw new Error('Sale record not found.');
    }

    // Step 3: Process refunds for each user
    // for (const userSale of userSales) {
    //   const refundAmount = sale.price * userSale.quantity * 0.1; // Calculate total refund for each user

    //   // Step 4: Update each user's balance by adding the refund amount
    //   await this.userRepository.increment(
    //     { phone_number: userSale.phoneNumber },
    //     'balance',
    //     refundAmount,
    //   );
    // }

    // Step 5: Delete all sale records from UserSales and Sale
    // await this.userSalesRepository.delete({ sale_id: id });
    // await this.saleRepository.delete(id);
    // Mark the sale as deleted
    sale.deleted = true; // Assuming 'deleted' is a boolean field

    // Save the updated sale back to the database
    await this.saleRepository.save(sale);
  }

  async buyForSale(
    id: number,
    quantity: number,
    phoneNumber?: string, // Mark as optional
  ): Promise<Sale> {
    const sale = await this.saleRepository.findOne({ where: { id } });
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    // Ensure that phoneNumber is provided
    if (!phoneNumber) {
      throw new HttpException(
        'Phone number is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if phoneNumber is a string
    //
    if (typeof phoneNumber !== 'string') {
      throw new HttpException(
        'Invalid phone number format',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Remove "+" if present at the start of the phone number
    const sanitizedPhoneNumber = phoneNumber.startsWith('+')
      ? phoneNumber.slice(1)
      : phoneNumber;

    // Find the user by sanitized phone number
    const user = await this.userRepository.findOne({
      where: { phone_number: sanitizedPhoneNumber },
    });

    if (!user) {
      throw new NotFoundException(
        `User with phone number ${sanitizedPhoneNumber} not found`,
      );
    }

    // Check if user has enough balance
    const totalCost = sale.price * quantity * 0.1;
    if (user.balance < totalCost) {
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
    }

    // Deduct the amount from user's balance
    user.balance -= totalCost;
    await this.userRepository.save(user);

    // Update the collected_now amount on the sale
    sale.collected_now += quantity;
    if (sale.collected_now > sale.collected_need) {
      sale.collected_now = sale.collected_need;
    }
    await this.saleRepository.save(sale);

    // Record the user purchase in UserSales
    const userSale = this.userSalesRepository.create({
      sale_id: sale.id,
      phoneNumber: sanitizedPhoneNumber,
      quantity,
    });
    await this.userSalesRepository.save(userSale);

    await this.logService.createLog(
      user.id,
      `Изменен баланс с $${user.balance + totalCost} на $${user.balance} по причине предоплаты сбора`,
    );

    return sale;
  }

  async getUserOrders(phoneNumber: string): Promise<SaleWithQuantity[]> {
    const sanitizedPhoneNumber = phoneNumber.startsWith('+')
      ? phoneNumber.slice(1)
      : phoneNumber;

    // Получаем все записи user_sales для данного номера телефона
    const userSales = await this.userSalesRepository.find({
      where: { phoneNumber: sanitizedPhoneNumber },
    });

    // Извлекаем идентификаторы продаж из user_sales
    const saleIds = userSales.map((userSale) => userSale.sale_id);

    // Получаем все продажи по идентификаторам
    const sales = await this.saleRepository.find({
      where: { id: In(saleIds) },
    });

    // Создаем карту для агрегирования количеств для каждой продажи
    const quantityMap: { [key: number]: number } = {};
    userSales.forEach((userSale) => {
      if (quantityMap[userSale.sale_id]) {
        quantityMap[userSale.sale_id] += userSale.quantity;
      } else {
        quantityMap[userSale.sale_id] = userSale.quantity;
      }
    });

    // Обрабатываем продажи и добавляем количество
    const processedSales: SaleWithQuantity[] = sales.map((sale) => {
      const saleWithQuantity: SaleWithQuantity = { ...sale };

      if (saleWithQuantity.images.length > 0) {
        saleWithQuantity.images = saleWithQuantity.images.map(
          (image) => `${this.configService.get<string>('SERVER_URL')}${image}`,
        );
      }

      // Получаем количество из quantityMap
      saleWithQuantity.quantity = quantityMap[saleWithQuantity.id] || 0;

      return saleWithQuantity;
    });

    return processedSales;
  }
  async getOrderUsers(sale_id: number): Promise<UserWithQuantity[]> {
    // Fetch the sale to ensure it exists
    const sale = await this.saleRepository.findOne({
      where: { id: sale_id },
    });

    if (!sale) {
      throw new Error('Sale not found');
    }

    // Fetch user_sale entries for the given sale_id
    const userSales = await this.userSalesRepository.find({
      where: { sale_id: sale_id },
    });

    if (userSales.length === 0) {
      return [];
    }

    // Extract phone numbers from user_sales
    const userPhoneNumbers = userSales.map((userSale) => userSale.phoneNumber);

    // Fetch users whose phone numbers match the user_sales
    const users = await this.userRepository.find({
      where: { phone_number: In(userPhoneNumbers) },
    });

    // Create a map to aggregate quantities for each user
    const quantityMap: { [key: string]: number } = {};
    userSales.forEach((userSale) => {
      if (quantityMap[userSale.phoneNumber]) {
        quantityMap[userSale.phoneNumber] += userSale.quantity;
      } else {
        quantityMap[userSale.phoneNumber] = userSale.quantity;
      }
    });

    // Map users to UserWithQuantity
    const processedUsers: UserWithQuantity[] = users.map((user) => {
      const userWithQuantity: UserWithQuantity = { ...user };
      userWithQuantity.quantity = quantityMap[user.phone_number] || 0;
      return userWithQuantity;
    });

    return processedUsers;
  }

  async getCource(): Promise<OrderBookEntry | null> {
    try {
      const response = await axios.get(
        'https://abcex.io/api/v1/exchange/public/market-data/order-book/depth?marketId=USDTRUB&lang=ru',
      );

      console.log('Response from API:', response.data); // Логируем данные ответа

      const data = response.data; // Получаем данные из ответа

      if (data && data.ask && data.ask.length > 0) {
        const firstBid = data.ask[0];
        const price = firstBid.price;
        const amount = firstBid.qty;
        const volume = (price * amount).toFixed(2);

        // Создаем объект с данными
        const orderBookEntry: OrderBookEntry = {
          price: parseFloat(price), // Используем parseFloat, если price - это строка
          amount: parseFloat(amount), // Используем parseFloat, если amount - это строка
          volume: parseFloat(volume), // volume уже число, но можно оставить parseFloat для уверенности
        };

        return orderBookEntry;
      } else {
        console.log('Не удалось получить данные ордеров или данные пусты');
        return null;
      }
    } catch (error) {
      console.error('Произошла ошибка при получении данных:', error);
      return null;
    }
  }
}
