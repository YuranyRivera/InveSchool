import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mailProvider, sendMail } from '../src/config/mailer.js';
import { passwordResetEmail } from '../src/modules/auth/password-reset.email.js';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

/** Reemplaza fetch y guarda la última petición recibida. */
const mockFetch = (status = 201, body = '{}') => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(body, { status });
  };
  return calls;
};

describe('sendMail con Brevo', () => {
  it('usa la API HTTP de Brevo cuando hay BREVO_API_KEY', () => {
    assert.equal(mailProvider, 'brevo');
  });

  it('envía remitente, destinatario, asunto y HTML', async () => {
    const calls = mockFetch();
    await sendMail({ to: 'ana@empresa.com', subject: 'Hola', html: '<p>Hola</p>' });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://api.brevo.com/v3/smtp/email');
    assert.equal(calls[0].options.headers['api-key'], process.env.BREVO_API_KEY);
    assert.deepEqual(JSON.parse(calls[0].options.body), {
      sender: { name: 'InveSchool', email: process.env.MAIL_FROM },
      to: [{ email: 'ana@empresa.com' }],
      subject: 'Hola',
      htmlContent: '<p>Hola</p>',
    });
  });

  it('tiene tiempo límite para no dejar peticiones colgadas', async () => {
    const calls = mockFetch();
    await sendMail({ to: 'ana@empresa.com', subject: 'Hola', html: '<p>Hola</p>' });
    assert.ok(calls[0].options.signal instanceof AbortSignal);
  });

  it('falla con un mensaje claro si Brevo rechaza el envío', async () => {
    mockFetch(401, '{"message":"Key not found"}');
    await assert.rejects(sendMail({ to: 'ana@empresa.com', subject: 'x', html: 'x' }), /Brevo respondió 401/);
  });
});

describe('passwordResetEmail', () => {
  it('incluye el enlace y avisa que vence', () => {
    const { subject, html } = passwordResetEmail('https://app.test/reset-password?token=abc');
    assert.match(subject, /contraseña/);
    assert.ok(html.includes('https://app.test/reset-password?token=abc'));
    assert.match(html, /30 minutos/);
  });
});
