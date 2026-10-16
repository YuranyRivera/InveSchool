/** Plantilla del correo de recuperación de contraseña (HTML compatible con clientes de correo). */
export const passwordResetEmail = (resetLink) => ({
  subject: 'Restablece tu contraseña de InveSchool',
  html: `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#0f204a;padding:24px 32px;color:#ffffff;font-size:20px;font-weight:bold;">
                Inve<span style="color:#9ca3af;">School</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#111827;font-size:15px;line-height:1.6;">
                <p style="margin:0 0 16px;font-size:18px;font-weight:bold;">Restablece tu contraseña</p>
                <p style="margin:0 0 24px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                <p style="margin:0 0 24px;">
                  <a href="${resetLink}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;">
                    Crear nueva contraseña
                  </a>
                </p>
                <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">El enlace vence en 30 minutos y solo puede usarse una vez.</p>
                <p style="margin:0;color:#6b7280;font-size:13px;">Si no fuiste tú, ignora este correo: tu contraseña no cambiará.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
});
