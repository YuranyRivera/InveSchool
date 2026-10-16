import EditableTable from '@/components/data-display/EditableTable';

const StorageArticlesTable = ({ disableFields = [], ...props }) => (
  <EditableTable {...props} disabledFields={disableFields} />
);

export default StorageArticlesTable;
