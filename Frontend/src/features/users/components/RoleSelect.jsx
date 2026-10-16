
const RoleSelect = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="role" className="label">
        Rol
      </label>
      <select
        id="role"
        name="role"
        value={value}
        onChange={onChange}
        className="input"
      >
        <option value="">Selecciona un rol</option>
        <option value="Administrativo">Administrativo</option>
        <option value="Almacenamiento">Almacenamiento</option>
        <option value="Administrador">Administrador</option>
        <option value="Recursos Humanos">Recursos Humanos</option>
      </select>
    </div>
  );
};

export default RoleSelect;
