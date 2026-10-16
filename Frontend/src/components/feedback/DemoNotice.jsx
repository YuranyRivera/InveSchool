import { Eye } from 'lucide-react';

/** Aviso permanente de modo demo. Los rechazos del servidor se muestran con el Toaster global. */
const DemoNotice = () => (
  <div className="mb-6 flex items-center gap-3 rounded-xl border border-accent/25 bg-accent/[0.07] px-4 py-3 text-sm">
    <Eye size={16} className="flex-shrink-0 text-accent" />
    <p className="text-muted">
      <span className="font-medium text-fg">Estás explorando la demo.</span> Puedes recorrer todas las pantallas; los
      cambios están deshabilitados.
    </p>
  </div>
);

export default DemoNotice;
