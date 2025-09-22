import { Module } from '@nestjs/common';
import { CasesController } from './cases.controller';
import { CasesResolver } from './cases.resolver';
import { CasesService } from './cases.service';
import { ExtractionService } from './extraction.service';

@Module({
  controllers: [CasesController],
  providers: [CasesService, ExtractionService, CasesResolver],
})
export class CasesModule {}
