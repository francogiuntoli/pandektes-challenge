import { Readable } from 'node:stream';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BadRequestException, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { FileUpload, GraphQLUpload } from 'graphql-upload-minimal';
import { CasesService } from '../cases.service';
import { CaseModel } from './case.model';
import { GqlJwtAuthGuard } from '../../auth/guards/gql-jwt.guard';
import { CASE_FILE_SIZE_LIMIT } from '../constants';

@Resolver(() => CaseModel)
@UseGuards(GqlJwtAuthGuard)
export class CasesResolver {
  constructor(private readonly casesService: CasesService) {}

  @Query(() => CaseModel, { name: 'case' })
  async getCase(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
  ): Promise<CaseModel> {
    const caseRecord = await this.casesService.getCaseById(id);
    return CaseModel.fromPrisma(caseRecord);
  }

  @Mutation(() => CaseModel)
  async deleteCase(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
  ): Promise<CaseModel> {
    const caseRecord = await this.casesService.getCaseById(id);
    await this.casesService.deleteCase(id);
    return CaseModel.fromPrisma(caseRecord);
  }

  @Mutation(() => CaseModel)
  async importCase(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: Promise<FileUpload>,
  ): Promise<CaseModel> {
    const upload = await file;
    if (!upload) {
      throw new BadRequestException('No file provided');
    }

    const multerFile = await this.toMulterFile(upload);
    const savedCase = await this.casesService.importCase(multerFile);
    return CaseModel.fromPrisma(savedCase);
  }

  private async toMulterFile(upload: FileUpload): Promise<Express.Multer.File> {
    const stream = upload.createReadStream();
    const chunks: Buffer[] = [];
    let totalSize = 0;

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        totalSize += chunk.length;
        if (totalSize > CASE_FILE_SIZE_LIMIT) {
          stream.destroy();
          reject(
            new BadRequestException(
              `File exceeds the maximum allowed size of ${CASE_FILE_SIZE_LIMIT} bytes`,
            ),
          );
          return;
        }

        chunks.push(chunk);
      });

      stream.on('error', (error) => {
        if (error instanceof BadRequestException) {
          reject(error);
          return;
        }
        reject(new BadRequestException('Failed to process upload'));
      });
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });

    if (buffer.length === 0) {
      throw new BadRequestException('Uploaded file is empty');
    }

    return {
      fieldname: 'file',
      originalname: upload.filename,
      encoding: upload.encoding,
      mimetype: upload.mimetype,
      size: buffer.length,
      buffer,
      destination: '',
      filename: upload.filename,
      path: '',
      stream: Readable.from(buffer),
    };
  }
}
