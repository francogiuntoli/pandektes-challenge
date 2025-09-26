import { ApiProperty } from '@nestjs/swagger';
import { Case } from '@prisma/client';

export class CaseResourceDto {
  @ApiProperty({ example: 'f7a5b38b-e4e3-4c76-870a-7b4c2102b4f0' })
  id!: string;

  @ApiProperty({ example: 'Judgment of the Court (Grand Chamber)' })
  title!: string;

  @ApiProperty({ nullable: true, example: 'Judgment' })
  decisionType!: string | null;

  @ApiProperty({
    nullable: true,
    format: 'date-time',
    example: '2024-01-30T00:00:00.000Z',
  })
  decisionDate!: string | null;

  @ApiProperty({ nullable: true, example: 'Grand Chamber' })
  office!: string | null;

  @ApiProperty({
    nullable: true,
    example: 'Court of Justice of the European Union',
  })
  court!: string | null;

  @ApiProperty({ nullable: true, example: 'C-123/24' })
  caseNumber!: string | null;

  @ApiProperty({ nullable: true, description: 'Short summary of the case.' })
  summary!: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Outcome or conclusion of the decision.',
  })
  conclusion!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

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
