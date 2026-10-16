import { useId } from 'react';

const FormInput = ({ label, type = 'text', value, onChange, placeholder, name }) => {
  const id = useId();

  return (
    <div className="w-full">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input"
      />
    </div>
  );
};

export default FormInput;
