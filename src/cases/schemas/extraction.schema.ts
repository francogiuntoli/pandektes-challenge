import { z } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';

export const extractionSchema = z.object({
  title: z.string().min(1),
  decision_type: z.string(),
  decision_date: z.string(),
  office: z.string(),
  court: z.string(),
  case_number: z.string(),
  summary: z.string(),
  conclusion: z.string(),
});

export type ExtractionSchema = z.infer<typeof extractionSchema>;

export const extrationTextFormat = zodTextFormat(
  extractionSchema,
  'extraction_schema',
);
