import { BadRequestException, Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from './schema/media.schema';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import * as path from 'path';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
    AuthModule,
    // Configure Multer for file uploads
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get<string>('UPLOAD_DIR'),
          // Generate unique filename
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
          },
        }),
        // Allow only JPEG files
        fileFilter: (req, file, cb) => {
          if (file.mimetype !== 'image/jpeg') {
            return cb(new BadRequestException('Only JPEG allowed'), false);
          }
          cb(null, true);
        },
        // File size limit
        limits: {
          fileSize: parseInt(<string>configService.get('MAX_FILE_SIZE')),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MediaService],
  controllers: [MediaController],
})
export class MediaModule {}
