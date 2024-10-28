import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity'; // Adjust the path as necessary
import { UserController } from './user.controller'; // Ensure this is imported
import { UserService } from './user.service'; // Ensure this is imported

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Register User entity
  controllers: [UserController], // Ensure the UserController is registered here
  providers: [UserService],
  exports: [UserService], // Export UserService if needed in other modules
})
export class UserModule {}
