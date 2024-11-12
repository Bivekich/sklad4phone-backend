import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Support } from './support.entity';
import { UserService } from '../user/user.service'; // Import UserService
import { BotService } from '../bot/bot.service';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Support)
    private readonly supportRepository: Repository<Support>,
    private readonly userService: UserService, // Inject UserService
    private readonly botService: BotService,
  ) {}

  async createSupportTicket(
    phoneNumber: string,
    subject: string,
    message: string,
  ): Promise<Support> {
    // Create and save the support ticket
    const ticket = this.supportRepository.create({
      phoneNumber,
      subject,
      message,
    });
    const savedTicket = await this.supportRepository.save(ticket);

    // Fetch the user by phone number
    const user = await this.userService.getUserByPhoneNumber(phoneNumber); // Use UserService to find the user

    // Get the first name
    const firstName = user ? user.first_name : 'Unknown User';

    // Send the notification after saving the ticket
    await this.sendNotificationForNewTicket(savedTicket, firstName);

    return savedTicket;
  }

  async getSupportTickets(): Promise<Support[]> {
    return this.supportRepository.find({ order: { id: 'DESC' } });
  }

  async getUserSupportTickets(phoneNumber: string): Promise<Support[]> {
    return this.supportRepository.find({
      where: { phoneNumber },
      order: { id: 'DESC' }, // Sort by createdAt field in descending order
    });
  }

  private async sendNotificationForNewTicket(
    ticket: Support,
    firstName: string,
  ): Promise<void> {
    const { subject, message, phoneNumber } = ticket;

    try {
      // Send notification with the user's first name
      await this.botService.sendNotificationToGroups(
        subject,
        message,
        phoneNumber,
        firstName, // Use the user's first name here
      );
      console.log('Notification sent after creating support ticket');
    } catch (error) {
      console.error('Error sending notification for new ticket:', error);
    }
  }
}
