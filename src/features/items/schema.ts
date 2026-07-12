import { z } from 'zod';

export const itemSchema = z.object({
  name: z.string().min(1, 'Bezeichnung ist erforderlich').max(120),
  description: z.string().max(500).optional().or(z.literal('')),
});

export type ItemInput = z.infer<typeof itemSchema>;
