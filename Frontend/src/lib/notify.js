/**
 * Notificaciones globales (toasts). Se pueden emitir desde cualquier parte de la app,
 * incluso fuera de React, y las muestra el componente <Toaster /> montado en App.
 */
export const TOAST_EVENT = 'inveschool:toast';

/** @param {'success' | 'error' | 'info' | 'demo'} type */
export const notify = (message, type = 'info') => {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, type } }));
};
