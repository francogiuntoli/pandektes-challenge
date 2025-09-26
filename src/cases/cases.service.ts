import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Case, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExtractionService } from './extraction.service';

@Injectable()
export class CasesService {
  private readonly logger = new Logger(CasesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly extractionService: ExtractionService,
  ) {}

  async importCase(file: Express.Multer.File): Promise<Case> {
    const metadata = await this.extractionService.extractMetadata(file);

    const { caseNumber } = metadata;
    let existing: Case | null = null;
    if (caseNumber) {
      existing = await this.prisma.case.findFirst({
        where: {
          caseNumber: metadata.caseNumber,
        },
      });
    }

    const data: Prisma.CaseCreateInput = {
      title: metadata.title,
      decisionType: metadata.decisionType ?? null,
      decisionDate: metadata.decisionDate ?? null,
      office: metadata.office ?? null,
      court: metadata.court ?? null,
      caseNumber: metadata.caseNumber ?? null,
      summary: metadata.summary,
      conclusion: metadata.conclusion,
    };

    if (existing) {
      this.logger.debug(`Updating existing case ${existing.id}`);
      return this.prisma.case.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.prisma.case.create({ data });
  }

  async getCaseById(id: string): Promise<Case> {
    const caseRecord = await this.prisma.case.findUnique({ where: { id } });
    if (!caseRecord) {
      throw new NotFoundException(`Case ${id} not found`);
    }
    return caseRecord;
  }

  async deleteCase(id: string): Promise<string> {
    await this.getCaseById(id);
    await this.prisma.case.delete({ where: { id } });
    return id;
  }
}
