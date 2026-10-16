import { pool } from '../../config/database.js';

// Controlador para obtener productos según la ubicación
export const listArticlesByLocation = async (req, res) => {
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

export const updateAdministrativeArticle = async (req, res) => {
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

export const disposeAdministrativeArticle = async (req, res) => {
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

export const listAdministrativeArticles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articulos_administrativos ORDER BY id ASC');
    res.status(200).json(result.rows); // Devuelve todos los artículos administrativos en orden ascendente por ID
  } catch (error) {
    console.error('Error al obtener los artículos administrativos', error);
    res.status(500).json({ message: 'Error al obtener los artículos administrativos' });
  }
};

// Endpoint para obtener el último ID insertado en articulos_administrativos
export const getLastAdministrativeArticleId = async (req, res) => {
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
export const createAdministrativeArticle = async (req, res) => {
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
