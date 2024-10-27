import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service'; // Ensure UserService is properly imported
import { Contact, Message } from 'node-telegram-bot-api';

// Use CommonJS-style import for TelegramBot
const TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class BotService implements OnModuleInit {
  private bot: any; // Use `any` type since we're using CommonJS
  private users: Record<string, any> = {}; // In-memory storage for user data

  constructor(
    private configService: ConfigService,
    private userService: UserService, // Inject UserService for user management
  ) {
    const token = this.configService.get<string>('BOT_TOKEN');
    this.bot = new TelegramBot(token, {
      polling: {
        interval: 100,
        autoStart: true,
        params: { timeout: 10 }, // Use params to set the timeout
      },
    });
  }

  onModuleInit() {
    this.bot.onText(/\/start/, this.handleStartCommand.bind(this));
    this.bot.on('contact', this.handleContact.bind(this));
    this.bot.on('polling_error', (err) => console.error('Polling error:', err));
  }

  private async handleStartCommand(msg: Message) {
    const chatId = msg.chat.id;
    await this.bot.sendMessage(
      chatId,
      'Добро пожаловать! Пожалуйста, отправьте ваш номер телефона.',
      {
        reply_markup: {
          keyboard: [
            [{ text: 'Отправить номер телефона', request_contact: true }],
          ],
          one_time_keyboard: true,
        },
      },
    );
  }

  private async handleContact(msg: Message) {
    const chatId = msg.chat.id;
    const contact = msg.contact as Contact;
    const phoneNumber = contact.phone_number;
    const firstName = contact.first_name;

    // Sanitize the phone number
    const sanitizedPhoneNumber = phoneNumber.startsWith('+')
      ? phoneNumber.slice(1)
      : phoneNumber;

    try {
      // Use UserService to create a user with the sanitized phone number and first name
      await this.userService.createUser(sanitizedPhoneNumber, firstName);
      await this.bot.sendMessage(
        chatId,
        'Ваш номер успешно сохранен. Открыть мини-приложение',
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Открыть приложение',
                  url:
                    this.configService.get<string>('APP_URL') ||
                    'https://google.com',
                  // web_app: {
                  // },
                },
              ],
            ],
          },
        },
      );
    } catch (error) {
      console.error('Error creating user:', error);
      await this.bot.sendMessage(
        chatId,
        'Произошла ошибка при сохранении номера.',
      );
    }
  }
}
