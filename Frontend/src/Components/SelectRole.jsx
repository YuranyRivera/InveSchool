import React from 'react';

const SelectRole = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
        Rol
      </label>
      <select
        id="role"
        name="role"
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Selecciona un rol</option>
        <option value="Administrativo">Administrativo</option>
        <option value="Almacenamiento">Almacenamiento</option>
        <option value="Rector">Rector</option>
        <option value="Talento Humano">Talento Humano</option>
      </select>
    </div>
  );
};

export default SelectRole;
