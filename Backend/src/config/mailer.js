import nodemailer from 'nodemailer';
import { config } from './env.js';

/**
 * Envío de correos con dos proveedores:
 *  - Brevo (API HTTP): se usa si existe BREVO_API_KEY. Necesario en hostings que bloquean SMTP,
 *    como el plan gratuito de Render.
 *  - SMTP de Gmail (MAIL_USER / MAIL_PASS): alternativa para desarrollo local.
 * Ambos tienen tiempo límite: un proveedor lento nunca deja una petición colgada.
 */
const TIMEOUT_MS = 10_000;
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

const { brevoApiKey, user, pass, from } = config.mail;

const smtp =
  user && pass
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        connectionTimeout: TIMEOUT_MS,
        greetingTimeout: TIMEOUT_MS,
        socketTimeout: TIMEOUT_MS,
      })
    : null;

export const mailProvider = brevoApiKey ? 'brevo' : smtp ? 'smtp' : null;
export const isMailConfigured = Boolean(mailProvider && from);

const sendWithBrevo = async ({ to, subject, html }) => {
  const response = await fetch(BREVO_URL, {
    method: 'POST',
    headers: { 'api-key': brevoApiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ sender: { name: 'InveSchool', email: from }, to: [{ email: to }], subject, htmlContent: html }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Brevo respondió ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
};

const sendWithSmtp = ({ to, subject, html }) => smtp.sendMail({ from: `"InveSchool" <${from}>`, to, subject, html });

/** Envía un correo con el proveedor configurado. */
export const sendMail = async (message) => {
  if (!isMailConfigured) throw new Error('El correo no está configurado (BREVO_API_KEY o MAIL_USER/MAIL_PASS).');
  return mailProvider === 'brevo' ? sendWithBrevo(message) : sendWithSmtp(message);
};
