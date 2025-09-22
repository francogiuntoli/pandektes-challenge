import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Case } from '@prisma/client';

@ObjectType()
export class CaseResourceDto {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  decisionType: string | null;

  @Field({ nullable: true })
  decisionDate: string | null;

  @Field({ nullable: true })
  office: string | null;

  @Field({ nullable: true })
  court: string | null;

  @Field({ nullable: true })
  caseNumber: string | null;

  @Field({ nullable: true })
  summary: string | null;

  @Field({ nullable: true })
  conclusion: string | null;

  @Field()
  createdAt: string;

  @Field()
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
