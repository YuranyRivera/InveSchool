import RecordsHeader from '@/features/records/components/RecordsHeader';
import { Search, Image as ImageIcon } from 'lucide-react';
import DateInput from '@/components/form/DateInput';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RecordsTable from '@/features/records/components/RecordsTable';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import { useStorageDisposals } from '@/features/records/hooks/useStorageDisposals';

const StorageDisposalsPage = () => {
  // Define las funciones createImageButton y createPDFButton antes de usarlas
  const createImageButton = (imageUrl, onClick) => {
    if (imageUrl) {
      return (
        <button
          onClick={onClick}
          className="flex items-center justify-center gap-2 text-accent hover:text-accent"
        >
          <ImageIcon size={20} />
          Ver imagen
        </button>
      );
    }
    return <span className="text-subtle">Sin imagen</span>;
  };

  const createPDFButton = (rowData) => (
    <button
      onClick={() => handleRowPDF(rowData)}
      className="btn-secondary"
    >
      PDF
    </button>
  );

  // Ahora puedes usar el hook useStorageDisposals
  const {
    isLoading,
    headers,
    filteredRows,
    searchTerm,
    fromDate,
    toDate,
    selectedImage,
    showDeleteConfirmation,
    setSearchTerm,
    setFromDate,
    setToDate,
    setSelectedImage,
    handleDeleteClick,
    handleConfirmDelete,
    setShowDeleteConfirmation,
    exportToPDF,
    exportToExcel,
    handleRowPDF
  } = useStorageDisposals(createImageButton, createPDFButton);

  const ImageModal = ({ url, onClose }) => {
    if (!url) return null;
    
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="relative bg-surface p-10 rounded-2xl max-w-3xl max-h-[90vh] overflow-auto border border-line shadow-card">
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-muted hover:text-fg focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img src={url} alt="Imagen de baja" className="max-w-full h-auto" />
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="w-12 h-12 border-4 border-line border-t-accent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div>
          <RecordsHeader title="Bajas de almacén" description="Historial de productos de almacén dados de baja." />


          <div className="space-y-4">
            {/* Search and filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-subtle" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por artículo, motivo, usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
              {/* Botones de exportación */}
              <div className="flex gap-1">
                <button
                  onClick={exportToPDF}
                  className="btn-secondary whitespace-nowrap"
                >
                  <i className="fas fa-file-pdf"></i> PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="btn-secondary whitespace-nowrap"
                >
                  <i className="fas fa-file-excel"></i> Excel
                </button>
              </div>
            </div>

            {/* Date filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Desde</label>
                <DateInput value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Hasta</label>
                <DateInput value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Table */}
          <RecordsTable
            headers={headers}
            rows={filteredRows}
            showActions={true}
            onDelete={handleDeleteClick}
          />

          {/* Modals */}
          <ImageModal url={selectedImage} onClose={() => setSelectedImage(null)} />
          <ConfirmDialog
            isOpen={showDeleteConfirmation}
            onClose={() => setShowDeleteConfirmation(false)}
            onConfirm={handleConfirmDelete}
            message="¿Estás seguro de eliminar este artículo?"
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default StorageDisposalsPage;