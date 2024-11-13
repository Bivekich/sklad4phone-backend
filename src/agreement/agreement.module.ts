// src/agreement/agreement.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agreement } from './agreement.entity';
import { AgreementService } from './agreement.service';
import { AgreementController } from './agreement.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Agreement])],
  providers: [AgreementService],
  controllers: [AgreementController],
})
export class AgreementModule {}
