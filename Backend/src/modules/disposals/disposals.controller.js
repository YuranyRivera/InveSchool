import fs from 'fs';
import cloudinary from '../../config/cloudinary.js';
import { pool } from '../../config/database.js';

export const disposeStorageArticle = async (req, res) => {
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
        return res.status(500).json({ message: 'Error al subir la imagen' });
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
      message: 'Error al eliminar el artículo'
    });
  }
};

export const deleteStorageDisposal = async (req, res) => {
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
      message: 'Error al eliminar el artículo del historial'
    });
  }
};

export const deleteAdministrativeDisposal = async (req, res) => {
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
      message: 'Error al eliminar el artículo'
    });
  }
};

export const listAdministrativeDisposals = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articulos_baja ORDER BY id ASC'); // Consulta SQL
    res.status(200).json(result.rows); // Devuelve los resultados en formato JSON
  } catch (error) {
    console.error('Error al obtener los artículos dados de baja:', error);
    res.status(500).json({
      message: 'Error al obtener los artículos dados de baja'
    });
  }
};

export const listStorageDisposals = async (req, res) => {
  try {
    const result = await pool.query(   'SELECT * FROM articulos_baja_historial ORDER BY id ASC '); // Consulta SQL a la tabla correcta
    res.status(200).json(result.rows); // Devuelve los resultados en formato JSON
  } catch (error) {
    console.error('Error al obtener los artículos dados de baja del historial:', error);
    res.status(500).json({
      message: 'Error al obtener los artículos dados de baja del historial'
    });
  }
};
