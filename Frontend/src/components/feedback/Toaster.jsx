import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Info, Lock, XCircle } from 'lucide-react';
import { TOAST_EVENT } from '@/lib/notify';

const DURATION_MS = 4000;
// Tras un aviso de demo, se omite el error genérico que la pantalla emite por el mismo rechazo.
const DEMO_SUPPRESS_MS = 2000;

const STYLES = {
  success: { icon: CheckCircle2, className: 'text-success' },
  error: { icon: XCircle, className: 'text-danger' },
  info: { icon: Info, className: 'text-accent' },
  demo: { icon: Lock, className: 'text-accent' },
};

const Toaster = () => {
  const [toast, setToast] = useState(null);
  const lastDemoAt = useRef(0);

  useEffect(() => {
    let timer;
    const onToast = ({ detail }) => {
      if (detail.type === 'demo') lastDemoAt.current = Date.now();
      else if (detail.type === 'error' && Date.now() - lastDemoAt.current < DEMO_SUPPRESS_MS) return;

      setToast({ ...detail, id: Date.now() });
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), DURATION_MS);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;
  const { icon: Icon, className } = STYLES[toast.type] ?? STYLES.info;

  return (
    <div
      key={toast.id}
      role={toast.type === 'error' ? 'alert' : 'status'}
      className="fixed bottom-6 left-1/2 z-[200] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 animate-fade-in items-center gap-3 rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-fg shadow-card"
    >
      <Icon size={16} className={`flex-shrink-0 ${className}`} />
      {toast.message}
    </div>
  );
};

export default Toaster;
