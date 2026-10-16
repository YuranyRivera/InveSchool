import { useState } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { notify } from '@/lib/notify';
import MovementReportModal from '@/features/records/components/MovementReportModal';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import API_URL, { apiFetch } from '@/lib/apiClient';

// Etiqueta de color según el tipo de movimiento.
const MOVEMENT_BADGES = {
  Entrada: 'bg-success/10 text-success',
  Salida: 'bg-white/[0.06] text-muted',
};

const MovementsTable = ({ headers, rows, setRows, reloadArticulos }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);

  const handleOpenModal = async (row) => {
    const movimientoId = row[0];
    setLoading(true);
    try {
      const response = await apiFetch(`${API_URL}/api/movimiento/${movimientoId}`);
      if (!response.ok) throw new Error('Error al obtener los detalles');
      const data = await response.json();
      setModalData(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error al cargar los detalles:', error);
      notify('Hubo un error al obtener los detalles del movimiento.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData([]);
  };

  const handleDeleteConfirm = (id) => {
    setDeleteRowId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    setIsDeleteConfirmOpen(false);
    setLoading(true);
    try {
      const response = await apiFetch(`${API_URL}/api/eliminar-movimiento/${deleteRowId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar el registro');
      
      setRows((prevRows) => prevRows.filter((row) => row[0] !== deleteRowId));
      setDeleteRowId(null);
      
      // Call reloadArticulos after successful deletion
      reloadArticulos();
    } catch (error) {
      console.error('Error al eliminar el registro:', error);
      notify('Hubo un error al eliminar el registro.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (rows.length === 0) {
    return <div className="card mt-6 px-6 py-12 text-center text-sm text-muted">No hay movimientos registrados.</div>;
  }

  const renderCell = (cell) =>
    MOVEMENT_BADGES[cell] ? <span className={`badge ${MOVEMENT_BADGES[cell]}`}>{cell}</span> : cell;

  const RowActions = ({ row }) => (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => handleOpenModal(row)}
        disabled={loading}
        className="icon-btn"
        title="Ver informe"
        aria-label="Ver informe"
      >
        <FileText size={16} />
      </button>
      <button
        type="button"
        onClick={() => handleDeleteConfirm(row[0])}
        disabled={loading}
        className="icon-btn-danger"
        title="Eliminar"
        aria-label="Eliminar"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="mt-6 w-full">
      {/* Escritorio */}
      <div className="table-shell hidden overflow-x-auto md:block">
        <table className="min-w-full text-sm">
          <thead className="table-head">
            <tr>
              {headers.map((header) => (
                <th key={header} className="whitespace-nowrap px-4 py-3 font-medium">
                  {header}
                </th>
              ))}
              <th className="px-4 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="table-row">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`max-w-xs truncate px-4 py-3 ${cellIndex === 0 ? 'text-subtle tabular-nums' : 'text-fg'}`}
                  >
                    {renderCell(cell)}
                  </td>
                ))}
                <td className="px-3 py-2">
                  <RowActions row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div key={row[0]} className="card p-4">
            <dl className="space-y-2">
              {headers.map((header, cellIndex) => (
                <div key={header} className="flex items-center justify-between gap-4">
                  <dt className="text-xs uppercase tracking-wider text-subtle">{header}</dt>
                  <dd className="text-right text-sm text-fg">{renderCell(row[cellIndex])}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 border-t border-line pt-2">
              <RowActions row={row} />
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && <MovementReportModal isOpen={isModalOpen} onClose={handleCloseModal} data={modalData} />}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        message="¿Estás seguro de que deseas eliminar este registro?"
      />
    </div>
  );
};

export default MovementsTable;
