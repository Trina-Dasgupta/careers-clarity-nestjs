import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import type { ReadStream } from 'fs';
import { basename, isAbsolute, join, relative } from 'path';
import { UploadedFileResponseDto } from './dto/uploaded-file-response.dto';

@Injectable()
export class FilesService {
  private readonly uploadRoot: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadRoot = this.resolveUploadPath(
      this.configService.get<string>('UPLOAD_DEST') || 'uploads',
    );
    this.ensureUploadDirectory();
  }

  private resolveUploadPath(uploadDir: string): string {
    return isAbsolute(uploadDir) ? uploadDir : join(process.cwd(), uploadDir);
  }

  private ensureUploadDirectory(): void {
    if (!existsSync(this.uploadRoot)) {
      mkdirSync(this.uploadRoot, { recursive: true });
    }
  }

  buildFileResponse(file: Express.Multer.File): UploadedFileResponseDto {
    const resolvedPath = file.path || join(this.uploadRoot, file.filename);
    const relativePath = relative(process.cwd(), resolvedPath).replace(
      /\\/g,
      '/',
    );

    return {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: relativePath,
      url: `/uploads/${file.filename}`,
    };
  }

  createReadStream(filename: string): ReadStream {
    const fullPath = this.resolveFilename(filename);

    if (!existsSync(fullPath)) {
      throw new NotFoundException('File not found');
    }

    return createReadStream(fullPath);
  }

  removeFile(filename: string): void {
    const fullPath = this.resolveFilename(filename);

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  }

  getUploadRoot(): string {
    return this.uploadRoot;
  }

  private resolveFilename(filename: string): string {
    const sanitizedName = basename(filename);
    return join(this.uploadRoot, sanitizedName);
  }
}
