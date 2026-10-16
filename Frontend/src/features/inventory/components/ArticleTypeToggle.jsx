
const OPTIONS = [
  { value: 'administrativos', label: 'Administrativos' },
  { value: 'almacenamiento', label: 'Almacenamiento' },
];

/** Control segmentado para alternar entre tipos de artículo. */
const ArticleTypeToggle = ({ selected, onChange }) => (
  <div role="tablist" aria-label="Tipo de artículo" className="segmented">
    {OPTIONS.map(({ value, label }) => {
      const isActive = selected === value;
      return (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={(e) => onChange(e, value)}
          className={`segmented-item ${isActive ? 'segmented-item-active' : ''}`}
        >
          {label}
        </button>
      );
    })}
  </div>
);

export default ArticleTypeToggle;
