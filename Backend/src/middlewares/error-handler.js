/** 404 para cualquier ruta que no existe. */
export const notFound = (req, res) => res.status(404).json({ error: 'Recurso no encontrado' });

/**
 * Manejador de errores: registra el detalle en el servidor, pero nunca lo expone al cliente.
 * Express lo reconoce como manejador de errores por tener 4 parámetros.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  console.error(`[${req.method} ${req.originalUrl}]`, err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: status < 500 ? err.message : 'Error interno del servidor' });
};
