import { useState } from 'react';
import RecordsHeader from '@/features/records/components/RecordsHeader';
import { Search } from 'lucide-react';
import DateInput from '@/components/form/DateInput';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RecordsTable from '@/features/records/components/RecordsTable';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import Select from 'react-select';
import selectStyles from '@/theme/selectStyles';
import useAdministrativeDisposals from '@/features/records/hooks/useAdministrativeDisposals';

const AdministrativeDisposalsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articuloToDelete, setArticuloToDelete] = useState(null);

  const {
    isLoading,
    rows,
    searchTerm,
    setSearchTerm,
    selectedLocationInitial,
    setSelectedLocationInitial,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    ubicaciones,
    handleDelete,
    exportToPDF,
    exportToExcel,
  } = useAdministrativeDisposals();

  const headers = ['ID', 'Código', 'Fecha', 'Descripción', 'Proveedor', 'Ubicación', 'Observación'];


  const handleDeleteClick = (row) => {
    setArticuloToDelete(row);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="w-12 h-12 border-4 border-line border-t-accent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <ConfirmDialog
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
              if (articuloToDelete) {
                handleDelete(articuloToDelete[0]);
              }
              setIsModalOpen(false);
            }}
            message="¿Está seguro de que desea dar de baja este artículo?"
          />
          <div>
            <RecordsHeader title="Bajas administrativas" description="Artículos administrativos dados de baja." />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-subtle" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por descripción, proveedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-fg mb-1">Ubicación</label>
                  <Select styles={selectStyles}
                    options={ubicaciones}
                    value={selectedLocationInitial}
                    onChange={setSelectedLocationInitial}
                    isClearable
                    placeholder="Seleccionar ubicación..."
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="label">Desde</label>
                  <DateInput value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">Hasta</label>
                  <DateInput value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
              </div>
              <RecordsTable
                title="Artículos administrativos"
                headers={headers}
                rows={rows}
                onDelete={handleDeleteClick}
              />
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdministrativeDisposalsPage;