import { Doughnut, Bar } from 'react-chartjs-2';
import { Archive, Boxes, Building2, PackageX } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/data-display/DataTable';
import Loader from '@/components/feedback/Loader';
import useDashboard from '@/features/dashboard/hooks/useDashboard';

const StatCard = ({ label, value, icon: Icon, highlight = false }) => (
  <div className={`card p-5 ${highlight ? 'bg-gradient-to-br from-navy/70 to-surface' : ''}`}>
    <div className="flex items-center justify-between">
      <p className="text-[13px] font-medium text-muted">{label}</p>
      <Icon size={18} strokeWidth={1.75} className={highlight ? 'text-accent' : 'text-subtle'} />
    </div>
    <p className="mt-4 text-4xl font-semibold tracking-tight text-fg tabular-nums">
      {value.toLocaleString('es-CO')}
    </p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="card p-6">
    <h3 className="text-sm font-medium text-muted">{title}</h3>
    <div className="mt-6 h-64">{children}</div>
  </div>
);

const DashboardPage = () => {
  const {
    isLoading,
    actividadHeaders,
    totalArticulosActivos,
    totalArticulosInactivos,
    totalArticulosAlmacenamiento,
    actividadReciente,
    totalHistorialBajas,
    pieData,
    pieOptions,
    barData,
    barOptions,
  } = useDashboard();

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  const chartOptions = { responsive: true, maintainAspectRatio: false };

  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="page-title">Tablero</h1>
        <p className="page-subtitle">Resumen general del inventario.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Artículos totales"
          value={totalArticulosActivos + totalArticulosAlmacenamiento}
          icon={Boxes}
          highlight
        />
        <StatCard label="Administrativos activos" value={totalArticulosActivos} icon={Building2} />
        <StatCard label="En almacén" value={totalArticulosAlmacenamiento} icon={Archive} />
        <StatCard label="Dados de baja" value={totalArticulosInactivos + totalHistorialBajas} icon={PackageX} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Artículos administrativos">
          <Doughnut data={pieData} options={{ ...chartOptions, ...pieOptions }} />
        </ChartCard>
        <ChartCard title="Almacén">
          <Bar data={barData} options={{ ...chartOptions, ...barOptions }} />
        </ChartCard>
      </section>

      <section className="mt-6">
        {actividadReciente.length > 0 ? (
          <DataTable title="Actividad reciente" headers={actividadHeaders} rows={actividadReciente} />
        ) : (
          <div className="card px-6 py-10 text-center text-sm text-muted">Aún no hay actividad registrada.</div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default DashboardPage;
