import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { UploadedFileResponseDto } from './dto/uploaded-file-response.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  handleUpload(
    @UploadedFile() file: Express.Multer.File,
  ): UploadedFileResponseDto {
    if (!file) {
      throw new BadRequestException('A file must be provided');
    }

    return this.filesService.buildFileResponse(file);
  }

  @Get(':filename')
  async getFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const fileStream = this.filesService.createReadStream(filename);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(filename)}"`,
    );
    res.setHeader('Content-Type', 'application/octet-stream');
    fileStream.pipe(res);
  }
}
