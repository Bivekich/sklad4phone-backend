import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('broadcast')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, './uploads');
        },
        filename: (req, file, cb) => {
          // Generate a unique filename
          const filename: string = uuidv4() + path.extname(file.originalname);
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Allow only specific file types for the photo field
        if (
          file.fieldname === 'photo' &&
          !file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)
        ) {
          return cb(
            new Error('Only image files are allowed for the photo!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async sendNotificationToAll(
    @Body('message') message: string,
    @UploadedFile() photo?: Express.Multer.File,
  ): Promise<void> {
    // Generate the URL for the uploaded photo file, if it exists
    const photoUrl = photo ? `/uploads/${photo.filename}` : null;

    console.log('Photo URL:', photoUrl);

    // Pass message and photo URL to the notification service
    await this.notificationService.sendNotificationToAll(message, photoUrl);
  }
}
