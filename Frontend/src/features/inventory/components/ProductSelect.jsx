import Select from 'react-select';
import selectStyles from '@/theme/selectStyles';

const ProductSelect = ({ options, value, onChange }) => {
  return (
    <div className="mb-3">
      <label className="block text-lg mb-2">Selecciona los productos</label>
      <Select styles={selectStyles}
        isMulti
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Seleccionar productos..."
        closeMenuOnSelect={false}
      />
    </div>
  );
};

export default ProductSelect;
