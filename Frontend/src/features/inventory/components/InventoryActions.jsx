import { useState } from 'react';
import { ArrowLeftRight, Plus } from 'lucide-react';
import TransferModal from '@/features/inventory/components/TransferModal';
import StockMovementModal from '@/features/inventory/components/StockMovementModal';
import AddAdministrativeArticlesModal from '@/features/inventory/components/AddAdministrativeArticlesModal';
import AddStorageArticlesModal from '@/features/inventory/components/AddStorageArticlesModal';

const InventoryActions = ({ isStorageSelected, onSave, reloadArticulos }) => {
  const [isModalEntradaOpen, setIsModalEntradaOpen] = useState(false);
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);

  const handleOpenEntradaModal = () => {
    setIsModalEntradaOpen(true);
 
  };

  const handleCloseEntradaModal = () => setIsModalEntradaOpen(false);

  const handleOpenAddModal = () => setIsModalAddOpen(true);
  const handleCloseAddModal = () => setIsModalAddOpen(false);

  const refreshArticulos = () => {
    onSave();
    handleCloseAddModal();
  };
  

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} />
          Agregar artículo
        </button>
        <button type="button" className="btn-secondary" onClick={handleOpenEntradaModal}>
          <ArrowLeftRight size={16} className="text-subtle" />
          {isStorageSelected ? 'Reporte' : 'Traslados'}
        </button>
      </div>

      {isStorageSelected ? (
        <>
          <StockMovementModal
            isOpen={isModalEntradaOpen}
            onClose={handleCloseEntradaModal}
            reloadArticulos={reloadArticulos}
          />
          <AddStorageArticlesModal
            isOpen={isModalAddOpen}
            onClose={handleCloseAddModal}
            onSave={refreshArticulos}
          />
        </>
      ) : (
        <>
          <TransferModal isOpen={isModalEntradaOpen} onClose={handleCloseEntradaModal} />
          <AddAdministrativeArticlesModal
            isOpen={isModalAddOpen}
            onClose={handleCloseAddModal}
            onSave={refreshArticulos}
          />
        </>
      )}
    </div>
  );
};

export default InventoryActions;
