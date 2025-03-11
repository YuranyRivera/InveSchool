import React, { useState } from 'react';

const ModalBaja = ({ isOpen, onClose, onSave, articleData }) => {
  const [formData, setFormData] = useState({
    motivo_baja: '',
    usuario_baja: '',
    cantidad: '', // Agregar campo cantidad
    imagen: null
  });

  const [errors, setErrors] = useState({
    motivo_baja: '',
    usuario_baja: '',
    cantidad: '', // Agregar campo cantidad
    imagen: ''
  });

  const [previewImage, setPreviewImage] = useState(null);

  const validateForm = () => {
    const newErrors = {
      motivo_baja: '',
      usuario_baja: '',
      cantidad: '', // Validación para cantidad
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

    // Validar cantidad
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
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
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
      sendData.append('cantidad', formData.cantidad); // Agregar cantidad
      if (formData.imagen) {
        sendData.append('imagen', formData.imagen);
      }
      onSave(sendData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl relative">
        <button
          className="absolute top-2 right-2 text-black p-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl text-gray-700 text-center mb-4">Registro de Baja de Artículo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Lado izquierdo: Detalles y carga de imagen */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              {previewImage ? (
                <>
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    className="absolute top-2 right-2 bg-black text-white p-1 rounded-full shadow-md hover:bg-black transition"
                    onClick={handleRemoveImage}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <i className="fas fa-image text-4xl"></i>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen del artículo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {errors.imagen && (
                <p className="text-red-500 text-sm mt-1">{errors.imagen}</p>
              )}
            </div>
            {articleData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Detalles del Artículo</h3>
                <p className="text-sm text-gray-600">ID: {articleData.id}</p>
                <p className="text-sm text-gray-600">Nombre: {articleData.nombre}</p>
                <p className="text-sm text-gray-600">Cantidad: {articleData.cantidad}</p>
              </div>
            )}
          </div>
          {/* Lado derecho: Formulario */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de Baja
              </label>
              <textarea
                name="motivo_baja"
                className={`w-full h-32 p-2 border rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.motivo_baja ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe el motivo de la baja..."
                value={formData.motivo_baja}
                onChange={handleInputChange}
              />
              {errors.motivo_baja && (
                <p className="text-red-500 text-sm mt-1">{errors.motivo_baja}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario que realiza la baja
              </label>
              <input
                type="text"
                name="usuario_baja"
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.usuario_baja ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nombre del usuario"
                value={formData.usuario_baja}
                onChange={handleInputChange}
              />
              {errors.usuario_baja && (
                <p className="text-red-500 text-sm mt-1">{errors.usuario_baja}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <input
                type="number"
                name="cantidad"
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.cantidad ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Cantidad del artículo"
                value={formData.cantidad}
                onChange={handleInputChange}
              />
              {errors.cantidad && (
                <p className="text-red-500 text-sm mt-1">{errors.cantidad}</p>
              )}
            </div>
          </div>
        </div>
        {/* Botones */}
        <div className="flex justify-between items-center mt-6">
          <button
            className="bg-white hover:bg-[#00A305] text-green-600 rounded-lg border-2 border-green-600 px-4 py-2 hover:text-white transition duration-300 flex items-center"
            onClick={handleSave}
          >
            <i className="fas fa-check-circle mr-2"></i>
            Registrar Baja
          </button>
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300 flex items-center"
            onClick={onClose}
          >
            <i className="fas fa-times-circle mr-2"></i>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalBaja;
