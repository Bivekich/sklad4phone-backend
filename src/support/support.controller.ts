// support.controller.ts
import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { SupportService } from './support.service';
import { Support } from './support.entity';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  async createSupportTicket(
    @Body('phoneNumber') phoneNumber: string,
    @Body('subject') subject: string,
    @Body('message') message: string,
  ): Promise<Support> {
    return this.supportService.createSupportTicket(
      phoneNumber,
      subject,
      message,
    );
  }

  @Get()
  async getAllSupportTickets(): Promise<Support[]> {
    return this.supportService.getSupportTickets();
  }

  @Get(':phoneNumber')
  async getSupportTicketById(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<Support[]> {
    return this.supportService.getUserSupportTickets(phoneNumber);
  }
}
