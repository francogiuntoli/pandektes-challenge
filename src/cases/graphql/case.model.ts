import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import type { Case } from '@prisma/client';

@ObjectType('Case')
export class CaseModel {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  decisionType!: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  decisionDate!: Date | null;

  @Field(() => String, { nullable: true })
  office!: string | null;

  @Field(() => String, { nullable: true })
  court!: string | null;

  @Field(() => String, { nullable: true })
  caseNumber!: string | null;

  @Field(() => String, { nullable: true })
  summary!: string | null;

  @Field(() => String, { nullable: true })
  conclusion!: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;

  static fromPrisma(model: Case): CaseModel {
    const resource = new CaseModel();
    resource.id = model.id;
    resource.title = model.title;
    resource.decisionType = model.decisionType;
    resource.decisionDate = model.decisionDate;
    resource.office = model.office;
    resource.court = model.court;
    resource.caseNumber = model.caseNumber;
    resource.summary = model.summary;
    resource.conclusion = model.conclusion;
    resource.createdAt = model.createdAt;
    resource.updatedAt = model.updatedAt;
    return resource;
  }
}
