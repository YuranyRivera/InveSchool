import { pool } from '../../config/database.js';

export const updateTransfer = async (req, res) => {
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

export const deleteTransfer = async (req, res) => {
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

export const listTransfers = async (req, res) => {
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
export const createTransfer = async (req, res) => {
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
