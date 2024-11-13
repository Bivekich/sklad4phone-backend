// src/agreement/agreement.controller.ts
import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { AgreementService } from './agreement.service';
import { Agreement } from './agreement.entity';

@Controller('agreements')
export class AgreementController {
  constructor(private readonly agreementService: AgreementService) {}

  @Get(':type')
  async getAgreement(@Param('type') type: string): Promise<Agreement> {
    return this.agreementService.findByType(type);
  }

  @Put(':type')
  async updateAgreementText(
    @Param('type') type: string,
    @Body('text') text: string,
  ): Promise<Agreement> {
    return this.agreementService.updateText(type, text);
  }
}
