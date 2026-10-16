// Variables mínimas para que la configuración (src/config/env.js) cargue en las pruebas.
// Las pruebas unitarias no se conectan a ninguna base de datos real.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'test-secret-que-tiene-mas-de-32-caracteres-para-pruebas';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
