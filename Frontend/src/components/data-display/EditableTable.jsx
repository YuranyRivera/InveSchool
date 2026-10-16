import { downloadBarcodePDF } from '@/lib/barcode';
import { Barcode, Check, Pencil, Trash2, X } from 'lucide-react';

const RowActions = ({ isEditing, onEdit, onDelete, onSave, onCancel, onBarcode, deleteLabel }) =>
  isEditing ? (
    <div className="flex items-center justify-end gap-1">
      <button type="button" onClick={onSave} className="icon-btn text-success hover:text-success" title="Guardar" aria-label="Guardar">
        <Check size={16} />
      </button>
      <button type="button" onClick={onCancel} className="icon-btn" title="Cancelar" aria-label="Cancelar">
        <X size={16} />
      </button>
    </div>
  ) : (
    <div className="flex items-center justify-end gap-1">
      {onEdit && (
        <button type="button" onClick={onEdit} className="icon-btn" title="Editar" aria-label="Editar">
          <Pencil size={16} />
        </button>
      )}
      {onBarcode && (
        <button
          type="button"
          onClick={onBarcode}
          className="icon-btn"
          title="Descargar código de barras"
          aria-label="Descargar código de barras"
        >
          <Barcode size={16} />
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} className="icon-btn-danger" title={deleteLabel} aria-label={deleteLabel}>
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );

/**
 * Tabla de inventario con edición en línea y acciones por fila.
 * `toField` traduce la clave de la fila al nombre de campo que usa el formulario de edición.
 */
const EditableTable = ({
  headers,
  rows,
  onEdit,
  onDelete,
  editingRowIndex,
  editedRowData,
  handleInputChange,
  handleSave,
  handleCancel,
  disabledFields = [],
  toField = (key) => key,
  withBarcode = true,
  deleteLabel = 'Dar de baja',
  emptyMessage = 'No hay artículos para mostrar.',
}) => {
  if (rows.length === 0) {
    return <div className="card mt-6 px-6 py-12 text-center text-sm text-muted">{emptyMessage}</div>;
  }

  const actionsFor = (row, index) => ({
    isEditing: index === editingRowIndex,
    onEdit: onEdit && (() => onEdit(row, index)),
    onDelete: onDelete && (() => onDelete(row)),
    onBarcode: withBarcode ? () => downloadBarcodePDF(row.codigo) : undefined,
    deleteLabel,
    onSave: handleSave,
    onCancel: handleCancel,
  });

  const renderCell = (row, key, isEditing, inputClass) => {
    const field = toField(key);
    if (!isEditing) return row[key];
    return (
      <input
        type="text"
        value={editedRowData[field] ?? row[key] ?? ''}
        onChange={(e) => handleInputChange(e, field)}
        disabled={disabledFields.includes(field)}
        className={`input h-9 px-3 disabled:cursor-not-allowed disabled:opacity-50 ${inputClass}`}
      />
    );
  };

  return (
    <>
      {/* Escritorio */}
      <div className="table-shell mt-6 hidden overflow-x-auto md:block">
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
            {rows.map((row, index) => {
              const isEditing = index === editingRowIndex;
              return (
                <tr key={row.id ?? index} className="table-row">
                  {Object.keys(row).map((key) => (
                    <td key={key} className={`px-4 py-3 ${key === 'id' ? 'text-subtle tabular-nums' : 'text-fg'}`}>
                      {renderCell(row, key, isEditing, 'min-w-[96px]')}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <RowActions {...actionsFor(row, index)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <div className="mt-6 space-y-3 md:hidden">
        {rows.map((row, index) => {
          const isEditing = index === editingRowIndex;
          return (
            <div key={row.id ?? index} className="card p-4">
              <dl className="space-y-2">
                {Object.keys(row).map((key, cellIndex) => (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <dt className="text-xs uppercase tracking-wider text-subtle">{headers[cellIndex] ?? key}</dt>
                    <dd className="text-right text-sm text-fg">{renderCell(row, key, isEditing, 'w-40')}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 border-t border-line pt-2">
                <RowActions {...actionsFor(row, index)} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default EditableTable;
