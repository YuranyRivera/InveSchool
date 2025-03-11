import React from 'react';

const CheckboxGroup = ({ selected, onChange }) => {
  return (
    <div className="flex space-x-6 mb-4">
      {/* Opción: Artículos Administrativos */}
      <div className="flex items-center">
  <input 
    type="radio" 
    id="administrativos" 
    name="tipoArticulo"
    checked={selected === 'administrativos'} // Marcado según el estado
    className="appearance-none h-5 w-5 border border-green-600 rounded-full checked:bg-[#00A305] checked:border-[#00A305] focus:outline-none transition duration-200 mr-2 cursor-pointer" 
    onChange={(e) => onChange(e, 'administrativos')} // Cambié 'administrativo' por 'administrativos'
  />
  <label 
    htmlFor="administrativos" 
    className="text-lg cursor-pointer"
  >
    Artículos Administrativos
  </label>
</div>
      
      {/* Opción: Artículos de Almacenamiento */}
      <div className="flex items-center">
        <input 
          type="radio" 
          id="almacenamiento" 
          name="tipoArticulo"
          checked={selected === 'almacenamiento'} // Marcado según el estado
          className="appearance-none h-5 w-5 border border-green-600 rounded-full checked:bg-[#00A305] checked:border-[#00A305] focus:outline-none transition duration-200 mr-2 cursor-pointer" 
          onChange={(e) => onChange(e, 'almacenamiento')} 
        />
        <label 
          htmlFor="almacenamiento" 
          className="text-lg cursor-pointer"
        >
          Artículos de Almacenamiento
        </label>
      </div>
    </div>
  );
};

export default CheckboxGroup;
