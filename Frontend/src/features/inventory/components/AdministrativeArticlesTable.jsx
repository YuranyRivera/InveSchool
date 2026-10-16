import EditableTable from '@/components/data-display/EditableTable';

// Campos de artículos administrativos que no se pueden editar en línea.
const DISABLED_FIELDS = ['id', 'fecha', 'ubicacion'];

const AdministrativeArticlesTable = (props) => (
  <EditableTable {...props} disabledFields={DISABLED_FIELDS} toField={(key) => key.toLowerCase()} />
);
  
export default AdministrativeArticlesTable;
