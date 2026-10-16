import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { config } from '../src/config/env.js';
import { requireRole, verifyToken } from '../src/middlewares/authenticate.js';
import { blockDemoWrites } from '../src/middlewares/demo-mode.js';
import { signAccessToken } from '../src/modules/auth/token.service.js';

/** Respuesta simulada de Express que guarda el estado y el cuerpo enviados. */
const mockResponse = () => {
  const res = { statusCode: 200, body: undefined };
  res.status = (code) => ((res.statusCode = code), res);
  res.json = (body) => ((res.body = body), res);
  return res;
};

/** Ejecuta un middleware y devuelve si llamó a next() y la respuesta. */
const run = (middleware, req) => {
  const res = mockResponse();
  let nextCalled = false;
  middleware(req, res, () => (nextCalled = true));
  return { nextCalled, res };
};

const USER = { id: 7, nombre: 'Ana Pérez', correo: 'ana@empresa.com', rol: 'Administrador' };
const bearer = (token) => ({ headers: { authorization: `Bearer ${token}` } });

describe('verifyToken', () => {
  it('acepta un token de sesión válido y expone el usuario', () => {
    const req = bearer(signAccessToken(USER));
    const { nextCalled } = run(verifyToken, req);
    assert.equal(nextCalled, true);
    assert.deepEqual(req.user, USER);
  });

  it('rechaza peticiones sin token', () => {
    const { nextCalled, res } = run(verifyToken, { headers: {} });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });

  it('rechaza tokens firmados con otra clave', () => {
    const forged = jwt.sign({ sub: '1', rol: 'Administrador', typ: 'access' }, 'otra-clave', {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });
    assert.equal(run(verifyToken, bearer(forged)).res.statusCode, 401);
  });

  it('rechaza tokens sin firma (alg "none")', () => {
    const unsigned = jwt.sign({ sub: '1', rol: 'Administrador', typ: 'access' }, '', { algorithm: 'none' });
    assert.equal(run(verifyToken, bearer(unsigned)).res.statusCode, 401);
  });

  it('rechaza un token de recuperación de contraseña usado como sesión', () => {
    const resetToken = jwt.sign({ sub: '1', typ: 'reset' }, config.jwt.secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });
    assert.equal(run(verifyToken, bearer(resetToken)).res.statusCode, 401);
  });
});

describe('requireRole', () => {
  it('deja pasar a los roles permitidos', () => {
    const { nextCalled } = run(requireRole('Administrador'), { user: USER });
    assert.equal(nextCalled, true);
  });

  it('responde 403 a otros roles', () => {
    const { nextCalled, res } = run(requireRole('Administrador'), { user: { ...USER, rol: 'Almacenamiento' } });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
  });
});

describe('blockDemoWrites', () => {
  const demo = { ...USER, rol: 'Demo' };

  it('permite que la demo lea datos', () => {
    assert.equal(run(blockDemoWrites, { method: 'GET', user: demo }).nextCalled, true);
  });

  it('bloquea cualquier escritura de la demo', () => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const { nextCalled, res } = run(blockDemoWrites, { method, user: demo });
      assert.equal(nextCalled, false, method);
      assert.equal(res.statusCode, 403, method);
    }
  });

  it('no afecta a los usuarios reales', () => {
    assert.equal(run(blockDemoWrites, { method: 'DELETE', user: USER }).nextCalled, true);
  });
});
