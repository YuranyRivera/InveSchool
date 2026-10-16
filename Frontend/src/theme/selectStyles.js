/** Estilos de react-select alineados con el tema oscuro (tokens de src/index.css). */
const COLORS = {
  bg: 'rgb(15 23 42)',
  menu: 'rgb(9 14 28)',
  line: 'rgb(30 41 59)',
  hover: 'rgba(255, 255, 255, 0.06)',
  focus: 'rgb(96 140 230)',
  fg: 'rgb(245 245 247)',
  muted: 'rgb(107 114 128)',
};

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    backgroundColor: COLORS.bg,
    borderColor: state.isFocused ? COLORS.focus : COLORS.line,
    borderRadius: 8,
    boxShadow: state.isFocused ? '0 0 0 4px rgba(96, 140, 230, 0.15)' : 'none',
    '&:hover': { borderColor: state.isFocused ? COLORS.focus : 'rgb(107 114 128)' },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: COLORS.menu,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 10,
    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.8)',
    overflow: 'hidden',
    zIndex: 60,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 60 }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    color: COLORS.fg,
    backgroundColor: state.isSelected ? 'rgba(96, 140, 230, 0.18)' : state.isFocused ? COLORS.hover : 'transparent',
    '&:active': { backgroundColor: 'rgba(96, 140, 230, 0.25)' },
  }),
  singleValue: (base) => ({ ...base, color: COLORS.fg }),
  multiValue: (base) => ({ ...base, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 6 }),
  multiValueLabel: (base) => ({ ...base, color: COLORS.fg }),
  input: (base) => ({ ...base, color: COLORS.fg }),
  placeholder: (base) => ({ ...base, color: COLORS.muted, fontSize: 14 }),
  indicatorSeparator: (base) => ({ ...base, backgroundColor: COLORS.line }),
  dropdownIndicator: (base) => ({ ...base, color: COLORS.muted, '&:hover': { color: COLORS.fg } }),
  clearIndicator: (base) => ({ ...base, color: COLORS.muted, '&:hover': { color: COLORS.fg } }),
  noOptionsMessage: (base) => ({ ...base, color: COLORS.muted }),
};

export default selectStyles;
