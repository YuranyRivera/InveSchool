import { LOCATIONS } from '@/constants/locations';

const LocationSelect = ({ value, onChange, error, disabled }) => {
  const ubicaciones = LOCATIONS;
  

  return (
    <div>
      <select
        value={value}
        onChange={onChange}
        className={`input ${error ? "border-danger" : ""}`}
        disabled={disabled}
      >
        <option value="">Selecciona una ubicación</option>
        {ubicaciones.map((ubicacion) => (
          <option key={ubicacion.value} value={ubicacion.value}>
            {ubicacion.label}
          </option>
        ))}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
};

export default LocationSelect;
