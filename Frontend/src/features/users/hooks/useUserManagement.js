import { useState, useEffect } from 'react';
import API_URL, { apiFetch } from '@/lib/apiClient';

/** Llama a la API y lanza un Error con el mensaje del servidor si la respuesta no es exitosa. */
const requestJson = async (path, options = {}) => {
  const response = await apiFetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || data?.message || 'No se pudo completar la operación.');
  return data;
};

export const useUserManagement = () => {
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentReady, setIsContentReady] = useState(false);

  // Modal state
  const [contactos, setContactos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContactos();
      setIsContentReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const fetchContactos = async () => {
    setIsLoading(true);
    try {
      setContactos(await requestJson('/api/usuarios'));
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      setErrorMessage('Error al cargar los usuarios');
      setIsErrorModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirmation = (id) => {
    setUserToDelete(id);
    setIsDeleteConfirmModalOpen(true);
  };

  const eliminarUsuario = async () => {
    if (!userToDelete) return;

    setIsDeleteConfirmModalOpen(false);
    setIsModalOpen(false);
    setIsLoading(true);
    
    try {
      await requestJson(`/api/usuarios/${userToDelete}`, { method: 'DELETE' });
      await fetchContactos();
      setMessage('Usuario eliminado exitosamente');
      setIsConfirmModalOpen(true);
      setTimeout(() => setIsConfirmModalOpen(false), 2000);
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      setErrorMessage(error.message || 'No se pudo eliminar el usuario');
      setIsErrorModalOpen(true);
    } finally {
      setIsLoading(false);
      setUserToDelete(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es obligatorio.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'El nombre debe tener al menos 2 caracteres.';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = 'El nombre solo puede contener letras.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido.';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Por favor confirma tu contraseña.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (!formData.role) {
      newErrors.role = 'Por favor selecciona un rol.';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    
    const nuevoContacto = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };
  
    try {
      await requestJson('/api/usuarios', { method: 'POST', body: JSON.stringify(nuevoContacto) });
      await fetchContactos();
      setMessage('Usuario guardado exitosamente!');
      setIsConfirmModalOpen(true);
      setTimeout(() => setIsConfirmModalOpen(false), 2000);
      
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
      });
      setFormErrors({});
      
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
      setErrorMessage(error.message || 'Hubo un error al guardar el usuario.');
      setIsErrorModalOpen(true);
      setTimeout(() => setIsErrorModalOpen(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModal = (e) => {
    e?.preventDefault();
    setIsModalOpen(!isModalOpen);
    
    if (!isModalOpen) {
      setFormErrors({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
      });
    }
  };

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = (e) => {
    e.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  return {
    formData,
    formErrors,
    showPassword,
    showConfirmPassword,
    isLoading,
    isContentReady,
    contactos,
    isModalOpen,
    isConfirmModalOpen,
    isErrorModalOpen,
    isDeleteConfirmModalOpen,
    message,
    errorMessage,
    handleChange,
    handleSubmit,
    handleDeleteConfirmation,
    eliminarUsuario,
    toggleModal,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    setIsConfirmModalOpen,
    setIsErrorModalOpen,
    setIsDeleteConfirmModalOpen
  };
};