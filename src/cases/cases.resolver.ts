import { BadRequestException, ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { Readable } from 'node:stream';
import { CasesService } from './cases.service';
import { CaseResourceDto } from './dto/case-resource.dto';

@Resolver(() => CaseResourceDto)
export class CasesResolver {
  constructor(private readonly casesService: CasesService) {}

  @Query(() => CaseResourceDto, { name: 'case' })
  async getCase(
    @Args('id', { type: () => String }, new ParseUUIDPipe()) id: string,
  ): Promise<CaseResourceDto> {
    const caseRecord = await this.casesService.getCaseById(id);
    return CaseResourceDto.fromModel(caseRecord);
  }

  @Mutation(() => CaseResourceDto)
  async importCase(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: Promise<FileUpload>,
  ): Promise<CaseResourceDto> {
    const upload = await file;
    if (!upload) {
      throw new BadRequestException('No file uploaded');
    }

    const multerFile = await this.toMulterFile(upload);
    const savedCase = await this.casesService.importCase(multerFile);
    return CaseResourceDto.fromModel(savedCase);
  }

  @Mutation(() => CaseResourceDto)
  async deleteCase(
    @Args('id', { type: () => String }, new ParseUUIDPipe()) id: string,
  ): Promise<CaseResourceDto> {
    const caseRecord = await this.casesService.getCaseById(id);
    await this.casesService.deleteCase(id);
    return CaseResourceDto.fromModel(caseRecord);
  }

  private async toMulterFile(upload: FileUpload): Promise<Express.Multer.File> {
    const { filename, mimetype, encoding, createReadStream } = upload;
    const stream = createReadStream();

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (error) => reject(error));
    });

    return {
      fieldname: 'file',
      originalname: filename,
      encoding,
      mimetype,
      size: buffer.length,
      stream: Readable.from(buffer),
      destination: '',
      filename,
      path: '',
      buffer,
    } as Express.Multer.File;
  }
}
