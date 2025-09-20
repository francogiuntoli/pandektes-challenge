import { Case } from '@prisma/client';

export class CaseResourceDto {
  id: string;
  title: string;
  decisionType: string | null;
  decisionDate: string | null;
  office: string | null;
  court: string | null;
  caseNumber: string | null;
  summary: string | null;
  conclusion: string | null;
  createdAt: string;
  updatedAt: string;

  static fromModel(model: Case): CaseResourceDto {
    const dto = new CaseResourceDto();
    dto.id = model.id;
    dto.title = model.title;
    dto.decisionType = model.decisionType;
    dto.decisionDate = model.decisionDate?.toISOString() ?? null;
    dto.office = model.office;
    dto.court = model.court;
    dto.caseNumber = model.caseNumber;
    dto.summary = model.summary;
    dto.conclusion = model.conclusion;
    dto.createdAt = model.createdAt.toISOString();
    dto.updatedAt = model.updatedAt.toISOString();
    return dto;
  }
}
