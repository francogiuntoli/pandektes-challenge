import { Module } from '@nestjs/common';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { ExtractionService } from './extraction.service';
import { CasesResolver } from './graphql/cases.resolver';

@Module({
  controllers: [CasesController],
  providers: [CasesService, ExtractionService, CasesResolver],
})
export class CasesModule {}
