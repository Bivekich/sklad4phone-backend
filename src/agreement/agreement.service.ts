// src/agreement/agreement.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agreement } from './agreement.entity';

@Injectable()
export class AgreementService {
  constructor(
    @InjectRepository(Agreement)
    private agreementRepository: Repository<Agreement>,
  ) {}

  async findByType(type: string): Promise<Agreement> {
    const agreement = await this.agreementRepository.findOne({
      where: { type },
    });
    if (!agreement) throw new Error(`Agreement of type ${type} not found`);
    return agreement;
  }

  async updateText(type: string, newText: string): Promise<Agreement> {
    const agreement = await this.findByType(type);
    agreement.text = newText;
    return this.agreementRepository.save(agreement);
  }
}
