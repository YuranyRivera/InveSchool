import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isPositiveInt,
  isValidEmail,
  maskEmail,
  maskIp,
  normalizeEmail,
  passwordPolicyError,
} from '../src/utils/validation.js';

describe('passwordPolicyError', () => {
  it('acepta una contraseña que cumple la política', () => {
    assert.equal(passwordPolicyError('Inventario2026'), null);
  });

  it('rechaza contraseñas cortas, sin mayúsculas, sin números o con espacios', () => {
    assert.match(passwordPolicyError('Ab1'), /al menos 8/);
    assert.match(passwordPolicyError('inventario2026'), /mayúsculas/);
    assert.match(passwordPolicyError('Inventario'), /números/);
    assert.match(passwordPolicyError('Inventario 2026'), /espacios/);
  });

  it('rechaza contraseñas de más de 72 bytes (límite de bcrypt)', () => {
    assert.match(passwordPolicyError(`Aa1${'x'.repeat(80)}`), /72/);
  });

  it('rechaza valores que no son texto', () => {
    assert.ok(passwordPolicyError(undefined));
    assert.ok(passwordPolicyError(12345678));
  });
});

describe('correos', () => {
  it('valida el formato', () => {
    assert.equal(isValidEmail('ana@empresa.com'), true);
    assert.equal(isValidEmail('sin-arroba.com'), false);
    assert.equal(isValidEmail('ana@empresa'), false);
  });

  it('normaliza espacios y mayúsculas', () => {
    assert.equal(normalizeEmail('  Ana@Empresa.COM '), 'ana@empresa.com');
    assert.equal(normalizeEmail(null), '');
  });
});

describe('enmascarado para la demo pública', () => {
  it('oculta el correo salvo la primera letra y el dominio', () => {
    assert.equal(maskEmail('yurani@gmail.com'), 'y•••••@gmail.com');
  });

  it('oculta la parte final de las IP', () => {
    assert.equal(maskIp('181.52.10.4'), '181.52.•.•');
    assert.equal(maskIp('2800:e2:1:2::5'), '2800:e2:•••');
  });
});

describe('isPositiveInt', () => {
  it('solo acepta enteros positivos (protege los parámetros :id)', () => {
    assert.equal(isPositiveInt('42'), true);
    assert.equal(isPositiveInt('0'), false);
    assert.equal(isPositiveInt('-1'), false);
    assert.equal(isPositiveInt('1;DROP TABLE usuarios'), false);
  });
});
