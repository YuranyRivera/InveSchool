import React from 'react';

const BotonPrincipal = ({ Text, className = '', onClick, isSelected, additionalClasses = '' }) => {
  return (
    <button
      className={`bg-[#00A305] hover:bg-green-700 relative cursor-pointer font-semibold overflow-hidden border border-verde group w-[180px] h-[50px] py-[10px] rounded-[8px] mt-3 self-center `}
      onClick={onClick}
    >
      <span className="relative z-10 text-white text-[18px] duration-500">
        {Text}
      </span>
     
    </button>
  );
};



export default BotonPrincipal;