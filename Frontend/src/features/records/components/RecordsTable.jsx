import EditableTable from '@/components/data-display/EditableTable';

/** Tabla de solo lectura con acción de eliminar (traslados y bajas). */
const RecordsTable = ({ disableFields = ['id', 'cantidad', 'cantidad_productos'], ...props }) => (
  <EditableTable
    {...props}
    disabledFields={disableFields}
    withBarcode={false}
    deleteLabel="Eliminar"
    emptyMessage="No hay registros para mostrar."
  />
);

export default RecordsTable;
