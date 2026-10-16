import { useId } from 'react';

const DateInput = ({ label, value, onChange }) => {
  const id = useId();

  return (
    <div>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input id={id} type="date" value={value} onChange={onChange} className="input" />
    </div>
  );
};

export default DateInput;
