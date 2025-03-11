import React from 'react';

const InputField = ({ label, type, value, onChange, placeholder, name }) => {
  return (
    <div className="w-full">
      <label className="block text-gray-700 text-lg font-semibold mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}  // Asegúrate de pasar el 'name' correctamente
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
      />
    </div>
  );
};

export default InputField;
