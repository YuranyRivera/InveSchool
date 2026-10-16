import { pool } from '../../config/database.js';

export const listProductsBySupplier = async (req, res) => {
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

export const getSupplierStats = async (req, res) => {
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

export const listSuppliers = async (req, res) => {
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
      message: "Error al obtener los proveedores"
    });
  }
};
