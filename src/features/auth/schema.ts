import { z } from 'zod';

/**
 * Validierungsregeln für die Auth-Formulare (mit Zod).
 * Eine Quelle der Wahrheit – dieselben Regeln lassen sich später
 * auch im Backend wiederverwenden.
 */
export const loginSchema = z.object({
  email: z.string().email('Bitte gültige E-Mail eingeben'),
  password: z.string().min(6, 'Mindestens 6 Zeichen'),
});

export const registerSchema = loginSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
