/**
 * Catálogo único de ubicaciones de la institución.
 * Para agregar o renombrar una ubicación, edita solo esta lista.
 */
const NOMBRES_UBICACIONES = [
  // Administración
  'Recepción',
  'Rectoría',
  'Secretaría académica',
  'Coordinación académica',
  'Coordinación de convivencia',
  'Tesorería',
  'Contabilidad',
  'Talento humano',
  // Espacios comunes
  'Sala de profesores',
  'Biblioteca',
  'Auditorio',
  'Sala audiovisual',
  'Enfermería',
  'Cafetería',
  'Almacén',
  'Servicios generales',
  // Tecnología y laboratorios
  'Sala de sistemas 1',
  'Sala de sistemas 2',
  'Laboratorio de ciencias',
  'Laboratorio de idiomas',
  // Aulas
  'Aula 101',
  'Aula 102',
  'Aula 103',
  'Aula 201',
  'Aula 202',
  'Aula 203',
  'Aula 301',
  'Aula 302',
];

export const LOCATIONS = NOMBRES_UBICACIONES.map((nombre) => ({ value: nombre, label: nombre }));
