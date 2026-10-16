import { pool } from '../../config/database.js';

export const updateStorageArticle = async (req, res) => {
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

export const listStorageArticles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articulos_almacenamiento ORDER BY id ASC');
    res.status(200).json(result.rows); // Devuelve todos los artículos almacenados en orden
  } catch (error) {
    console.error('Error al obtener los artículos', error);
    res.status(500).json({ message: 'Error al obtener los artículos' });
  }
};

// Endpoint para obtener el último ID insertado
export const getLastStorageArticleId = async (req, res) => {
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

export const deleteStorageArticle = async (req, res) => {
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

export const listStorageProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, codigo, producto FROM articulos_almacenamiento');
    res.status(200).json(result.rows); // Devuelve todos los productos con su id y nombre
  } catch (error) {
    console.error('Error al obtener los productos', error);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
};

export const createStorageArticle = async (req, res) => {
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
