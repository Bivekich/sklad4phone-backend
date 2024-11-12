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
    this.bot.onText(/\/test/, this.handleTestCommand.bind(this));
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
  private async handleTestCommand(msg: Message) {
    const chatId = msg.chat.id;

    // Example contact details
    const contact = {
      firstName: 'Владимир', // Replace with the actual first name
      lastName: '', // Optional
      phoneNumber: '79016074757', // Replace with the actual phone number
    };

    await this.bot.sendContact(chatId, contact.phoneNumber, contact.firstName, {
      last_name: contact.lastName, // Optional
    });

    await this.bot.sendMessage(
      chatId,
      'Добро пожаловать! Пользователь с вопросом: .... .',
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
      await this.userService.createUser(
        sanitizedPhoneNumber,
        chatId,
        firstName,
      );

      // Notify the user that their number is saved and provide a link to the mini-app
      await this.bot.sendMessage(
        chatId,
        'Ваш номер успешно сохранен. Нажмите на кнопку ниже, чтобы открыть мини-приложение ',
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Открыть приложение',
                  web_app: {
                    url: `${this.configService.get<string>('APP_URL')}?phoneNumber=${sanitizedPhoneNumber}`,
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
  async sendNotification(chatId: number, message: string): Promise<void> {
    try {
      // Send the text message
      await this.bot.sendMessage(chatId, message);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async sendPhotoWithText(
    chatId: number,
    photoUrl: string,
    caption: string,
  ): Promise<void> {
    try {
      console.log('chatId:', chatId);
      console.log('photoUrl:', photoUrl);
      console.log('caption:', caption);

      await this.bot
        .sendPhoto(chatId, photoUrl, {
          caption: caption,
        })
        .then(() => console.log('Photo sent'));
    } catch (error) {
      console.error('Error sending photo ');
      // console.error('Error sending photo with text:', error);
    }
  }
  async sendVideoWithText(
    chatId: number,
    videoUrl: string,
    caption: string,
  ): Promise<void> {
    try {
      await this.bot.sendVideo(chatId, videoUrl, { caption: caption });
    } catch (error) {
      console.error('Error sending video with text:', error);
    }
  }
  async sendDocumentWithText(
    chatId: number,
    documentUrl: string,
    caption: string,
  ): Promise<void> {
    try {
      await this.bot.sendDocument(chatId, documentUrl, {
        caption: caption,
      });
    } catch (error) {
      console.error(
        `Error sending document with text to chatId ${chatId}:`,
        error,
      );
    }
  }
  async sendMediaGroup(chatId: number, mediaGroup: any[]): Promise<void> {
    try {
      await this.bot.sendMediaGroup(chatId, mediaGroup);
    } catch (error) {
      console.error(`Error sending media group:`, error);
    }
  }
  // New function to send notifications to groups based on subject
  async sendNotificationToGroups(
    subject: string,
    message: string,
    phoneNumber: string,
    firstName: string,
  ): Promise<void> {
    const groupId = '-1002341394911';

    try {
      // Sending message to the group
      await this.bot.sendMessage(
        groupId,
        `Вопрос к технической поддежке:\nОтдел: ${subject}\nВопрос: ${message}`,
      );
      console.log(`Notification sent to group ${groupId}`);
    } catch (error) {
      console.error(`Error sending notification to group ${groupId}:`, error);
    }

    // Formatting the contact information to send
    const contact = {
      firstName, // First Name
      lastName: '', // Optional, can be left blank or passed as needed
      phoneNumber, // Phone Number
    };

    try {
      // Sending contact to the group
      await this.bot.sendContact(
        groupId,
        contact.phoneNumber,
        contact.firstName,
        {
          last_name: contact.lastName, // Optional
        },
      );
      console.log(`Contact sent to group ${groupId}`);
    } catch (error) {
      console.error(`Error sending contact to group ${groupId}:`, error);
    }
  }
}
