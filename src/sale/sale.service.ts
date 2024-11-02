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
  ) {}

  async createSale(
    name: string,
    description: string,
    image: string, // URL/path to the uploaded image
    collected_now: number,
    collected_need: number,
    price: number,
  ): Promise<Sale> {
    const sale = this.saleRepository.create({
      name,
      description,
      image, // Store image URL in the database
      collected_now,
      collected_need,
      price,
    });
    return await this.saleRepository.save(sale);
  }

  async getAllSales(): Promise<Sale[]> {
    try {
      const sales = await this.saleRepository.find();

      // Modify the image URLs if they exist
      for (const sale of sales) {
        if (sale.image) {
          sale.image = `eqeqew/${sale.image}`;
          // sale.image = `${this.configService.get<string>('SERVER_URL')}/${sale.image}`;
        }
      }

      return sales;
    } catch (error) {
      // Log the error and throw a new error to be handled elsewhere
      console.error('Ошибка при получении всех сборов:', error);
      throw new Error(
        'Не удалось получить сборы. Пожалуйста, попробуйте позже.',
      );
    }
  }

  async getSaleById(id: number): Promise<Sale> {
    const sale = await this.saleRepository.findOneBy({ id });
    if (!sale) {
      throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
    }
    if (sale.image) {
      sale.image = `${this.configService.get<string>('SERVER_URL')}/${sale.image}`;
    }
    return sale;
  }

  async updateSale(id: number, updateData: Partial<Sale>): Promise<Sale> {
    await this.saleRepository.update(id, updateData);
    return await this.getSaleById(id);
  }

  async deleteSale(id: number): Promise<void> {
    // Step 1: Retrieve the sale record from UserSales to get the userId
    const userSale = await this.userSalesRepository.findOne({
      where: { sale_id: id },
    });

    if (!userSale) {
      throw new Error('Sale not found or already deleted.');
    }

    const phoneNumber = userSale.phoneNumber;

    // Step 2: Retrieve the sale to get the price for refund calculation
    const sale = await this.saleRepository.findOne({ where: { id } });

    if (!sale) {
      throw new Error('Sale record not found.');
    }

    const refundAmount = sale.price * userSale.quantity; // Calculate total refund

    // Step 3: Update user's balance by adding the refund amount
    await this.userRepository.increment(
      { phone_number: phoneNumber },
      'balance',
      refundAmount,
    );

    // Step 4: Delete the sale record from UserSales and Sale
    await this.userSalesRepository.delete({ sale_id: id });
    await this.saleRepository.delete(id);
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
    const totalCost = sale.price * quantity;
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

    return sale;
  }

  async getUserOrders(phoneNumber: string): Promise<Sale[]> {
    if (typeof phoneNumber !== 'string') {
      throw new HttpException(
        'Invalid phone number format',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sanitizedPhoneNumber = phoneNumber.startsWith('+')
      ? phoneNumber.slice(1)
      : phoneNumber;
    console.log('Sanitized Phone Number:', sanitizedPhoneNumber);

    const userSales = await this.userSalesRepository.find({
      where: { phoneNumber: sanitizedPhoneNumber },
    });

    const saleIds = userSales.map((userSale) => userSale.sale_id);
    if (saleIds.length === 0) return [];

    const sales = await this.saleRepository.find({
      where: { id: In(saleIds) },
    });

    // Modify the image URLs if they exist
    for (const sale of sales) {
      if (sale.image) {
        sale.image = `${this.configService.get<string>('SERVER_URL')}/${sale.image}`;
      }
    }

    return sales;
  }
}
