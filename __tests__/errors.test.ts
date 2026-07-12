import { getErrorMessage } from '@/utils/errors';

describe('getErrorMessage', () => {
  it('gibt Strings direkt zurück', () => {
    expect(getErrorMessage('Hoppla')).toBe('Hoppla');
  });

  it('liest die message-Eigenschaft von Error-Objekten', () => {
    expect(getErrorMessage(new Error('Kaputt'))).toBe('Kaputt');
  });

  it('nutzt den Fallback bei unbekannten Werten', () => {
    expect(getErrorMessage(null, 'Standard')).toBe('Standard');
  });
});
