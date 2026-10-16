import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { checkLiveness, createDatabaseCheck } from '../src/modules/health/health.controller.js';

const mockResponse = () => {
  const res = { statusCode: 200, body: undefined };
  res.status = (code) => ((res.statusCode = code), res);
  res.json = (body) => ((res.body = body), res);
  return res;
};

describe('health', () => {
  it('/health responde sin tocar la base de datos', () => {
    const res = mockResponse();
    checkLiveness({}, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { status: 'ok' });
  });

  it('/health/db responde 200 cuando la base contesta', async () => {
    const query = mock.fn(async () => ({ rows: [{ '?column?': 1 }] }));
    const res = mockResponse();
    await createDatabaseCheck(query)({}, res);

    assert.equal(query.mock.callCount(), 1);
    assert.equal(query.mock.calls[0].arguments[0], 'SELECT 1');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.database, 'ok');
  });

  it('/health/db responde 503 sin exponer detalles cuando la base falla', async () => {
    const res = mockResponse();
    mock.method(console, 'error', () => {});
    await createDatabaseCheck(async () => {
      throw new Error('password authentication failed for user "postgres"');
    })({}, res);

    assert.equal(res.statusCode, 503);
    assert.deepEqual(res.body, { status: 'error', database: 'unavailable' });
    console.error.mock.restore();
  });

  it('/health/db responde 503 si la base no contesta a tiempo', async () => {
    mock.timers.enable({ apis: ['setTimeout'] });
    mock.method(console, 'error', () => {});
    const res = mockResponse();
    const pending = createDatabaseCheck(() => new Promise(() => {}))({}, res);

    mock.timers.tick(5_000);
    await pending;

    assert.equal(res.statusCode, 503);
    mock.timers.reset();
    console.error.mock.restore();
  });
});
