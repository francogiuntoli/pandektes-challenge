import { z } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';

export const extractionSchema = z.object({
  title: z.string().min(1),
  decision_type: z.string().nullable().optional(),
  decision_date: z.string().nullable().optional(),
  office: z.string().nullable().optional(),
  court: z.string().nullable().optional(),
  case_number: z.string().nullable().optional(),
  summary: z.string(),
  conclusion: z.string(),
});

export type ExtractionSchema = z.infer<typeof extractionSchema>;

export const extractionTextFormat = zodTextFormat(
  extractionSchema,
  'extraction_schema',
);
