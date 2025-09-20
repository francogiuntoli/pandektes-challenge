import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CaseSourceType } from '@prisma/client';
import * as cheerio from 'cheerio';
import { OpenAI } from 'openai';
import pdfParse from 'pdf-parse';
import {
  extractionTextFormat,
  type ExtractionSchema,
} from './schemas/extraction.schema';

interface ExtractedMetadata {
  title: string;
  decisionType?: string | null;
  decisionDate?: Date | null;
  office?: string | null;
  court?: string | null;
  caseNumber?: string | null;
  summary: string;
  conclusion: string;
}

const RAW_TEXT_MAX_LENGTH = 15000;

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);
  private openAIClient: OpenAI | null = null;

  constructor(private readonly configService: ConfigService) {}

  async extractMetadata(file: Express.Multer.File): Promise<ExtractedMetadata> {
    const sourceType = this.detectSourceType(file);
    const rawText = await this.extractPlainText(file, sourceType);

    const llmResponse = await this.invokeModel(rawText);
    const decisionDateValue = llmResponse.decision_date
      ? this.safeDate(llmResponse.decision_date)
      : null;

    return {
      title: llmResponse.title,
      decisionType: llmResponse.decision_type ?? null,
      decisionDate: decisionDateValue,
      office: llmResponse.office ?? null,
      court: llmResponse.court ?? null,
      caseNumber: llmResponse.case_number ?? null,
      summary: llmResponse.summary,
      conclusion: llmResponse.conclusion,
    };
  }

  private detectSourceType(file: Express.Multer.File): CaseSourceType {
    if (file.mimetype.includes('pdf')) {
      return CaseSourceType.PDF;
    }
    return CaseSourceType.HTML;
  }

  private async extractPlainText(
    file: Express.Multer.File,
    sourceType: CaseSourceType,
  ): Promise<string> {
    if (!file.buffer) {
      throw new InternalServerErrorException('File buffer is empty');
    }

    if (sourceType === CaseSourceType.PDF) {
      const result = await pdfParse(file.buffer);
      return result.text;
    }

    const htmlContent = file.buffer.toString('utf-8');
    const $ = cheerio.load(htmlContent);
    return $('body').text().replace(/\s+/g, ' ').trim();
  }

  private async invokeModel(rawText: string): Promise<ExtractionSchema> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException(
        'OPENAI_API_KEY is not configured',
      );
    }

    const model =
      this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
    const client = this.initializeClient(apiKey);

    const prompt = this.buildPrompt(rawText);

    const response = await client.responses.parse({
      model,
      input: [
        {
          role: 'system',
          content:
            'You are a legal analyst that extracts structured metadata from case law documents.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      text: {
        format: extractionTextFormat,
      },
    });

    if (!response.output_parsed) {
      this.logger.error('LLM response did not include structured payload');
      throw new InternalServerErrorException(
        'Failed to parse LLM JSON payload',
      );
    }

    return response.output_parsed;
  }

  private buildPrompt(rawText: string): string {
    const truncated = rawText.slice(0, RAW_TEXT_MAX_LENGTH);
    return [
      'Extract the following fields from the provided case law document:',
      'title, decision_type, decision_date (ISO 8601), office, court, case_number, summary, conclusion, source_url (if explicitly referenced).',
      'Return a well-formed JSON object with these exact keys. If data is missing, set the value to null.',
      'Here is the document text:',
      truncated,
    ].join('\n\n');
  }

  private initializeClient(apiKey: string): OpenAI {
    if (!this.openAIClient) {
      this.openAIClient = new OpenAI({ apiKey });
    }
    return this.openAIClient;
  }

  private safeDate(input: string): Date | null {
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
      this.logger.warn(`Could not parse date from value: ${input}`);
      return null;
    }
    return parsed;
  }
}
