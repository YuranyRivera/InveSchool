import { pool } from '../../config/database.js';

export const deleteMovementRecord = async (req, res) => {
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
      message: 'Error al eliminar el movimiento'
    });
  }
};

export const listMovementSummaries = async (req, res) => {
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

// Controlador para obtener los detalles de un movimiento específico
export const getMovementDetails = async (req, res) => {
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
export const updateMovement = async (req, res) => {
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
export const deleteMovement = async (req, res) => {
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

// Backend - createMovement.js
export const createMovement = async (req, res) => {
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
      const nombresProductos = await getProductNames(productosIds);
      
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
const getProductNames = async (productosIds) => {
  const query = `
    SELECT producto
    FROM articulos_almacenamiento
    WHERE id = ANY($1::int[]);
  `;
  const result = await pool.query(query, [productosIds]);
  return result.rows.map(row => row.producto);
};
