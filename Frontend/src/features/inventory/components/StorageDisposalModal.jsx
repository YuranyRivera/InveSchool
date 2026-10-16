import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const StorageDisposalModal = ({ isOpen, onClose, onSave, articleData }) => {
  const [formData, setFormData] = useState({
    motivo_baja: '',
    usuario_baja: '',
    cantidad: '',
    imagen: null
  });

  const [errors, setErrors] = useState({
    motivo_baja: '',
    usuario_baja: '',
    cantidad: '',
    imagen: ''
  });

  const [previewImage, setPreviewImage] = useState(null);

  // Efecto para resetear el formulario cuando el modal se abre/cierra
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      motivo_baja: '',
      usuario_baja: '',
      cantidad: '',
      imagen: null
    });
    setErrors({
      motivo_baja: '',
      usuario_baja: '',
      cantidad: '',
      imagen: ''
    });
    setPreviewImage(null);
  };

  const validateForm = () => {
    const newErrors = {
      motivo_baja: '',
      usuario_baja: '',
      cantidad: '',
      imagen: ''
    };

    let isValid = true;

    if (formData.motivo_baja.trim() === '') {
      newErrors.motivo_baja = 'El motivo de baja es requerido';
      isValid = false;
    }

    if (formData.usuario_baja.trim() === '') {
      newErrors.usuario_baja = 'El usuario es requerido';
      isValid = false;
    }

    if (formData.cantidad.trim() === '') {
      newErrors.cantidad = 'La cantidad es requerida';
      isValid = false;
    } else if (isNaN(formData.cantidad) || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser un número positivo';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        setErrors(prev => ({
          ...prev,
          imagen: 'La imagen no debe superar 5MB'
        }));
        return;
      }
      
      setFormData(prevState => ({
        ...prevState,
        imagen: file
      }));
      setErrors(prev => ({
        ...prev,
        imagen: ''
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prevState => ({
      ...prevState,
      imagen: null
    }));
    setPreviewImage(null);
    setErrors(prev => ({
      ...prev,
      imagen: ''
    }));
  };

  const handleSave = async () => {
    if (validateForm()) {
      const sendData = new FormData();
      sendData.append('motivo_baja', formData.motivo_baja);
      sendData.append('usuario_baja', formData.usuario_baja);
      sendData.append('cantidad', formData.cantidad);
      if (formData.imagen) {
        sendData.append('imagen', formData.imagen);
      }
      onSave(sendData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-surface p-6 rounded-2xl w-full max-w-2xl relative border border-line shadow-card">
        <button
          className="icon-btn absolute right-3 top-3"
          onClick={onClose}
         aria-label="Cerrar">
          <X size={18} />
        </button>
        <h2 className="mb-4 text-lg font-semibold text-fg">Dar de baja artículo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Lado izquierdo: Detalles y carga de imagen */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-line bg-elevated">
              {previewImage ? (
                <>
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                    onClick={handleRemoveImage}
                   aria-label="Quitar imagen">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-subtle">
                  <i className="fas fa-image text-4xl"></i>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-fg mb-2">
                Imagen del artículo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
              />
              {errors.imagen && (
                <p className="text-danger text-sm mt-1">{errors.imagen}</p>
              )}
            </div>
            {articleData && (
              <div className="bg-elevated p-4 rounded-lg">
                <h3 className="mb-2 text-sm font-medium text-muted">Detalles del artículo</h3>
                <p className="text-sm text-muted">ID: {articleData.id}</p>
                <p className="text-sm text-muted">Nombre: {articleData.nombre}</p>
                <p className="text-sm text-muted">Cantidad: {articleData.cantidad}</p>
              </div>
            )}
          </div>
          {/* Lado derecho: Formulario */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fg mb-2">
                Motivo de Baja
              </label>
              <textarea
                name="motivo_baja"
                className={`input h-32 resize-none py-3 ${
                  errors.motivo_baja ? 'border-danger' : 'border-line'
                }`}
                placeholder="Describe el motivo de la baja..."
                value={formData.motivo_baja}
                onChange={handleInputChange}
              />
              {errors.motivo_baja && (
                <p className="text-danger text-sm mt-1">{errors.motivo_baja}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-fg mb-2">
                Usuario que realiza la baja
              </label>
              <input
                type="text"
                name="usuario_baja"
                className={`input ${
                  errors.usuario_baja ? 'border-danger' : 'border-line'
                }`}
                placeholder="Nombre del usuario"
                value={formData.usuario_baja}
                onChange={handleInputChange}
              />
              {errors.usuario_baja && (
                <p className="text-danger text-sm mt-1">{errors.usuario_baja}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-fg mb-2">
                Cantidad
              </label>
              <input
                type="number"
                name="cantidad"
                className={`input ${
                  errors.cantidad ? 'border-danger' : 'border-line'
                }`}
                placeholder="Cantidad del artículo"
                value={formData.cantidad}
                onChange={handleInputChange}
              />
              {errors.cantidad && (
                <p className="text-danger text-sm mt-1">{errors.cantidad}</p>
              )}
            </div>
          </div>
        </div>
        {/* Botones */}
        <div className="flex justify-between items-center mt-6">
          <button
            className="btn-primary"
            onClick={handleSave}
          >
            <i className="fas fa-check-circle"></i>
            Registrar Baja
          </button>
          <button
            className="btn-secondary"
            onClick={onClose}
          >
            <i className="fas fa-times-circle"></i>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageDisposalModal;