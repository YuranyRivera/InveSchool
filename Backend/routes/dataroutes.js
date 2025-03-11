import express from 'express';
import { pool } from '../config/db.js';
import transporter from '../config/nodemailerConfig.js';
import { upload } from '../middleware/uploadConfig.js';
import {  obtenerArticulosBajaHistorial, getEstadisticasProveedor,
  eliminarMovimiento, eliminarArticuloHistorial, getProductosPorProveedor, obtenerProveedores,

  eliminarArticuloAlmacenamiento, handleMulterError , obtenerTotalArticulosBajaHistorial,  obtenerTotalArticulosAlmacenamiento, getUltimoRegistro, obtenerTotalArticulosActivos, obtenerTotalArticulosInactivos, eliminarArticuloBaja, editarTraslado, obtenerArticulosBaja, eliminarTraslado, getTraslados, insertarTraslado, getProductosPorUbicacion, editarArticuloAdministrativo, eliminarArticuloAdministrativo, updateMovimiento, getArticulosAdministrativos, deleteMovimiento, getLastArticuloAdministrativoId, createArticuloAdministrativo, updateProfile, updatePassword, checkIfUserExists, checkEmailExists,editarPerfil, crearUsuario, obtenerUsuarios, eliminarUsuario,   loginUser, editarArticulo,  getDetallesMovimiento, getLastId, getReporteGeneral, getMovimientos, createMovimiento, getArticulos, deleteArticulo, getProductos, createArticulo } from '../controllers/datacontroler.js';
import jwt from 'jsonwebtoken';

import bcryptjs from 'bcryptjs';


import { verifyToken } from '../middleware/authMiddleware.js';


const router = express.Router();
router.get('/productosproveedor', getProductosPorProveedor);
router.get("/proveedores", obtenerProveedores);
// Agregar la ruta
router.get('/estadisticas', getEstadisticasProveedor);
// Ruta para eliminar un artículo del historial
router.delete('/articulos_baja_historial/:id', eliminarArticuloHistorial);
// Ruta para eliminar un movimiento por su ID y reordenar los IDs
router.delete('/eliminar-movimiento/:id', eliminarMovimiento);
// Ruta para obtener el último registro
router.get('/ultimo-registro', getUltimoRegistro);

// Ruta para obtener el total de artículos en almacenamiento
router.get('/total-articulos-almacenamiento', obtenerTotalArticulosAlmacenamiento);

// Rutas para obtener el número total de artículos activos e inactivos
router.get('/total-activos', obtenerTotalArticulosActivos);
router.get('/total-historial-bajas', obtenerTotalArticulosBajaHistorial);

router.get('/total-inactivos', obtenerTotalArticulosInactivos);
// Ruta para eliminar un artículo por ID
router.delete('/articulos_baja/:id', eliminarArticuloBaja);
// Ruta para obtener todos los artículos dados de baja
router.get('/articulos_baja', obtenerArticulosBaja);
// Ruta para editar un traslado
router.put('/traslados/:id', editarTraslado);

// Ruta para eliminar un traslado
router.delete('/traslados/:id', eliminarTraslado);
// Ruta para obtener todos los traslados
router.get('/traslados', getTraslados);
// Ruta para insertar un traslado
router.post('/traslados', insertarTraslado);
// Ruta para obtener productos por ubicación
router.get('/productos/:ubicacion', getProductosPorUbicacion);
// Ruta para editar un artículo administrativo
router.put('/articulos_administrativos/:id', editarArticuloAdministrativo);

// Ruta para eliminar un artículo administrativo
router.delete('/articulos_administrativos/:id', eliminarArticuloAdministrativo);
router.get('/articulos-administrativos/last-id', getLastArticuloAdministrativoId);
// Ruta para crear un artículo administrativo
router.post('/articulos-administrativos', createArticuloAdministrativo);

// Ruta para actualizar el movimiento
router.put('/movimientos/:id', updateMovimiento);

// Ruta para eliminar el movimiento
router.delete('/movimientos/:id', deleteMovimiento);
router.post('/update-password', updatePassword);



// Ruta para solicitar el enlace de recuperación de contraseña
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Verificar si el usuario existe
    const userExists = await checkIfUserExists(email);

    if (!userExists) {
      return res.status(404).json({ error: 'Por favor regístrate para hacer el cambio de contraseña.' });
    }

    // Generar un token con expiración para la recuperación de contraseña
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token válido por 1 hora
    const resetLink = `https://front-inventarioschool-v1.onrender.com/ActualizarContrasena?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Configurar los detalles del correo
    const mailOptions = {
      from: 'inventario263@gmail.com',
      to: email,
      subject: 'Recuperación de Contraseña',
      html: `<p>Haga clic en el siguiente enlace para restablecer su contraseña:</p>
             <a href="${resetLink}">Restablecer Contraseña</a>
             <p>Este enlace es válido solo por un tiempo limitado.</p>`
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);
    console.log('Correo de restablecimiento enviado correctamente a:', email);
    res.status(200).json({ message: 'Enlace de restablecimiento enviado' });

  } catch (error) {
    console.error('Error al enviar el enlace de restablecimiento:', error);
    res.status(500).json({ error: `Error al enviar el enlace de restablecimiento: ${error.message}` });
  }
});



// Ruta para verificar si el correo electrónico ya está registrado
router.post('/check-email', async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
      return res.status(400).json({ error: 'Correo electrónico es requerido.' });
  }

  try {
      const exists = await checkEmailExists(correo);
      res.json({ exists });
  } catch (error) {
      console.error('Error en el endpoint check-email:', error);
      res.status(500).json({ error: error.message });
  }
});



router.post('/update-profile', verifyToken, async (req, res) => {
  console.log('Update profile request body:', req.body);

  const { 
    currentPassword, 
    newPassword, 
    nombre = null, 
    correo = null 
  } = req.body;

  // Validar que se proporcione la contraseña actual
  if (!currentPassword) {
    return res.status(400).json({ error: 'Contraseña actual es obligatoria' });
  }

  try {
    // Verificar la contraseña actual del usuario
    const client = await pool.connect();
    const result = await client.query('SELECT contraseña FROM usuarios WHERE id = $1', [req.user.id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcryptjs.compare(currentPassword, result.rows[0].contraseña);
    if (!isMatch) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    // Construir la consulta de actualización
    let query = 'UPDATE usuarios SET';
    const values = [];
    let valueIndex = 1;

    if (nombre) {
      query += ` nombre = $${valueIndex},`;
      values.push(nombre);
      valueIndex++;
    }

    if (correo) {
      query += ` correo = $${valueIndex},`;
      values.push(correo);
      valueIndex++;
    }

    if (newPassword) {
      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      query += ` contraseña = $${valueIndex},`;
      values.push(hashedPassword);
      valueIndex++;
    }

    // Eliminar la última coma y agregar la cláusula WHERE
    query = query.slice(0, -1) + ` WHERE id = $${valueIndex} RETURNING id, nombre, correo`;
    values.push(req.user.id);

    // Ejecutar la consulta
    const updateClient = await pool.connect();
    const updateResult = await updateClient.query(query, values);
    updateClient.release();

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Responder con los datos actualizados
    const updatedUser = updateResult.rows[0];
    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/login', async (req, res) => {
  console.log('Login request body:', req.body);
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  try {
    const user = await loginUser(correo, contraseña);
    if (user) {
      console.log('Usuario encontrado:', user);

      // Usa una clave secreta segura
      const token = jwt.sign(
        { id: user.id, rol: user.rol, correo: user.correo,  nombre: user.nombre },
        process.env.JWT_SECRET, // Asegúrate de que JWT_SECRET esté definido en .env
        { expiresIn: '4h' }
      );

      // Configuración de cookies más explícita
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,  // Habilitar en producción
        sameSite: 'strict', // Más seguro que 'lax'
        maxAge: 14400000, // 4h para coincidir con expiresIn del JWT
        path: '/'
      });

      console.log('Cookie establecida');

      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          correo: user.correo,
          rol: user.rol,
          nombre: user.nombre
        },
        token: token // Envía también el token en la respuesta
      });
    } else {
      res.status(400).json({ error: 'Correo o contraseña incorrectos' });
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
router.post('/logout', (req, res) => {
  console.log('Logout request received');
  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // Cambia a true en producción
    sameSite: 'lax'
  });
  res.status(200).json({ message: 'Logout successful' });
});

// Ruta para obtener el último ID
router.get('/articulos/last-id', getLastId); // Cambié el nombre de la ruta a /articulos/ultimo-id
// Crear un nuevo usuario
router.post('/usuarios', crearUsuario);

// Obtener todos los usuarios
router.get('/usuarios', obtenerUsuarios);

// Ruta para actualizar el perfil del usuario
router.put('/usuarios/:id', editarPerfil); // La ruta recibe el ID del usuario como parámetro
// Eliminar un usuario por ID
router.delete('/usuarios/:id', eliminarUsuario);
// Otras rutas...
router.post('/articulos', createArticulo);
router.get('/articulos', getArticulos); 
// Define la ruta para obtener detalles de un movimiento específico
// Ruta para editar un artículo
router.put('/articulos/:id', editarArticulo);

// Ruta para eliminar un artículo
// Routes
router.post('/articulos-baja/:id', 
  upload.single('imagen'),
  handleMulterError,
  eliminarArticuloAlmacenamiento
);



// Ruta para obtener todos los artículos dados de baja del historial
router.get('/articulos-baja-historial', obtenerArticulosBajaHistorial);

// Ruta para obtener el reporte general
router.get('/reporte-general', getReporteGeneral);
router.get('/movimiento/:id', getDetallesMovimiento);
router.get('/productos', getProductos); 
// Ruta para obtener los movimientos
router.get('/movimientos', getMovimientos);
// Ruta para crear un nuevo movimiento
router.post('/movimientos', createMovimiento);
router.delete('/articulos/:id', deleteArticulo);
// Define la ruta para obtener los artículos administrativos
router.get('/articulos-administrativos', getArticulosAdministrativos);

export default router;