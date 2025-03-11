import React from 'react';

const CategorySelect = ({ value, onChange, error, disabled }) => {
  const ubicaciones = [
    { value: 'Recepción', label: 'Recepción' },
    { value: 'Tesorería', label: 'Tesorería' },
    { value: 'Coordinación convivencia', label: 'Coordinación convivencia' },
    { value: 'Rectoría', label: 'Rectoría' },
    { value: 'Secretaría académica', label: 'Secretaría académica' },
    { value: 'Coordinación académica', label: 'Coordinación académica' },
    { value: 'Sala de profesores', label: 'Sala de profesores' },
    { value: 'Aux contable y financiera', label: 'Aux contable y financiera' },
    { value: 'Aux administrativa y contable', label: 'Aux administrativa y contable' },
    { value: 'Contadora', label: 'Contadora' },
    { value: 'Cocina', label: 'Cocina' },
    { value: 'Almacén', label: 'Almacén' },
    { value: 'Espacio de servicios generales', label: 'Espacio de servicios generales' },
    { value: 'Sala audiovisuales', label: 'Sala audiovisuales' },
    { value: 'Sala lúdica', label: 'Sala lúdica' },
    { value: 'Capilla', label: 'Capilla' },
    // Salones y sus competencias
    { value: '102 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos', label: '102 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos' },
    { value: '103 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos', label: '103 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos' },
    { value: '104 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos', label: '104 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos' },
    { value: '105 - Curiosos-Pilosos-Ciudadanos-Comunicativos', label: '105 - Curiosos-Pilosos-Ciudadanos-Comunicativos' },
    { value: '106 - Curiosos-Pilosos-Ciudadanos-Comunicativos', label: '106 - Curiosos-Pilosos-Ciudadanos-Comunicativos' },
    { value: '107 - Ciudadanos-Comunicativos', label: '107 - Ciudadanos-Comunicativos' },
    { value: '108 - Curiosos-Pilosos/Pilosos', label: '108 - Curiosos-Pilosos/Pilosos' },
    { value: '109 - Ciudadanos/Pensamiento Filosófico', label: '109 - Ciudadanos/Pensamiento Filosófico' },
    { value: '201 - Comunicativos', label: '201 - Comunicativos' },
    { value: '202 - Comunicativos', label: '202 - Comunicativos' },
    { value: '203 - Fraternos y Espirituales', label: '203 - Fraternos y Espirituales' },
    { value: '204 - Pensamiento Matemático', label: '204 - Pensamiento Matemático' },
    { value: '205 - Ciudadanos', label: '205 - Ciudadanos' },
    { value: '206 - Activos', label: '206 - Activos' },
    { value: '206 - Pensamiento Matemático', label: '206 - Pensamiento Matemático' },
    { value: '207 - Indagación Biológica/Indagación Química', label: '207 - Indagación Biológica/Indagación Química' },
    { value: '211 - Indagación Biológica/Indagación Química', label: '211 - Indagación Biológica/Indagación Química' },
    { value: '212 - Indagación Biológica/Indagación Química', label: '212 - Indagación Biológica/Indagación Química' },
    { value: '301 - Innovadores', label: '301 - Innovadores' },
    { value: '302 - Fraternos-Espirituales/Ciudadanos', label: '302 - Fraternos-Espirituales/Ciudadanos' },
    { value: '303 - Ciudadanos/Comunicativos', label: '303 - Ciudadanos/Comunicativos' },
    { value: '304 - Comunicativos', label: '304 - Comunicativos' },
    { value: '305 - Curiosos', label: '305 - Curiosos' },
    { value: '306 - Pilosos/Curiosos', label: '306 - Pilosos/Curiosos' },
    { value: '307 - Wac', label: '307 - Wac' },
    { value: '308 - Comunicativos/Semillero de Lectura', label: '308 - Comunicativos/Semillero de Lectura' },
    { value: '311 - Wac', label: '311 - Wac' },
    { value: '312 - Indagación Física', label: '312 - Indagación Física' },
    { value: '313 - Pensamiento Matemático/Indagación Física', label: '313 - Pensamiento Matemático/Indagación Física' },
    { value: '314 - Pensamiento Matemático/Indagación Física', label: '314 - Pensamiento Matemático/Indagación Física' },
    { value: 'Sala 1 - 208 - Tecnología/Desarrollo Software/Diseño Gráfico', label: 'Sala 1 - 208 - Tecnología/Desarrollo Software/Diseño Gráfico' },
    { value: 'Sala 2 - 209 - Desarrollo Software/Diseño Gráfico', label: 'Sala 2 - 209 - Desarrollo Software/Diseño Gráfico' },
    { value: 'Sala 3 - 210 - Tecnología/Diseño Gráfico', label: 'Sala 3 - 210 - Tecnología/Diseño Gráfico' },
    { value: 'Lab. Wac 309 - Wac', label: 'Lab. Wac 309 - Wac' }
  ];
  

  return (
    <div>
      <select
        value={value}
        onChange={onChange}
        className={`border px-3 py-2.5 w-full rounded ${error ? 'border-red-500' : ''}`}
        disabled={disabled}
      >
        <option value="">Selecciona una categoría</option>
        {ubicaciones.map((ubicacion) => (
          <option key={ubicacion.value} value={ubicacion.value}>
            {ubicacion.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default CategorySelect;
