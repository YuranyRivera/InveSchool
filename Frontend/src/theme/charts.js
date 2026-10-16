import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Title, Tooltip);

/** Paleta de gráficos alineada con los tokens de src/index.css. */
export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#1E3A8A',
  muted: '#334155',
  text: '#9CA3AF',
  grid: 'rgba(255, 255, 255, 0.06)',
  surface: '#0A0D14',
};

// Valores por defecto globales para todos los gráficos de la app.
ChartJS.defaults.color = CHART_COLORS.text;
ChartJS.defaults.borderColor = CHART_COLORS.grid;
ChartJS.defaults.font.family = 'Inter, ui-sans-serif, system-ui, sans-serif';
ChartJS.defaults.font.size = 12;
ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
ChartJS.defaults.plugins.legend.labels.boxWidth = 8;
ChartJS.defaults.plugins.tooltip.backgroundColor = '#121722';
ChartJS.defaults.plugins.tooltip.borderColor = '#242B3A';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
