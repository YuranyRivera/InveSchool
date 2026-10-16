import { Trash2 } from 'lucide-react';

const RoleBadge = ({ rol }) => <span className="badge bg-white/[0.06] text-muted">{rol || 'Sin rol'}</span>;

const DeleteButton = ({ onClick }) => (
  <button type="button" onClick={onClick} className="icon-btn-danger" title="Eliminar" aria-label="Eliminar usuario">
    <Trash2 size={16} />
  </button>
);

const UsersTable = ({ title, headers, rows, onDelete }) => (
  <section>
    <h2 className="mb-5 text-lg font-semibold text-fg">{title}</h2>

    {rows.length === 0 ? (
      <div className="card px-6 py-10 text-center text-sm text-muted">No hay usuarios registrados.</div>
    ) : (
      <>
        {/* Escritorio */}
        <div className="table-shell hidden max-h-[60vh] overflow-y-auto md:block">
          <table className="min-w-full text-sm">
            <thead className="table-head sticky top-0">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-5 py-3 font-medium">
                    {header}
                  </th>
                ))}
                <th className="px-5 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="table-row">
                  <td className="px-5 py-3 font-medium text-fg">{row.nombre}</td>
                  <td className="px-5 py-3 text-muted">{row.correo}</td>
                  <td className="px-5 py-3">
                    <RoleBadge rol={row.rol} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <DeleteButton onClick={() => onDelete(row.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Móvil */}
        <div className="space-y-3 md:hidden">
          {rows.map((row) => (
            <div key={row.id} className="card flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-fg">{row.nombre}</p>
                <p className="truncate text-sm text-muted">{row.correo}</p>
                <div className="mt-2">
                  <RoleBadge rol={row.rol} />
                </div>
              </div>
              <DeleteButton onClick={() => onDelete(row.id)} />
            </div>
          ))}
        </div>
      </>
    )}
  </section>
);

export default UsersTable;
