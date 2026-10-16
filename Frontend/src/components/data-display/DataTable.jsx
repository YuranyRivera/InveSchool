
const DataTable = ({ title, headers, rows }) => (
  <section className="space-y-3">
    {title && <h2 className="text-sm font-medium text-muted">{title}</h2>}

    {/* Escritorio */}
    <div className="table-shell hidden md:block">
      <table className="min-w-full">
        <thead className="table-head">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-5 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="table-row">
              {row.map((cell, idx) => (
                <td key={idx} className="px-5 py-4 text-sm text-fg">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Móvil */}
    <div className="space-y-3 md:hidden">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="card divide-y divide-line p-0">
          {headers.map((header, headerIndex) => (
            <div key={headerIndex} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-wider text-muted">{header}</div>
              <div className="text-right text-sm text-fg">{row[headerIndex]}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </section>
);

export default DataTable;
