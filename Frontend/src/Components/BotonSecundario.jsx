// BotonSecundario.jsx
import React from 'react';

const BotonSecundario = ({ Text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white hover:bg-[#00A305] text-green-600  rounded-[8px] border-2 border-green-600 py-2 px-6   hover:text-white transition duration-300  mt-3  w-[180px] h-[50px] "
    >
      {Text}
    </button>
  );
};

export default BotonSecundario;
