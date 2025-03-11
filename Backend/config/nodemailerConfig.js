import nodemailer from 'nodemailer';

// Configura el transporter con tus credenciales de correo electrónico
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'inventario263@gmail.com',
        pass: 'mgmw hgiy nsgh mzvo', // Usa la nueva contraseña de aplicación aquí
    },
});

export default transporter;