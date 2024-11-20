import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body('phone_number') phoneNumber: string,
    @Body('chatId') chatId: number,
    @Body('username') username: string,
    @Body('first_name') firstName: string,
  ): Promise<User> {
    return this.userService.createUser(
      phoneNumber,
      chatId,
      username,
      firstName,
    );
  }

  @Get('get')
  async getUser(@Query('phoneNumber') phoneNumber: string): Promise<User> {
    console.log('Received phone number:', phoneNumber); // Log the phone number received
    return this.userService.getUserByPhoneNumber(phoneNumber);
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers(); // Call the service method
  }

  @Patch('update')
  async updateUser(
    @Query('id') id: number, // Extract the ID from query parameters
    @Body() updateData: Partial<User>,
  ): Promise<User> {
    return this.userService.updateUserById(id, updateData);
  }
}
