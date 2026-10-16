import nodemailer from 'nodemailer';
import { config } from './env.js';

// Las credenciales viven en variables de entorno (MAIL_USER / MAIL_PASS), nunca en el código.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
});

export const isMailConfigured = Boolean(config.mail.user && config.mail.pass);

export default transporter;
