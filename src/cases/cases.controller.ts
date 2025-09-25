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
import { CasesService } from './cases.service';
import { CaseResourceDto } from './dto/case-resource.dto';
import multer from 'multer';
import { CASE_FILE_SIZE_LIMIT } from './constants';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}
  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: CASE_FILE_SIZE_LIMIT },
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
