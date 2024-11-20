import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(
    phoneNumber: string,
    chat_id: number,
    username: string,
    firstName: string,
  ): Promise<User> {
    try {
      // Sanitize the phone number
      const sanitizedPhoneNumber = phoneNumber.startsWith('+')
        ? phoneNumber.slice(1)
        : phoneNumber;

      // Check if the user already exists
      let user = await this.userRepository.findOne({
        where: { phone_number: sanitizedPhoneNumber }, // Updated to match the entity field
      });

      if (user) {
        console.log('User already registered.');
        return user; // Return the existing user
      }

      // Create a new user if not found
      user = this.userRepository.create({
        phone_number: sanitizedPhoneNumber, // Updated to match the entity field
        first_name: firstName, // Updated to match the entity field
        username,
        chat_id,
      });

      return await this.userRepository.save(user); // Save the new user
    } catch (error) {
      console.error('Error creating user:', error);
      throw new HttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User> {
    try {
      // Sanitize the phone number
      //
      console.log(phoneNumber);
      const sanitizedPhoneNumber = phoneNumber.startsWith('+')
        ? phoneNumber.slice(1)
        : phoneNumber;

      const user = await this.userRepository.findOne({
        where: { phone_number: sanitizedPhoneNumber }, // Updated to match the entity field
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (error) {
      console.error('Error retrieving user:', error);
      throw new HttpException(
        'Failed to retrieve user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find(); // Fetch all users
    } catch (error) {
      console.error('Error retrieving users:', error);
      throw new HttpException(
        'Failed to retrieve users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateUserById(id: number, updateData: Partial<User>): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Update user properties based on the provided data
      Object.assign(user, updateData);

      return await this.userRepository.save(user);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findChatIdByPhoneNumber(phoneNumber: string): Promise<number | null> {
    const user = await this.userRepository.findOne({
      where: { phone_number: phoneNumber },
    });
    return user ? user.chat_id : null; // Assume chatId is a property on the User entity
  }
}
