// support.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Support } from './support.entity';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Support)
    private readonly supportRepository: Repository<Support>,
  ) {}

  async createSupportTicket(
    userId: number,
    subject: string,
    message: string,
  ): Promise<Support> {
    const ticket = this.supportRepository.create({ userId, subject, message });
    return this.supportRepository.save(ticket);
  }

  async getSupportTickets(): Promise<Support[]> {
    return this.supportRepository.find();
  }

  async getSupportTicketById(id: number): Promise<Support> {
    return this.supportRepository.findOne({ where: { id } });
  }

  async updateSupportTicketStatus(
    id: number,
    status: 'open' | 'in-progress' | 'closed',
  ): Promise<Support> {
    const ticket = await this.getSupportTicketById(id);
    if (!ticket) throw new Error('Ticket not found');
    ticket.status = status;
    return this.supportRepository.save(ticket);
  }
}
