import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../Layouts/DashboardLayout';
import CheckboxGroup from '../../Components/CheckboxGroup';
import ButtonGroup from '../../Components/ButtonGroup';
import ArticulosAdministrativos from '../Inventario/ArticulosAdministrativos';
import ArticulosAlmacenamiento from '../Inventario/ArticulosAlmacenamiento';
import useArticulo from '../../hooks/useArticulo';
import useArticulosAdministrativos from '../../hooks/useArticulosAdministrativos';
import '@dotlottie/player-component';

const Articulos = () => {
  const location = useLocation();
  const [selected, setSelected] = useState('administrativos');
  
  const { 
    articulos: articulosAlmacenamiento, 
    reloadArticulos: reloadArticulosAlmacenamiento,
    isLoading: isLoadingAlmacenamiento 
  } = useArticulo();
  
  const { 
    articulos: articulosAdministrativos, 
    reloadArticulos: reloadArticulosAdministrativos,
    isLoading: isLoadingAdministrativos 
  } = useArticulosAdministrativos();

  const isLoading = isLoadingAlmacenamiento || isLoadingAdministrativos;

  useEffect(() => {
    const storedSelected = localStorage.getItem('selectedCategory');
    if (storedSelected) {
      setSelected(storedSelected);
    } else if (location.state?.selected) {
      setSelected(location.state.selected);
    }
  }, [location.state]);

  const handleCheckboxChange = (e, category) => {
    setSelected(category);
    localStorage.setItem('selectedCategory', category);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-black mb-4 md:mb-6 mt-10">
          Artículos
        </h1>
        
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <CheckboxGroup selected={selected} onChange={handleCheckboxChange} />
          <ButtonGroup
            isStorageSelected={selected === 'almacenamiento'}
            onSave={() => {
              if (selected === 'almacenamiento') {
                reloadArticulosAlmacenamiento();
              } else {
                reloadArticulosAdministrativos();
              }
            }}
            reloadArticulos={selected === 'almacenamiento' ? reloadArticulosAlmacenamiento : reloadArticulosAdministrativos}
          />
        </div>

        <div className="relative min-h-[calc(100vh-300px)]">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex justify-center items-center z-10">
              <dotlottie-player
                src="https://lottie.host/0aca447b-d3c9-46ed-beeb-d4481815915a/qvvqgKAKQU.lottie"
                background="transparent"
                speed="1"
                style={{ width: '300px', height: '300px' }}
                loop
                autoplay
              />
            </div>
          )}
          
          <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            {selected === 'almacenamiento' ? (
              <ArticulosAlmacenamiento 
                articulos={articulosAlmacenamiento} 
                reloadArticulos={reloadArticulosAlmacenamiento} 
              />
            ) : (
              <ArticulosAdministrativos 
                articulos={articulosAdministrativos} 
                reloadArticulos={reloadArticulosAdministrativos} 
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Articulos;