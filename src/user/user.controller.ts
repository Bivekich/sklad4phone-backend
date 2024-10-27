import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(
    @Body('phoneNumber') phoneNumber: string,
    @Body('firstName') firstName: string,
  ) {
    if (!phoneNumber || !firstName) {
      throw new HttpException(
        'Phone number and first name are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const user = await this.userService.createUser(phoneNumber, firstName);
      return user;
    } catch (error) {
      throw new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
