import { useState, useEffect } from 'react';
import { useUser } from '../Context/UserContext';

const useEditarPerfil = () => {
  const { user, updateUser } = useUser();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: user?.nombre || '',
    email: user?.correo || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    setFormData((prevData) => ({
      ...prevData,
      fullName: user?.nombre || '',
      email: user?.correo || '',
    }));

    return () => clearTimeout(timer);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordToggle = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es obligatorio';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'El nombre completo debe tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.fullName)) {
      newErrors.fullName = 'El nombre completo solo puede contener letras y espacios';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    } else if (formData.email.length > 100) {
      newErrors.email = 'El correo electrónico es demasiado largo';
    }

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'La contraseña actual es obligatoria';
    } else if (formData.currentPassword.length < 8) {
      newErrors.currentPassword = 'La contraseña actual debe tener al menos 8 caracteres';
    }

    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.newPassword.trim()) {
        newErrors.newPassword = 'La nueva contraseña es obligatoria si deseas cambiarla';
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'La nueva contraseña debe tener al menos 8 caracteres';
      } else if (formData.newPassword === formData.currentPassword) {
        newErrors.newPassword = 'La nueva contraseña no puede ser igual a la contraseña actual';
      } else {
        const hasUppercase = /[A-Z]/.test(formData.newPassword);
        const hasLowercase = /[a-z]/.test(formData.newPassword);
        const hasNumber = /[0-9]/.test(formData.newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword);

        if (!(hasUppercase && hasLowercase && hasNumber && hasSpecialChar)) {
          newErrors.newPassword = 'La nueva contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales';
        }
      }

      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Debes confirmar tu nueva contraseña';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch('https://inventarioschool-v1.onrender.com/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword || undefined,
          nombre: formData.fullName || undefined,
          correo: formData.email || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        updateUser({
          nombre: formData.fullName,
          correo: formData.email,
        });

        setModalOpen(true);
        setFormData((prevData) => ({
          ...prevData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        setErrors({});
        setMessage(null);

        setTimeout(() => {
          setModalOpen(false);
        }, 2000);
      } else {
        if (result.error === 'Contraseña actual incorrecta') {
          setErrors((prevErrors) => ({
            ...prevErrors,
            currentPassword: 'La contraseña actual es incorrecta',
          }));
        } else {
          setMessage(result.error || 'Error al actualizar el perfil');
        }
      }
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      setMessage('Error interno del servidor');
    }
  };

  return {
    isLoading,
    formData,
    errors,
    message,
    showPassword,
    modalOpen,
    handleChange,
    handlePasswordToggle,
    handleSubmit,
    setModalOpen,
  };
};

export default useEditarPerfil;