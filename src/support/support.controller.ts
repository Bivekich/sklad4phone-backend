// support.controller.ts
import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { SupportService } from './support.service';
import { Support } from './support.entity';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  async createSupportTicket(
    @Body('userId') userId: number,
    @Body('subject') subject: string,
    @Body('message') message: string,
  ): Promise<Support> {
    return this.supportService.createSupportTicket(userId, subject, message);
  }

  @Get()
  async getAllSupportTickets(): Promise<Support[]> {
    return this.supportService.getSupportTickets();
  }

  @Get(':id')
  async getSupportTicketById(@Param('id') id: number): Promise<Support> {
    return this.supportService.getSupportTicketById(id);
  }

  @Patch(':id/status')
  async updateSupportTicketStatus(
    @Param('id') id: number,
    @Body('status') status: 'open' | 'in-progress' | 'closed',
  ): Promise<Support> {
    return this.supportService.updateSupportTicketStatus(id, status);
  }
}
