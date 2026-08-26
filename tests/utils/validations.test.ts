import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPassword, validateTaskInput } from '../../src/utils/validations';

describe('Validations Utility', () => {
  describe('isValidEmail', () => {
    it('debe retornar true para emails válidos', () => {
      expect(isValidEmail('usuario@matecode.com')).toBe(true);
      expect(isValidEmail('juan.perez@empresa.org')).toBe(true);
      expect(isValidEmail('admin+dev@test.io')).toBe(true);
    });

    it('debe retornar false para emails inválidos', () => {
      expect(isValidEmail('usuario@')).toBe(false);
      expect(isValidEmail('sin-arroba.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('debe validar contraseñas de al menos 6 caracteres', () => {
      expect(isValidPassword('123456').isValid).toBe(true);
      expect(isValidPassword('passwordSeguro2026').isValid).toBe(true);
    });

    it('debe rechazar contraseñas con menos de 6 caracteres', () => {
      const result = isValidPassword('12345');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('al menos 6 caracteres');
    });
  });

  describe('validateTaskInput', () => {
    it('debe validar títulos con longitud correcta', () => {
      const result = validateTaskInput('Completar reporte Q3');
      expect(result.isValid).toBe(true);
    });

    it('debe rechazar títulos vacíos o demasiado cortos', () => {
      expect(validateTaskInput('').isValid).toBe(false);
      expect(validateTaskInput('ab').isValid).toBe(false);
    });
  });
});
