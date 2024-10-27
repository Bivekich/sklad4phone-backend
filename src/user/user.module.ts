import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Pool } from 'pg';

const dbPoolProvider = {
  provide: 'DATABASE_POOL',
  useFactory: () => {
    return new Pool({
      // Add your DB config here
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASS,
      port: Number(process.env.DB_PORT),
    });
  },
};

@Module({
  controllers: [UserController],
  providers: [UserService, dbPoolProvider],
  exports: [UserService],
})
export class UserModule {}
