import React from 'react';
import Select from 'react-select';

const ProductSelect = ({ options, value, onChange }) => {
  return (
    <div className="mb-3">
      <label className="block text-lg mb-2">Selecciona los productos</label>
      <Select
        isMulti
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Seleccionar productos..."
        closeMenuOnSelect={false}
      />
    </div>
  );
};

export default ProductSelect;
