import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { Contact, Message } from 'node-telegram-bot-api';

const TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class BotService implements OnModuleInit {
  private bot: any;
  private users: Record<string, any> = {};

  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const token = this.configService.get<string>('BOT_TOKEN');
    this.bot = new TelegramBot(token, {
      polling: {
        interval: 100,
        autoStart: true,
        params: { timeout: 10 },
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

    const sanitizedPhoneNumber = phoneNumber.startsWith('+')
      ? phoneNumber.slice(1)
      : phoneNumber;

    try {
      // Attempt to create the user with the provided phone number and name
      await this.userService.createUser(sanitizedPhoneNumber, firstName);

      // Notify the user that their number is saved and provide a link to the mini-app
      await this.bot.sendMessage(
        chatId,
        'Ваш номер успешно сохранен. Нажмите на кнопку ниже, чтобы открыть мини-приложение',
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Открыть приложение',
                  web_app: {
                    url: this.configService.get<string>('APP_URL'),
                  },
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
