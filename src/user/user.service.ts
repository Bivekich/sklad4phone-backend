import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class UserService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async createUser(phoneNumber: string, firstName: string) {
    const client = await this.pool.connect();
    try {
      const sanitizedPhoneNumber = phoneNumber.startsWith('+')
        ? phoneNumber.slice(1)
        : phoneNumber;

      // Check if the user already exists
      const checkUserQuery = 'SELECT * FROM users WHERE phone_number = $1';
      const checkUserResult = await client.query(checkUserQuery, [
        sanitizedPhoneNumber,
      ]);

      if (checkUserResult.rows.length > 0) {
        console.log('User already registered.');
        return checkUserResult.rows[0];
      }

      // If the user is not found, create a new one
      const insertUserQuery =
        'INSERT INTO users (phone_number, first_name) VALUES ($1, $2) RETURNING *';
      const result = await client.query(insertUserQuery, [
        sanitizedPhoneNumber,
        firstName,
      ]);

      return result.rows[0]; // Return the new user
    } catch (error) {
      console.error('Error creating user:', error);
      throw new HttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      client.release();
    }
  }
}
