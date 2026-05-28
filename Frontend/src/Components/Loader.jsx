import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-[#3B82F6] rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
