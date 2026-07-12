import { loginSchema, registerSchema } from '@/features/auth/schema';

describe('loginSchema', () => {
  it('akzeptiert gültige Eingaben', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'geheim123',
    });
    expect(result.success).toBe(true);
  });

  it('lehnt ungültige E-Mail ab', () => {
    const result = loginSchema.safeParse({
      email: 'keine-email',
      password: 'geheim123',
    });
    expect(result.success).toBe(false);
  });

  it('lehnt zu kurzes Passwort ab', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '123',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('lehnt nicht übereinstimmende Passwörter ab', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'geheim123',
      confirmPassword: 'anders123',
    });
    expect(result.success).toBe(false);
  });
});
