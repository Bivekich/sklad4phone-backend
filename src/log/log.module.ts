import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './log.entity';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Log]), UserModule], // Register Log entity
  providers: [LogService], // Only add services to providers
  controllers: [LogController], // Add LogController to controllers
  exports: [LogService, TypeOrmModule], // Export LogService and TypeOrmModule for use in other modules
})
export class LogModule {}
