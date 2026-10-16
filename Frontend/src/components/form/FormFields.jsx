import { Eye, EyeOff } from 'lucide-react';
import FormInput from '@/components/form/FormInput';

export const FieldError = ({ message }) => (message ? <p className="field-error">{message}</p> : null);

/**
 * Campo de contraseña con botón para mostrar/ocultar.
 * La visibilidad la controla el componente padre (normalmente un hook de formulario).
 */
export const PasswordField = ({ label, name, value, onChange, placeholder, visible, onToggle, error }) => (
  <div>
    <div className="relative">
      <FormInput
        label={label}
        type={visible ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center text-subtle transition-colors hover:text-fg"
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    <FieldError message={error} />
  </div>
);
