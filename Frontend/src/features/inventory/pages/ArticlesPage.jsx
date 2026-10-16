import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ArticleTypeToggle from '@/features/inventory/components/ArticleTypeToggle';
import InventoryActions from '@/features/inventory/components/InventoryActions';
import AdministrativeArticlesSection from '@/features/inventory/components/AdministrativeArticlesSection';
import StorageArticlesSection from '@/features/inventory/components/StorageArticlesSection';
import useStorageArticles from '@/features/inventory/hooks/useStorageArticles';
import useAdministrativeArticles from '@/features/inventory/hooks/useAdministrativeArticles';

const ArticlesPage = () => {
  const location = useLocation();
  const [selected, setSelected] = useState('administrativos');
  
  const { 
    articulos: articulosAlmacenamiento, 
    reloadArticulos: reloadArticulosAlmacenamiento,
    isLoading: isLoadingAlmacenamiento 
  } = useStorageArticles();
  
  const { 
    articulos: articulosAdministrativos, 
    reloadArticulos: reloadArticulosAdministrativos,
    isLoading: isLoadingAdministrativos 
  } = useAdministrativeArticles();

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
      <div>
        <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="page-title">Artículos</h1>
            <p className="page-subtitle">Consulta, filtra y gestiona el inventario.</p>
          </div>
        </header>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <ArticleTypeToggle selected={selected} onChange={handleCheckboxChange} />
          <InventoryActions
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
            <div className="absolute inset-0 z-10 flex items-start justify-center bg-canvas/80 pt-24">
              <div className="spinner" />
            </div>
          )}
          
          <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            {selected === 'almacenamiento' ? (
              <StorageArticlesSection 
                articulos={articulosAlmacenamiento} 
                reloadArticulos={reloadArticulosAlmacenamiento} 
              />
            ) : (
              <AdministrativeArticlesSection 
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

export default ArticlesPage;