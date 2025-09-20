import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { CasesService } from './cases.service';
import { CaseResourceDto } from './dto/case-resource.dto';

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}
  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: FILE_SIZE_LIMIT },
    }),
  )
  async importCase(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<CaseResourceDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const savedCase = await this.casesService.importCase(file);
    return CaseResourceDto.fromModel(savedCase);
  }

  @Get(':id')
  async getCase(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<CaseResourceDto> {
    const caseRecord = await this.casesService.getCaseById(id);
    return CaseResourceDto.fromModel(caseRecord);
  }

  @Delete(':id')
  async deleteCase(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<CaseResourceDto> {
    const caseRecord = await this.casesService.getCaseById(id);
    await this.casesService.deleteCase(id);
    return CaseResourceDto.fromModel(caseRecord);
  }
}
