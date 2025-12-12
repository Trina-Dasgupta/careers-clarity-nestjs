import { BadRequestException, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, isAbsolute, join } from 'path';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
];

@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uploadDir = configService.get<string>('UPLOAD_DEST') || 'uploads';
        const uploadPath = isAbsolute(uploadDir)
          ? uploadDir
          : join(process.cwd(), uploadDir);
        const allowedMimeTypes = (
          configService.get<string>('UPLOAD_ALLOWED_MIME_TYPES') ||
          DEFAULT_ALLOWED_MIME_TYPES.join(',')
        )
          .split(',')
          .map((type) => type.trim())
          .filter(Boolean);

        const fileSize =
          Number(configService.get<string>('UPLOAD_MAX_FILE_SIZE')) ||
          DEFAULT_MAX_FILE_SIZE;

        const ensureDestinationExists = () => {
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
        };

        return {
          storage: diskStorage({
            destination: (_, __, cb) => {
              ensureDestinationExists();
              cb(null, uploadPath);
            },
            filename: (_, file, cb) => {
              const timestamp = Date.now();
              const random = Math.round(Math.random() * 1e9);
              const extension = extname(file.originalname);
              cb(null, `${timestamp}-${random}${extension}`);
            },
          }),
          limits: {
            fileSize,
          },
          fileFilter: (_, file, cb) => {
            if (
              allowedMimeTypes.length > 0 &&
              !allowedMimeTypes.includes(file.mimetype)
            ) {
              cb(
                new BadRequestException(
                  `Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`,
                ),
                false,
              );
              return;
            }

            cb(null, true);
          },
        };
      },
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}

