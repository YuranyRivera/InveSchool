import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { pool } from '../config/db.js';
import fs from 'fs';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware para manejar errores de Multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'Error: El archivo es demasiado grande. El tamaño máximo permitido es 10MB'
      });
    }
    return res.status(400).json({
      message: `Error en la carga de archivo: ${err.message}`
    });
  }
  next(err);
};

export const eliminarArticuloAlmacenamiento = async (req, res) => {
  const { id } = req.params;
  let imagen_url = null;

  try {
    // Si hay un archivo de imagen, subirlo a Cloudinary
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'bajas_articulos',
          resource_type: 'auto'
        });
        imagen_url = result.secure_url;
        
        // Eliminar el archivo temporal
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error al eliminar archivo temporal:', err);
        });
      } catch (cloudinaryError) {
        console.error('Error de Cloudinary:', cloudinaryError);
        return res.status(500).json({ 
          message: 'Error al subir la imagen',
          error: cloudinaryError.message 
        });
      }
    }

    await pool.query('BEGIN');

    const articuloResult = await pool.query(
      'SELECT * FROM articulos_almacenamiento WHERE id = $1',
      [id]
    );

    if (articuloResult.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    const articulo = articuloResult.rows[0];
    const { motivo_baja, usuario_baja } = req.body;
    const cantidad = articulo.cantidad; 
    const insertResult = await pool.query(
      `INSERT INTO public.articulos_baja_historial 
      (id_articulo, producto, motivo_baja, usuario_baja, imagen_baja, cantidad, codigo)
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *;`,
      [id, articulo.producto, motivo_baja, usuario_baja, imagen_url, cantidad, articulo.codigo]
    );

   
 

    await pool.query('COMMIT');

    res.status(200).json({ 
      message: 'Artículo eliminado y registrado en historial de bajas correctamente',
      imagen_url,
      historial: insertResult.rows[0]
    });

  } catch (error) {
    console.error('Error completo:', error);
    await pool.query('ROLLBACK');
    res.status(500).json({ 
      message: 'Error al eliminar el artículo',
      error: error.message 
    });
  }
};

export const eliminarArticuloHistorial = async (req, res) => {
  const { id } = req.params; // Obtiene el ID del artículo desde los parámetros de la ruta

  // Verifica que el ID sea un número válido
  if (!id || isNaN(id)) {
    return res.status(400).json({
      message: 'El ID proporcionado no es válido.',
    });
  }

  try {
    // Elimina el registro con el ID proporcionado
    const result = await pool.query(
      'DELETE FROM articulos_baja_historial WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: `No se encontró ningún artículo en el historial con el ID: ${id}`,
      });
    }

    res.status(200).json({
      message: `Artículo con ID ${id} eliminado correctamente del historial.`,
      eliminado: result.rows[0], // Devuelve el registro eliminado
    });
  } catch (error) {
    console.error('Error al eliminar el artículo del historial:', error);
    res.status(500).json({
      message: 'Error al eliminar el artículo del historial',
      details: error.message,
    });
  }
};

export const eliminarMovimiento = async (req, res) => {
  const { id } = req.params; // Obtiene el ID desde los parámetros de la ruta

  try {
    // Paso 1: Elimina el registro con el ID proporcionado
    const result = await pool.query('DELETE FROM movimientos_almacen WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: `No se encontró ningún registro con el ID: ${id}`,
      });
    }



    res.status(200).json({
      message: `Movimiento con ID ${id} eliminado correctamente y los IDs han sido reordenados.`,
      eliminado: result.rows[0], // Devuelve el registro eliminado
    });
  } catch (error) {
    console.error('Error al eliminar el movimiento:', error);
    res.status(500).json({
      message: 'Error al eliminar el movimiento',
      details: error.message,
    });
  }
};

// Controlador para obtener el último registro
export const getUltimoRegistro = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, tipo_tabla, fecha, descripcion, tabla_origen_id
      FROM ultimo_registro
      ORDER BY fecha_registro DESC
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]); // Retorna el último registro
    } else {
      res.status(200).json({ message: 'No hay registros en la tabla "ultimo_registro".' });
    }
  } catch (err) {
    console.error('Error al obtener el último registro:', err);
    res.status(500).json({ error: 'Error al obtener el último registro' });
  }
};
export const obtenerTotalArticulosAlmacenamiento = async (req, res) => {
  try {
    // Consulta para contar el número total de registros en la tabla articulos_almacenamiento
    const result = await pool.query('SELECT COUNT(*) AS total_registros FROM articulos_almacenamiento');

    // Devuelve el total de registros encontrados
    res.status(200).json(result.rows[0]); // El total estará en result.rows[0].total_registros
  } catch (error) {
    console.error('Error al obtener el total de artículos en almacenamiento:', error);
    res.status(500).json({
      message: 'Error al obtener el total de artículos en almacenamiento',
      details: error.message,
    });
  }
};
// Obtener el número total de artículos activos
export const obtenerTotalArticulosActivos = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS total_activos FROM articulos_administrativos');
    res.status(200).json(result.rows[0]); // Devuelve el total de artículos activos
  } catch (error) {
    console.error('Error al obtener el total de artículos activos:', error);
    res.status(500).json({
      message: 'Error al obtener el total de artículos activos',
      details: error.message,
    });
  }
};
// Obtener el número total de artículos inactivos
export const obtenerTotalArticulosInactivos = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS total_inactivos FROM articulos_baja');
    res.status(200).json(result.rows[0]); // Devuelve el total de artículos inactivos
  } catch (error) {
    console.error('Error al obtener el total de artículos inactivos:', error);
    res.status(500).json({
      message: 'Error al obtener el total de artículos inactivos',
      details: error.message,
    });
  }
};

export const obtenerTotalArticulosBajaHistorial = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS total_historial FROM articulos_baja_historial');
    res.status(200).json(result.rows[0]); // Devuelve el total de artículos en el historial de bajas
  } catch (error) {
    console.error('Error al obtener el total de artículos en el historial de bajas:', error);
    res.status(500).json({
      message: 'Error al obtener el total de artículos en el historial de bajas',
      details: error.message,
    });
  }
};

export const eliminarArticuloBaja = async (req, res) => {
  const { id } = req.params; // Obtiene el ID desde los parámetros de la ruta

  try {
    // Realiza la consulta para eliminar el artículo
    const result = await pool.query('DELETE FROM articulos_baja WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: `No se encontró ningún artículo con el ID: ${id}`,
      });
    }

    res.status(200).json({
      message: `Artículo con ID ${id} eliminado correctamente`,
      articulo: result.rows[0], // Devuelve el artículo eliminado
    });
  } catch (error) {
    console.error('Error al eliminar el artículo:', error);
    res.status(500).json({
      message: 'Error al eliminar el artículo',
      details: error.message,
    });
  }
};


export const obtenerArticulosBaja = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articulos_baja ORDER BY id ASC'); // Consulta SQL
    res.status(200).json(result.rows); // Devuelve los resultados en formato JSON
  } catch (error) {
    console.error('Error al obtener los artículos dados de baja:', error);
    res.status(500).json({
      message: 'Error al obtener los artículos dados de baja',
      details: error.message,
    });
  }
};

export const getProductosPorProveedor = async (req, res) => {
  try {
    const { proveedor } = req.query;
    if (!proveedor) {
      return res.status(400).json({ error: 'Debe proporcionar un proveedor' });
    }

    // Using = instead of ILIKE for exact matching
    const query = `
      (
        SELECT descripcion, proveedor, 'Activo' AS estado
        FROM articulos_administrativos
        WHERE proveedor = $1
      )
      UNION ALL
      (
        SELECT descripcion, proveedor, 'Inactivo' AS estado
        FROM articulos_baja
        WHERE proveedor = $1
      )
      ORDER BY estado ASC, descripcion ASC;
    `;

    const { rows } = await pool.query(query, [proveedor]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener productos por proveedor:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

export const getEstadisticasProveedor = async (req, res) => {
  try {
    const { proveedor } = req.query;
    if (!proveedor) {
      return res.status(400).json({ error: 'Debe proporcionar un proveedor' });
    }

    // Using = for exact matching
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM articulos_administrativos WHERE proveedor = $1) as activos,
        (SELECT COUNT(*) FROM articulos_baja WHERE proveedor = $1) as inactivos,
        (
          SELECT COUNT(*) 
          FROM (
            SELECT id FROM articulos_administrativos WHERE proveedor = $1
            UNION ALL
            SELECT id FROM articulos_baja WHERE proveedor = $1
          ) as total
        ) as total
    `;

    const { rows } = await pool.query(query, [proveedor]);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

export const obtenerProveedores = async (req, res) => {
  try {
    // Using DISTINCT to get unique providers
    const query = `
      SELECT DISTINCT proveedor 
      FROM (
        SELECT proveedor FROM articulos_administrativos
        UNION
        SELECT proveedor FROM articulos_baja
      ) as proveedores
      ORDER BY proveedor ASC;
    `;
    
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener los proveedores:", error);
    res.status(500).json({
      message: "Error al obtener los proveedores",
      details: error.message,
    });
  }
};
export const obtenerArticulosBajaHistorial = async (req, res) => {
  try {
    const result = await pool.query(   'SELECT * FROM articulos_baja_historial ORDER BY id ASC '); // Consulta SQL a la tabla correcta
    res.status(200).json(result.rows); // Devuelve los resultados en formato JSON
  } catch (error) {
    console.error('Error al obtener los artículos dados de baja del historial:', error);
    res.status(500).json({
      message: 'Error al obtener los artículos dados de baja del historial',
      details: error.message,
    });
  }
};

export const editarTraslado = async (req, res) => {
  const { id } = req.params; // ID del traslado a editar
  const { ubicacion_inicial, ubicacion_final, responsable, fecha } = req.body; // Datos enviados desde el cliente

  try {
    // Actualiza el traslado
    const result = await pool.query(
      `UPDATE traslados 
       SET 
         ubicacion_inicial = $1, 
         ubicacion_final = $2, 
         responsable = $3, 
         fecha = $4, 
       
       WHERE id = $6 
       RETURNING *`, // Devuelve el traslado actualizado
      [ubicacion_inicial, ubicacion_final, responsable, fecha,  id]
    );

    // Verifica si se actualizó algún traslado
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Traslado no encontrado' });
    }

    // Devuelve el traslado actualizado
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al editar el traslado:', error);
    res.status(500).json({ message: 'Error al editar el traslado' });
  }
};

export const eliminarTraslado = async (req, res) => {
  const { id } = req.params;
  try {
    // Use parameterized query for better security
    const result = await pool.query(
      'DELETE FROM traslados WHERE id = $1', 
      [id]
    );

    // Check if any rows were actually deleted
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Traslado no encontrado' });
    }

    res.status(200).json({ message: 'Traslado eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el traslado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


export const getTraslados = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.ubicacion_inicial, t.id_articulo, t.ubicacion_final, t.fecha, t.responsable,
              a.descripcion AS nombre_articulo, a.codigo AS codigo_articulo
       FROM traslados t
       JOIN articulos_administrativos a ON t.id_articulo = a.id
       ORDER BY t.id ASC`
    );
    res.status(200).json(result.rows); // Devuelve todos los traslados junto con el nombre del artículo y el código
  } catch (error) {
    console.error('Error al obtener los traslados', error);
    res.status(500).json({ message: 'Error al obtener los traslados' });
  }
};

// Controlador para insertar un traslado
export const insertarTraslado = async (req, res) => {
  // Desestructuramos los datos del cuerpo de la solicitud
  const { ubicacion_inicial, id_articulo, ubicacion_final, fecha, responsable } = req.body;

  // Verificamos si los campos necesarios están presentes
  if (!ubicacion_inicial || !id_articulo || !ubicacion_final || !fecha || !responsable) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si el artículo existe en la tabla articulos_administrativos
    const articuloResult = await pool.query(
      `SELECT id FROM articulos_administrativos WHERE id = $1`, 
      [id_articulo]
    );

    if (articuloResult.rowCount === 0) {
      return res.status(400).json({ error: `El artículo con id ${id_articulo} no existe en la base de datos` });
    }

    // Inserción en la tabla de traslados
    const result = await pool.query(
      `INSERT INTO traslados (ubicacion_inicial, id_articulo, ubicacion_final, fecha, responsable)
      VALUES ($1, $2, $3, $4, $5) RETURNING id`, 
      [ubicacion_inicial, id_articulo, ubicacion_final, fecha, responsable]
    );

    // Obtener el ID del traslado insertado
    const id_traslado = result.rows[0].id;

    // Actualizar la ubicación del artículo en la tabla articulos_administrativos
    await pool.query(
      `UPDATE articulos_administrativos
      SET ubicacion = $1
      WHERE id = $2`,
      [ubicacion_final, id_articulo]
    );

    // Devolvemos la respuesta de éxito con el ID del traslado
    res.status(201).json({ message: 'Traslado registrado y ubicación de artículo actualizada con éxito', id_traslado });
  } catch (err) {
    console.error('Error al insertar el traslado:', err);
    res.status(500).json({ error: 'Error al registrar el traslado y actualizar la ubicación del artículo' });
  }
};



// Controlador para obtener productos según la ubicación
export const getProductosPorUbicacion = async (req, res) => {
  const ubicacion = decodeURIComponent(req.params.ubicacion); // Obtenemos la ubicación desde los parámetros de la URL

  try {
    
    const result = await pool.query(
      'SELECT id, codigo, descripcion FROM articulos_administrativos WHERE ubicacion = $1',
      [ubicacion]  // Pasamos la ubicación como parámetro para la consulta
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows);  // Devolvemos los productos encontrados
    } else {
      res.status(200).json([]);  // Si no se encuentran productos, devolvemos un array vacío
    }
  } catch (err) {
    console.error('Error al obtener los productos por ubicación:', err);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};


export const editarArticuloAdministrativo = async (req, res) => {
  const { id } = req.params; // ID del artículo a editar
  const { descripcion, proveedor, ubicacion, precio, fecha, observacion } = req.body; // Datos enviados desde el cliente

  try {
    // Actualiza el artículo y recalcula algún campo si es necesario
    const result = await pool.query(
      `UPDATE articulos_administrativos 
       SET 
         descripcion = $1, 
         proveedor = $2, 
         ubicacion = $3, 
         precio = $4, 
         fecha = $5, 
         observacion = $6
       WHERE id = $7 
       RETURNING *`, // Devuelve el artículo actualizado
      [descripcion, proveedor, ubicacion, precio, fecha, observacion, id]
    );

    // Verifica si se actualizó algún artículo
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    // Devuelve el artículo actualizado
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al editar el artículo administrativo:', error);
    res.status(500).json({ message: 'Error al editar el artículo administrativo' });
  }
};


export const eliminarArticuloAdministrativo = async (req, res) => {
  const { id } = req.params; // Obtener ID desde la URL
  const { observacion } = req.body; // Obtener la observación desde el cuerpo de la solicitud

  if (!observacion) {
    return res.status(400).json({ message: 'Se requiere una observación' });
  }

  try {
    // Iniciar una transacción
    await pool.query('BEGIN');

    // Primero, actualizar la observación en la tabla articulos_administrativos
    const updateResult = await pool.query(
      `UPDATE articulos_administrativos
      SET observacion = $1
      WHERE id = $2
      RETURNING *`,
      [observacion, id]
    );

    // Verifica si se actualizó algún artículo
    if (updateResult.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    // Eliminar el artículo de la tabla articulos_administrativos
    // Se elimina después de que se ha registrado en articulos_baja
    const deleteResult = await pool.query(
      `DELETE FROM articulos_administrativos
      WHERE id = $1
      RETURNING *`,
      [id]
    );

    // Verifica si se eliminó el artículo
    if (deleteResult.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

   

    // Confirmar la transacción
    await pool.query('COMMIT');

    // Devuelve el mensaje de éxito
    res.status(200).json({ message: 'Artículo administrativo eliminado y registrado en baja' });

  } catch (error) {
    console.error('Error al eliminar el artículo administrativo:', error);
    await pool.query('ROLLBACK');
    res.status(500).json({ message: 'Error al eliminar el artículo administrativo' });
  }
};



export const getArticulosAdministrativos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articulos_administrativos ORDER BY id ASC');
    res.status(200).json(result.rows); // Devuelve todos los artículos administrativos en orden ascendente por ID
  } catch (error) {
    console.error('Error al obtener los artículos administrativos', error);
    res.status(500).json({ message: 'Error al obtener los artículos administrativos' });
  }
};
// Endpoint para obtener el último ID insertado en articulos_administrativos
export const getLastArticuloAdministrativoId = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id FROM articulos_administrativos ORDER BY id DESC LIMIT 1'
    );

    if (result.rows.length > 0) {
      res.status(200).json({ id: result.rows[0].id });
    } else {
      res.status(200).json({ id: 0 }); // Si no hay registros, devuelve 0
    }
  } catch (err) {
    console.error('Error al obtener el último ID:', err);
    res.status(500).json({ error: 'Error al obtener el último ID' });
  }
};

// Crear un artículo administrativo
export const createArticuloAdministrativo = async (req, res) => {
  let { id, fecha, descripcion, proveedor, ubicacion, observacion, precio } = req.body;

  if (!fecha || !descripcion || !proveedor || !ubicacion || precio === undefined) {
    return res.status(400).json({ error: 'Todos los campos requeridos deben ser completados.' });
  }

  const fechaISO = new Date(fecha).toISOString().split('T')[0];
  const client = await pool.connect();

  try {
    // Modificar la query para incluir el ID
    const insertArticuloQuery = `
      INSERT INTO articulos_administrativos (id, fecha, descripcion, proveedor, ubicacion, observacion, precio)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, fecha, descripcion, proveedor, ubicacion, observacion, precio
    `;
    
    const result = await client.query(insertArticuloQuery, [
      id, // Añadir el ID aquí
      fechaISO,
      descripcion,
      proveedor,
      ubicacion,
      observacion || null,
      precio,
    ]);

    const articuloCreado = {
      ...result.rows[0],
      fecha: new Date(result.rows[0].fecha).toLocaleDateString('es-ES')
    };

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Artículo administrativo creado con éxito.',
      articulo: articuloCreado,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al crear el artículo administrativo:', err);
    res.status(500).json({ error: 'Error al crear el artículo administrativo.' });
  } finally {
    client.release();
  }
};

// Función para actualizar el perfil del usuario
export const updateProfile = async (id, nombre, correo, contraseña) => {
  try {
      const result = await pool.query(
          `UPDATE usuarios 
           SET nombre = $1, correo = $2, contraseña = $3
           WHERE id = $4 RETURNING *`,
          [nombre, correo, contraseña, id]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
      throw new Error('Error al actualizar el perfil');
  }
};
// Función para verificar si el usuario existe
export const checkIfUserExists = async (correo) => {
  try {
      const client = await pool.connect();
      const result = await client.query(
          'SELECT * FROM usuarios WHERE correo = $1',
          [correo]
      );
      client.release();

      return result.rows.length > 0; // Devuelve true si existe, false si no
  } catch (error) {
      console.error('Error al verificar si el usuario existe:', error);
      throw new Error('Error al verificar si el usuario existe.');
  }
};

export const updatePassword = async (req, res) => {
  console.log('Received request to update password');
  
  try {
    const { email, newPassword, token } = req.body;

    // Validate input
    if (!email || !newPassword || !token) {
      return res.status(400).json({ error: 'Faltan datos necesarios' });
    }

    // Step 1: Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar que el correo del token coincida con el correo proporcionado
      if (decoded.email !== email) {
        return res.status(401).json({ error: 'Token inválido para este correo' });
      }
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'El enlace de restablecimiento ha expirado' });
      }
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Step 2: Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(newPassword, saltRounds);

    // Step 3: Update the password in the database
    const client = await pool.connect();
    try {
      const updateQuery = `
        UPDATE usuarios 
        SET contraseña = $1 
        WHERE correo = $2
      `;
      
      const result = await client.query(updateQuery, [hashedPassword, email]);

      // Check if a row was actually updated
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      return res.status(200).json({ message: 'Contraseña actualizada con éxito' });
    } finally {
      client.release(); // Always release the client back to the pool
    }

  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    return res.status(500).json({ 
      error: 'Error al actualizar la contraseña', 
      details: error.message 
    });
  }
};
// Función para verificar si el correo electrónico ya existe
export const checkEmailExists = async (correo) => {
  if (!correo) {
      throw new Error('El correo electrónico es requerido.');
  }
  try {
      const client = await pool.connect();
      const result = await client.query(
          'SELECT COUNT(*) FROM usuarios WHERE correo = $1',
          [correo]
      );
      client.release();

      return parseInt(result.rows[0].count, 10) > 0; // Devuelve true si existe, false si no
  } catch (error) {
      console.error('Error en checkEmailExists:', error);
      throw new Error('Error en la base de datos al verificar el correo electrónico.');
  }
};


export const crearUsuario = async (req, res) => {
  const { fullName, email, password, role } = req.body;
  
  console.log('Datos recibidos en el backend:', req.body); // Verificar qué datos están llegando

  // Cifrar la contraseña
  const salt = await bcryptjs.genSalt(10); // Genera un "salt" con 10 rondas de cifrado
  const hashedPassword = await bcryptjs.hash(password, salt); // Cifra la contraseña

  try {
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, correo, contraseña, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, 
      [fullName, email, hashedPassword, role] // Usamos la contraseña cifrada
    );
    res.status(201).json(result.rows[0]); // Devuelve el usuario creado
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario', details: error.message });
  }
};

// Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');  // Obtiene todos los usuarios
    res.status(200).json(result.rows);  // Devuelve los usuarios
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios', details: error.message });
  }
};

export const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM usuarios WHERE id = $1 RETURNING *`, 
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si hay registros en la tabla y ajustar la secuencia
    const checkEmpty = await pool.query(`SELECT COUNT(*) FROM usuarios`);
    if (checkEmpty.rows[0].count == 0) {
      // Si está vacía, reiniciar desde 1
      await pool.query(`ALTER SEQUENCE usuarios_id_seq RESTART WITH 1`);
    } else {
      // Ajustar la secuencia al valor máximo actual de ID
      await pool.query(`SELECT setval('usuarios_id_seq', COALESCE((SELECT MAX(id) FROM usuarios), 0))`);
    }

    res.status(200).json({ message: "Usuario eliminado y secuencia ajustada", usuario: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};

export const editarPerfil = async (req, res) => {
  const { id } = req.params; // Obtener el ID del usuario desde los parámetros de la URL
  const { fullName, email, password, role } = req.body; // Los nuevos datos del usuario

  try {
    // Consulta SQL para actualizar los datos del usuario
    const result = await pool.query(
      `UPDATE usuarios SET fullName = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING *`,
      [fullName, email, password, role, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Respuesta con los datos actualizados
    res.status(200).json({ message: "Perfil actualizado", usuario: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar el perfil del usuario:', error);
    res.status(500).json({ message: "Error al actualizar el perfil del usuario" });
  }
};

export const editarArticulo = async (req, res) => {
  const { id } = req.params; // ID del artículo a editar
  const { producto, cantidad, modulo, estante, estado, entrada, salida } = req.body; // Datos enviados desde el cliente

  try {
    // Actualiza el artículo y recalcula el campo restante en la consulta
    const result = await pool.query(
      `UPDATE articulos_almacenamiento 
       SET 
         producto = $1, 
         cantidad = $2, 
         modulo = $3, 
         estante = $4, 
         estado = $5, 
         entrada = $6, 
         salida = $7, 
         restante = cantidad + $6 - $7 
       WHERE id = $8 
       RETURNING *`, // Devuelve el artículo actualizado
      [producto, cantidad, modulo, estante, estado, entrada, salida, id]
    );

    // Verifica si se actualizó algún artículo
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    // Devuelve el artículo actualizado
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al editar el artículo:', error);
    res.status(500).json({ message: 'Error al editar el artículo' });
  }
};



export const getReporteGeneral = async (req, res) => {
  try {
    // Consulta para obtener los movimientos de la tabla movimientos_almacen
    const query = `
      SELECT 
        id, 
        fecha, 
        cantidad_productos, 
        tipo_movimiento 
      FROM movimientos_almacen
      ORDER BY fecha DESC; 
    `;

    // Ejecutar la consulta
    const result = await pool.query(query);

    // Mapear los resultados para obtener el número de productos
    const reporteGeneral = result.rows.map(row => {
      // Verificar si 'cantidad_productos' no es null o vacío
      const cantidadProductos = row.cantidad_productos 
        ? row.cantidad_productos.split(',').length // Contar el número de productos (registros)
        : 0; // Si no tiene productos, asignar 0

      // Determinar el estado según el tipo de movimiento (1 = salida, 2 = entrada)
      const estado = row.tipo_movimiento === 2 ? 'Entrada' : 'Salida'; // Entrada es activo, salida es inactivo

      // Formatear la fecha en día/mes/año y la hora en formato 12 horas
      const fecha = new Date(row.fecha);
      const fechaEntrada = fecha.toLocaleDateString('es-ES'); // Fecha en formato día/mes/año
       // Hora en formato 12 horas

      return {
        id: row.id,
        fechaEntrada, // Fecha de entrada
      
        cantidadProductos, // Número de productos (cantidad de registros)
   
        estado, // Estado (activo o inactivo)
      };
    });

    // Enviar el reporte general como respuesta
    res.status(200).json(reporteGeneral);
  } catch (error) {
    console.error('Error al obtener el reporte general:', error);
    res.status(500).json({ error: 'Error al obtener el reporte general' });
  }
};

export const getArticulos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articulos_almacenamiento ORDER BY id ASC');
    res.status(200).json(result.rows); // Devuelve todos los artículos almacenados en orden
  } catch (error) {
    console.error('Error al obtener los artículos', error);
    res.status(500).json({ message: 'Error al obtener los artículos' });
  }
};

// Controlador para obtener los detalles de un movimiento específico
export const getDetallesMovimiento = async (req, res) => {
  const { id } = req.params; // Obtener el id desde los parámetros de la URL

  try {
    // Obtener el movimiento con el ID especificado
    const query = `
      SELECT id_productos, cantidad_productos, fecha, solicitante, nombre_productos
      FROM movimientos_almacen
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    const { id_productos, cantidad_productos, fecha, solicitante, nombre_productos } = result.rows[0];

    // Formatear la fecha para mostrar en formato día/mes/año
    const formattedDate = new Date(fecha).toLocaleDateString('es-ES');

    // Convertir `id_productos` y `cantidad_productos` a arrays
    const idArray = id_productos ? id_productos.split(',') : [];
    const cantidadArray = cantidad_productos
      ? cantidad_productos.split(',').map((cantidad) => parseInt(cantidad, 10))
      : [];

    // Obtener los nombres de los productos directamente desde el campo `nombre_productos`
    const nombreArray = nombre_productos ? nombre_productos.split(',') : [];

    // Crear los detalles del movimiento
    const detalles = idArray.map((id, index) => ({
      fechaSolicitud: formattedDate,
      producto: nombreArray[index] || `Producto ${index + 1}`, // Usar nombre de producto guardado o fallback
      cantidad: cantidadArray[index] || 0,
      fechaEntrega: formattedDate, // Usar la misma fecha de solicitud como ejemplo
      firmaEntrega: solicitante || 'Firma de responsable', // Usar el nombre del solicitante
    }));

    res.status(200).json(detalles);
  } catch (error) {
    console.error('Error al obtener los detalles del movimiento:', error);
    res.status(500).json({ error: 'Error al obtener los detalles del movimiento' });
  }
};

// Función para actualizar el movimiento
export const updateMovimiento = async (req, res) => {
  const { id } = req.params;
  const { id_productos, cantidad_productos, fecha, solicitante, nombre_productos } = req.body;

  try {
    const query = `
      UPDATE movimientos_almacen
      SET id_productos = $1, cantidad_productos = $2, fecha = $3, solicitante = $4, nombre_productos = $5
      WHERE id = $6
      RETURNING *;
    `;
    const result = await pool.query(query, [
      id_productos,
      cantidad_productos,
      fecha,
      solicitante,
      nombre_productos,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    res.status(200).json({ message: 'Movimiento actualizado', movimiento: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar el movimiento:', error);
    res.status(500).json({ error: 'Error al actualizar el movimiento' });
  }
};

// Función para eliminar el movimiento
export const deleteMovimiento = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM movimientos_almacen WHERE id = $1 RETURNING *;';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    res.status(200).json({ message: 'Movimiento eliminado', movimiento: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar el movimiento:', error);
    res.status(500).json({ error: 'Error al eliminar el movimiento' });
  }
};

// Endpoint para obtener el último ID insertado
export const getLastId = async (req, res) => {
  try {
    const result = await pool.query('SELECT id FROM articulos_almacenamiento ORDER BY id DESC LIMIT 1');
    if (result.rows.length > 0) {
      res.status(200).json({ id: result.rows[0].id });
    } else {
      res.status(200).json({ id: 0 });  // Si no hay registros, devuelve 0
    }
  } catch (err) {
    console.error('Error al obtener el último ID:', err);
    res.status(500).json({ error: 'Error al obtener el último ID' });
  }
};

export const deleteArticulo = async (req, res) => {
  const { id } = req.params;
  try {
    // Eliminar el artículo de la base de datos
    const result = await pool.query('DELETE FROM articulos_almacenamiento WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `Artículo con id ${id} no encontrado` });
    }

    res.status(200).json({ message: `Artículo con id ${id} eliminado` });
  } catch (error) {
    console.error('Error al eliminar el artículo', error);
    res.status(500).json({ message: 'Error al eliminar el artículo' });
  }
};

export const getProductos = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, codigo, producto FROM articulos_almacenamiento');
    res.status(200).json(result.rows); // Devuelve todos los productos con su id y nombre
  } catch (error) {
    console.error('Error al obtener los productos', error);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
};

// Backend - createMovimiento.js
export const createMovimiento = async (req, res) => {
  const { tipo_movimiento, solicitante, id_productos, cantidad_productos, rol, nombre_productos } = req.body;
  
  // Validaciones iniciales
  if (!tipo_movimiento || !solicitante || !id_productos || !cantidad_productos || !rol) {
    return res.status(400).json({ 
      error: 'Todos los campos son requeridos',
      received: { tipo_movimiento, solicitante, id_productos, cantidad_productos, rol }
    });
  }
  
  try {
    await pool.query('BEGIN');

    try {
      // 1. Obtener los nombres de los productos
      const productosIds = id_productos.split(',').map(id => parseInt(id, 10));
      const nombresProductos = await obtenerNombresProductos(productosIds);
      
      // 2. Crear el registro del movimiento
      const movimientoQuery = `
      INSERT INTO movimientos_almacen (tipo_movimiento, solicitante, id_productos, cantidad_productos, rol, nombre_productos)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;
      `;
      const movimientoValues = [tipo_movimiento, solicitante, id_productos, cantidad_productos, rol, nombresProductos.join(',')];
      const movimientoResult = await pool.query(movimientoQuery, movimientoValues);

      // 3. Procesar los productos
      const cantidades = cantidad_productos.split(',').map(cantidad => parseInt(cantidad, 10));

      if (productosIds.length !== cantidades.length) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ error: 'Los IDs de productos y las cantidades no coinciden' });
      }

      // 4. Actualizar cada producto
      for (let i = 0; i < productosIds.length; i++) {
        const productoId = productosIds[i];
        const cantidad = cantidades[i];

        // Obtener estado actual del producto
        const stockQuery = `
          SELECT cantidad, entrada, salida, restante 
          FROM articulos_almacenamiento 
          WHERE id = $1 FOR UPDATE;
        `;
        const stockResult = await pool.query(stockQuery, [productoId]);

        if (stockResult.rows.length === 0) {
          await pool.query('ROLLBACK');
          return res.status(404).json({ error: `Producto ${productoId} no encontrado` });
        }

        const currentStock = stockResult.rows[0];

        if (tipo_movimiento === 2) { // Entrada
          // Calcular nuevos valores para entrada
          const nuevaEntrada = (currentStock.entrada || 0) + cantidad;
          const nuevaCantidad = currentStock.cantidad + cantidad; // MODIFICACIÓN: Incrementar cantidad
          const nuevaSalida = currentStock.salida || 0;
          const nuevoRestante = nuevaEntrada - nuevaSalida;
        
          const updateQuery = `
            UPDATE articulos_almacenamiento
            SET 
              entrada = $1,
              cantidad = $2,  -- Modificar cantidad
              salida = $3,
              restante = $4
            WHERE id = $5;
          `;
          await pool.query(updateQuery, [
            nuevaEntrada,
            nuevaCantidad,  // Usar la nueva cantidad incrementada
            nuevaSalida,
            nuevoRestante,
            productoId
          ]);
        
        } 
        else if (tipo_movimiento === 1) { // Salida
          // Verificar si hay suficiente stock disponible
          const stockDisponible = currentStock.cantidad; // Usar cantidad en lugar de (entrada - salida)
  
          if (stockDisponible < cantidad) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ 
              error: `Stock insuficiente para el producto ${productoId}. 
                     Stock disponible: ${stockDisponible}, 
                     Cantidad solicitada: ${cantidad}` 
            });
          }
        
          // Calcular nuevos valores para salida
          const nuevaSalida = (currentStock.salida || 0) + cantidad;
          const nuevaCantidad = currentStock.cantidad - cantidad; // Reducir la cantidad
          const nuevaEntrada = currentStock.entrada || 0;
          const nuevoRestante = nuevaEntrada - nuevaSalida;
        
          const updateQuery = `
            UPDATE articulos_almacenamiento
            SET 
              salida = $1,
              cantidad = $2,
              entrada = $3,
              restante = $4
            WHERE id = $5;
          `;
          await pool.query(updateQuery, [
            nuevaSalida,
            nuevaCantidad, // Cantidad reducida
            nuevaEntrada,
            nuevoRestante,
            productoId
          ]);
        }
      }

      await pool.query('COMMIT');

      res.status(201).json({
        message: 'Movimiento registrado exitosamente',
        movimiento: movimientoResult.rows[0]
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error en la operación:', error);
    res.status(500).json({ error: 'Error al procesar el movimiento' });
  }
};

// Función para obtener los nombres de los productos
const obtenerNombresProductos = async (productosIds) => {
  const query = `
    SELECT producto
    FROM articulos_almacenamiento
    WHERE id = ANY($1::int[]);
  `;
  const result = await pool.query(query, [productosIds]);
  return result.rows.map(row => row.producto);
};


// Función para obtener todos los movimientos
export const getMovimientos = async (req, res) => {
  try {
    // Realizamos la consulta a la base de datos
    const result = await pool.query(`
      SELECT 
        m.id,
        m.fecha,
        m.cantidad,
        m.tipo_registro,
        a.estado
      FROM 
        movimientos_almacen m
      JOIN 
        articulos_almacenamiento a ON m.articulo_id = a.id
      ORDER BY 
        m.fecha DESC;
    `);
    
    // Retornamos los resultados como JSON
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los movimientos:', error);
    res.status(500).send('Error en el servidor');
  }
};


export const createArticulo = async (req, res) => {
  const { id, modulo, estante, producto, cantidad, estado } = req.body;

  // Validaciones
  if (!modulo || !estante || !producto || cantidad === undefined || !estado) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const client = await pool.connect();

  try {
    // Verificar si ya existe un artículo con los mismos valores de modulo, estante y producto
    const checkArticuloQuery = `
    SELECT * FROM articulos_almacenamiento
    WHERE producto = $1 
`;
const checkResult = await client.query(checkArticuloQuery, [producto]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe un artículo con el mismo nombre' });
    }

    // Iniciar transacción
    await client.query('BEGIN');

    // Insertar el nuevo artículo
    const insertArticuloQuery = `
    INSERT INTO articulos_almacenamiento 
      (id, modulo, estante, producto, cantidad, cantidad_productos, estado, entrada, salida, restante)
    VALUES ($1, $2, $3, $4, $5, $5, $6, 0, 0, 0)
    RETURNING id, modulo, estante, producto, cantidad, cantidad_productos, estado, created_at
  `;
    const result = await client.query(insertArticuloQuery, [id, modulo, estante, producto, cantidad, estado]);

    // Confirmar transacción
    await client.query('COMMIT');

    // Responder con el artículo insertado
    res.status(201).json({
      message: 'Artículo creado con éxito',
      articulo: result.rows[0],
    });
  } catch (err) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    
    console.error('Error al crear el artículo:', err);
    res.status(500).json({ error: 'Error al crear el artículo' });
  } finally {
    // Liberar el cliente
    client.release();
  }
};


export const loginUser = async (correo, contraseña) => {
  try {
    const client = await pool.connect();

    const result = await client.query(
      'SELECT id, correo, contraseña, nombre, rol FROM usuarios WHERE correo = $1', 
      [correo]
    );
    console.log(result); 
    client.release();

    if (result.rows.length > 0) {
      const user = result.rows[0];

      if (!user.contraseña) {
        console.error('Error: contraseña no encontrada en la base de datos');
        return null;
      }

      const match = await bcryptjs.compare(contraseña, user.contraseña);
      if (match) {
        const token = jwt.sign(
          { id: user.id, rol: user.rol, correo: user.correo },
          'tu_clave_secreta',
          { expiresIn: '1h' }
        );
        return { 
          id: user.id,  
          correo: user.correo,
          rol: user.rol,
          nombre: user.nombre,
          token
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, currentPassword, newPassword, nombre = null, correo = null) => {
  const client = await pool.connect();

  try {
    // First, verify the current password
    const userVerificationQuery = 'SELECT contraseña FROM usuarios WHERE id = $1';
    const userVerificationResult = await client.query(userVerificationQuery, [userId]);

    if (userVerificationResult.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    const storedHashedPassword = userVerificationResult.rows[0].contraseña;
    
    // Verify current password
    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, storedHashedPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Prepare update query
    let query = '';
    let values = [];

    // Hash new password if provided
    const hashedNewPassword = newPassword ? await bcryptjs.hash(newPassword, 10) : null;

    // Construct dynamic update query
    const updateFields = [];
    const queryValues = [];
    let paramCount = 1;

    if (nombre) {
      updateFields.push(`nombre = $${paramCount}`);
      queryValues.push(nombre);
      paramCount++;
    }
    if (correo) {
      updateFields.push(`correo = $${paramCount}`);
      queryValues.push(correo);
      paramCount++;
    }
    if (hashedNewPassword) {
      updateFields.push(`contraseña = $${paramCount}`);
      queryValues.push(hashedNewPassword);
      paramCount++;
    }

    queryValues.push(userId);

    query = `
      UPDATE usuarios 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, correo, nombre
    `;

    const result = await client.query(query, queryValues);

    // Generate a new token
    const updatedUser = result.rows[0];
    const token = jwt.sign(
      { 
        id: updatedUser.id, 
        correo: updatedUser.correo,
        ...(updatedUser.nombre && { nombre: updatedUser.nombre }) 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      user: updatedUser,
      token
    };
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    throw error;
  } finally {
    client.release();
  }
};