
const TextInput = ({ placeholder, type = 'text', Text, id, value, onChange, name, autoComplete, className = '' }) => (
  <div className="w-full">
    {Text && (
      <label htmlFor={id} className="label">
        {Text}
      </label>
    )}
    <input
      id={id}
      type={type}
      name={name}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required
      value={value}
      onChange={onChange}
      className={`input ${className}`}
    />
  </div>
);

export default TextInput;
