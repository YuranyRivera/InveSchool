/**
 * Carga datos de ejemplo para la demo pública del portafolio.
 *
 * Uso:  npm run db:seed
 *
 * Es idempotente: si los datos de ejemplo ya existen, no los duplica.
 * Requiere que las migraciones de database/migrations ya estén aplicadas.
 */
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { pool } from '../../src/config/database.js';
import { BCRYPT_ROUNDS, DEMO_ROLE } from '../../src/utils/validation.js';

const DEMO_EMAIL = (process.env.DEMO_EMAIL || 'demo@inveschool.app').toLowerCase();
const SEED_MARKER = 'Portátil Lenovo ThinkPad E14'; // si existe, el inventario de ejemplo ya fue cargado

// Fecha relativa a hoy (días hacia atrás), en formato YYYY-MM-DD.
const daysAgo = (days) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

const ARTICULOS_ADMINISTRATIVOS = [
  ['Portátil Lenovo ThinkPad E14', 'Tecnología Andina S.A.S.', 'Sala de sistemas 1', 3_200_000, 410],
  ['Portátil Lenovo ThinkPad E14', 'Tecnología Andina S.A.S.', 'Sala de sistemas 1', 3_200_000, 410],
  ['Computador Dell OptiPlex 7010', 'Tecnología Andina S.A.S.', 'Contabilidad', 2_750_000, 380],
  ['Computador Dell OptiPlex 7010', 'Tecnología Andina S.A.S.', 'Secretaría académica', 2_750_000, 380],
  ['Proyector Epson PowerLite W49', 'Audiovisuales Pro', 'Aula 201', 2_450_000, 350],
  ['Proyector Epson PowerLite W49', 'Audiovisuales Pro', 'Aula 302', 2_450_000, 300],
  ['Televisor Samsung 55" Crystal UHD', 'Electro Hogar Colombia', 'Sala audiovisual', 2_300_000, 280],
  ['Impresora multifuncional HP LaserJet', 'Tecnología Andina S.A.S.', 'Recepción', 1_150_000, 260],
  ['Router Wi-Fi 6 TP-Link Archer AX55', 'Tecnología Andina S.A.S.', 'Sala de sistemas 2', 480_000, 240],
  ['Aire acondicionado 12.000 BTU', 'Electro Hogar Colombia', 'Sala de sistemas 2', 1_890_000, 220],
  ['Escritorio ejecutivo en L', 'Muebles & Oficinas Ltda.', 'Rectoría', 850_000, 200],
  ['Silla ergonómica con apoyo lumbar', 'Muebles & Oficinas Ltda.', 'Rectoría', 420_000, 200],
  ['Silla ergonómica con apoyo lumbar', 'Muebles & Oficinas Ltda.', 'Coordinación académica', 420_000, 190],
  ['Archivador metálico de 4 gavetas', 'Muebles & Oficinas Ltda.', 'Tesorería', 690_000, 170],
  ['Mesa de reuniones para 8 personas', 'Muebles & Oficinas Ltda.', 'Sala de profesores', 1_200_000, 150],
  ['Tablero acrílico 240 x 120 cm', 'Distribuidora Escolar del Valle', 'Aula 101', 380_000, 140],
  ['Microscopio binocular 1000x', 'Distribuidora Escolar del Valle', 'Laboratorio de ciencias', 1_250_000, 120],
  ['Estantería metálica para libros', 'Muebles & Oficinas Ltda.', 'Biblioteca', 560_000, 100],
  ['Camilla de enfermería plegable', 'Distribuidora Escolar del Valle', 'Enfermería', 980_000, 80],
  ['Nevera Haceb 250 L', 'Electro Hogar Colombia', 'Cafetería', 1_400_000, 60],
  ['Parlante JBL PartyBox 110', 'Audiovisuales Pro', 'Auditorio', 1_650_000, 35],
  ['UPS 1500 VA para servidor', 'Tecnología Andina S.A.S.', 'Sala de sistemas 1', 750_000, 12],
];

// [descripción, proveedor, ubicación, precio, días atrás, motivo de la baja]
const BAJAS_ADMINISTRATIVAS = [
  ['Monitor LG 19" (pantalla dañada)', 'Tecnología Andina S.A.S.', 'Contabilidad', 380_000, 900, 'Pantalla con líneas, reparación no viable'],
  ['Silla interlocutora', 'Muebles & Oficinas Ltda.', 'Recepción', 160_000, 820, 'Estructura fracturada'],
  ['Proyector Sony VPL (sin lámpara)', 'Audiovisuales Pro', 'Aula 203', 1_900_000, 760, 'Fin de vida útil; repuesto descontinuado'],
];

// [ubicación inicial, índice del artículo trasladado, responsable, días atrás]
const TRASLADOS = [
  ['Sala de sistemas 2', 0, 'Andrea Gómez', 95],
  ['Aula 103', 4, 'Carlos Ramírez', 70],
  ['Biblioteca', 5, 'Carlos Ramírez', 44],
  ['Sala de profesores', 12, 'Laura Martínez', 21],
  ['Almacén', 17, 'Andrea Gómez', 9],
];

// [producto, cantidad inicial, entradas, salidas, módulo, estante, estado]
const PRODUCTOS_ALMACEN = [
  ['Resma de papel carta 75 g', 40, 60, 72, 'A', '1', 'Bueno'],
  ['Marcador borrable negro', 120, 60, 95, 'A', '2', 'Bueno'],
  ['Marcador borrable azul', 120, 0, 64, 'A', '2', 'Bueno'],
  ['Tóner HP 105A', 6, 4, 7, 'A', '3', 'Bueno'],
  ['Cinta de enmascarar 1"', 30, 20, 26, 'A', '4', 'Bueno'],
  ['Carpeta legajadora', 200, 0, 85, 'B', '1', 'Bueno'],
  ['Cartulina blanca pliego', 150, 50, 120, 'B', '2', 'Bueno'],
  ['Pegante en barra 40 g', 60, 30, 48, 'B', '3', 'Bueno'],
  ['Jabón líquido para manos (galón)', 12, 12, 15, 'C', '1', 'Bueno'],
  ['Papel higiénico institucional', 48, 48, 70, 'C', '1', 'Bueno'],
  ['Desinfectante multiusos (galón)', 10, 10, 14, 'C', '2', 'Bueno'],
  ['Bolsa de basura negra x10', 80, 40, 90, 'C', '2', 'Bueno'],
  ['Escoba de cerdas suaves', 8, 4, 3, 'C', '3', 'Bueno'],
  ['Bombillo LED 12 W', 24, 0, 9, 'D', '1', 'Bueno'],
  ['Extensión eléctrica 5 m', 10, 0, 4, 'D', '2', 'Bueno'],
  ['Pilas AA x4', 30, 10, 22, 'D', '3', 'Bueno'],
];

// [tipo (1 salida, 2 entrada), solicitante, días atrás, [[índice producto, cantidad], ...]]
const MOVIMIENTOS = [
  [2, 'Compras institucionales', 62, [[0, 60], [1, 60], [6, 50]]],
  [1, 'Sala de profesores', 55, [[0, 20], [1, 30], [2, 20]]],
  [1, 'Coordinación académica', 47, [[5, 40], [7, 18]]],
  [2, 'Compras institucionales', 40, [[8, 12], [9, 48], [10, 10], [11, 40]]],
  [1, 'Servicios generales', 31, [[8, 9], [9, 40], [10, 8], [11, 60]]],
  [1, 'Secretaría académica', 24, [[0, 25], [3, 4]]],
  [2, 'Compras institucionales', 16, [[3, 4], [4, 20], [15, 10]]],
  [1, 'Aula 201', 9, [[1, 35], [2, 24], [7, 15]]],
  [1, 'Auditorio', 3, [[13, 6], [14, 4], [15, 12]]],
];

// [producto, motivo, usuario, cantidad, días atrás]
const BAJAS_ALMACEN = [
  ['Escoba de cerdas suaves', 'Desgaste por uso', 'Servicios generales', 2, 27],
  ['Bombillo LED 12 W', 'Producto defectuoso de fábrica', 'Laura Martínez', 3, 6],
];

/**
 * Los triggers registran la actividad con la hora de inserción (todas iguales al cargar el demo).
 * Esta consulta le asigna a cada evento la fecha real de su registro de origen.
 */
const ALIGN_ACTIVITY_DATES = `
  UPDATE ultimo_registro u SET fecha_registro = src.fecha, fecha = src.fecha::date
  FROM (
    SELECT 'Artículo administrativo' AS tipo, id, fecha::timestamp + time '09:30' AS fecha FROM articulos_administrativos
    UNION ALL SELECT 'Traslado', id, fecha::timestamp + time '11:15' FROM traslados
    UNION ALL SELECT 'Baja administrativa', id, fecha_baja::timestamp + time '15:40' FROM articulos_baja
    UNION ALL SELECT 'Almacén', id, created_at FROM articulos_almacenamiento
    UNION ALL SELECT 'Movimiento', id, fecha FROM movimientos_almacen
    UNION ALL SELECT 'Baja de almacén', id, fecha_baja FROM articulos_baja_historial
  ) src
  WHERE u.tipo_tabla = src.tipo AND u.tabla_origen_id = src.id
`;

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 0) La app inserta algunos IDs manualmente, así que los contadores SERIAL pueden estar atrasados.
    //    Se sincronizan con el ID máximo de cada tabla para evitar choques de llave primaria.
    const { rows: tables } = await client.query(
      `SELECT table_name FROM information_schema.columns
        WHERE table_schema = 'public' AND column_name = 'id' AND column_default LIKE 'nextval%'`
    );
    for (const { table_name: table } of tables) {
      await client.query(
        `SELECT setval(pg_get_serial_sequence($1, 'id'), COALESCE((SELECT MAX(id) FROM ${client.escapeIdentifier(table)}), 0) + 1, false)`,
        [`public.${table}`]
      );
    }

    // 1) Usuario de demo con contraseña aleatoria que nadie conoce: solo se entra por /api/demo-login.
    const demo = await client.query('SELECT id FROM usuarios WHERE LOWER(correo) = $1', [DEMO_EMAIL]);
    if (demo.rowCount === 0) {
      const hash = await bcryptjs.hash(crypto.randomBytes(32).toString('hex'), BCRYPT_ROUNDS);
      await client.query('INSERT INTO usuarios (nombre, correo, "contraseña", rol) VALUES ($1, $2, $3, $4)', [
        'Visitante Demo',
        DEMO_EMAIL,
        hash,
        DEMO_ROLE,
      ]);
      console.log(`✓ Usuario demo creado (${DEMO_EMAIL})`);
    } else {
      console.log('• Usuario demo ya existía');
    }

    const seeded = await client.query('SELECT 1 FROM articulos_administrativos WHERE descripcion = $1 LIMIT 1', [SEED_MARKER]);
    if (seeded.rowCount > 0) {
      console.log('• El inventario de ejemplo ya estaba cargado; no se duplica.');
      await client.query('COMMIT');
      return;
    }

    // 2) Artículos administrativos.
    const adminIds = [];
    for (const [descripcion, proveedor, ubicacion, precio, dias] of ARTICULOS_ADMINISTRATIVOS) {
      const { rows } = await client.query(
        `INSERT INTO articulos_administrativos (fecha, descripcion, proveedor, ubicacion, precio)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [daysAgo(dias), descripcion, proveedor, ubicacion, precio]
      );
      adminIds.push(rows[0].id);
    }
    console.log(`✓ ${adminIds.length} artículos administrativos`);

    // 3) Traslados (la ubicación final es la ubicación actual del artículo).
    for (const [origen, index, responsable, dias] of TRASLADOS) {
      const destino = ARTICULOS_ADMINISTRATIVOS[index][2];
      await client.query(
        `INSERT INTO traslados (responsable, fecha, ubicacion_inicial, ubicacion_final, id_articulo)
         VALUES ($1, $2, $3, $4, $5)`,
        [responsable, daysAgo(dias), origen, destino, adminIds[index]]
      );
    }
    console.log(`✓ ${TRASLADOS.length} traslados`);

    // 4) Bajas administrativas: se crean y se eliminan; el trigger las registra en articulos_baja.
    for (const [descripcion, proveedor, ubicacion, precio, dias, motivo] of BAJAS_ADMINISTRATIVAS) {
      const { rows } = await client.query(
        `INSERT INTO articulos_administrativos (fecha, descripcion, proveedor, ubicacion, precio, observacion)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [daysAgo(dias), descripcion, proveedor, ubicacion, precio, motivo]
      );
      await client.query('DELETE FROM articulos_administrativos WHERE id = $1', [rows[0].id]);
      await client.query('UPDATE articulos_baja SET fecha_baja = $1 WHERE id_articulo = $2', [daysAgo(dias - 400), rows[0].id]);
    }
    console.log(`✓ ${BAJAS_ADMINISTRATIVAS.length} bajas administrativas`);

    // 5) Productos de almacén (cantidad actual = inicial + entradas - salidas).
    const productIds = [];
    for (const [producto, inicial, entradas, salidas, modulo, estante, estado] of PRODUCTOS_ALMACEN) {
      const { rows } = await client.query(
        `INSERT INTO articulos_almacenamiento
           (modulo, estante, producto, cantidad, cantidad_productos, estado, entrada, salida, restante, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [modulo, estante, producto, inicial + entradas - salidas, inicial, estado, entradas, salidas, entradas - salidas, daysAgo(75)]
      );
      productIds.push(rows[0].id);
    }
    console.log(`✓ ${productIds.length} productos de almacén`);

    // 6) Movimientos de almacén.
    for (const [tipo, solicitante, dias, items] of MOVIMIENTOS) {
      await client.query(
        `INSERT INTO movimientos_almacen
           (tipo_movimiento, solicitante, cantidad_productos, rol, id_productos, articulo_id, nombre_producto, nombre_productos, fecha)
         VALUES ($1, $2, $3, 'almacenamiento', $4, $5, $6, $7, $8)`,
        [
          tipo,
          solicitante,
          items.map(([, cantidad]) => cantidad).join(','),
          items.map(([i]) => productIds[i]).join(','),
          productIds[items[0][0]],
          PRODUCTOS_ALMACEN[items[0][0]][0],
          items.map(([i]) => PRODUCTOS_ALMACEN[i][0]).join(','),
          daysAgo(dias),
        ]
      );
    }
    console.log(`✓ ${MOVIMIENTOS.length} movimientos de almacén`);

    // 7) Bajas de almacén (historial).
    for (const [producto, motivo, usuario, cantidad, dias] of BAJAS_ALMACEN) {
      const index = PRODUCTOS_ALMACEN.findIndex(([nombre]) => nombre === producto);
      await client.query(
        `INSERT INTO articulos_baja_historial (id_articulo, producto, motivo_baja, usuario_baja, cantidad, codigo, fecha_baja)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [productIds[index], producto, motivo, usuario, cantidad, `ALM-${String(productIds[index]).padStart(5, '0')}`, daysAgo(dias)]
      );
    }
    console.log(`✓ ${BAJAS_ALMACEN.length} bajas de almacén`);

    await client.query(ALIGN_ACTIVITY_DATES);
    // Los artículos creados solo para darlos de baja ya no existen: su evento de "alta" sobra.
    await client.query(
      `DELETE FROM ultimo_registro
        WHERE tipo_tabla = 'Artículo administrativo'
          AND tabla_origen_id NOT IN (SELECT id FROM articulos_administrativos)`
    );
    console.log('✓ Fechas de la actividad reciente alineadas');

    await client.query('COMMIT');
    console.log('Listo: datos de ejemplo cargados.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

run().catch((error) => {
  console.error('Error al cargar los datos de ejemplo:', error.message);
  process.exit(1);
});
