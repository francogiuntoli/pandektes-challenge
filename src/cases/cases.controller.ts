import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { CaseResourceDto } from './dto/case-resource.dto';
import multer from 'multer';
import { CASE_FILE_SIZE_LIMIT } from './constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('cases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}
  @Post('import')
  @ApiOperation({
    summary: 'Import a new case by uploading a PDF or HTML file.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The case document to upload.',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ type: CaseResourceDto })
  @ApiBadRequestResponse({
    description: 'No file provided or validation failed.',
  })
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
  @ApiOperation({ summary: 'Retrieve a case by its identifier.' })
  @ApiOkResponse({ type: CaseResourceDto })
  @ApiNotFoundResponse({ description: 'Case not found.' })
  async getCase(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<CaseResourceDto> {
    const caseRecord = await this.casesService.getCaseById(id);
    return CaseResourceDto.fromModel(caseRecord);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a case by its identifier.' })
  @ApiOkResponse({ type: CaseResourceDto })
  @ApiNotFoundResponse({ description: 'Case not found.' })
  async deleteCase(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<CaseResourceDto> {
    const caseRecord = await this.casesService.getCaseById(id);
    await this.casesService.deleteCase(id);
    return CaseResourceDto.fromModel(caseRecord);
  }
}
