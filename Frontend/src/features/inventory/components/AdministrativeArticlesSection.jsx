import { useState } from 'react';
import { notify } from '@/lib/notify';
import { LOCATIONS } from '@/constants/locations';
import AdministrativeArticlesTable from "@/features/inventory/components/AdministrativeArticlesTable";
import { useNavigate } from "react-router-dom";
import DateInput from "@/components/form/DateInput";
import { Search } from "lucide-react";
import AdministrativeArticlesPdfButton from "@/features/inventory/components/AdministrativeArticlesPdfButton";
import ExcelExportButton from "@/components/export/ExcelExportButton";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import DisposalObservationModal from "@/features/inventory/components/DisposalObservationModal";
import BarcodePdfButton from "@/features/inventory/components/BarcodePdfButton";
import Select from "react-select";
import selectStyles from '@/theme/selectStyles';
import API_URL, { apiFetch } from '@/lib/apiClient';
import { ROUTES } from '@/app/routes';

const MAX_PRECIO = 9999999999;
const formatCurrency = (value) => {
  if (!value && value !== 0) return "";
  return new Intl.NumberFormat("es-CO", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const currencyToNumber = (value) => {
  if (!value && value !== 0) return 0;
  const cleanValue = value.toString().replace(/\./g, "").replace(",", ".");
  return Number(cleanValue);
};

const AdministrativeArticlesSection = ({ articulos = [], reloadArticulos }) => {
  const headers = [
    "ID",
    "Código",
    "Fecha",
    "Descripción",
    "Proveedor",
    "Ubicación",
    "Observación",
    "Precio",
  ];

  const ubicaciones = LOCATIONS;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isObservacionModalOpen, setIsObservacionModalOpen] = useState(false);
  const [articuloToDelete, setArticuloToDelete] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // Hook para navegación

  const handleCancel = () => {
    setEditingRowIndex(null);
    setEditedRowData({});
    setErrors({});
  };

  const validateRow = (row) => {
    const newErrors = {};
    if (!row.descripcion?.trim()) {
      newErrors.descripcion = "La descripción es requerida";
    }
    if (!row.fecha?.trim()) {
      newErrors.fecha = "La fecha es requerida";
    }
    const precio = currencyToNumber(row.precio);
    if (!precio || precio <= 0) {
      newErrors.precio = "El precio debe ser mayor que 0";
    }
    if (precio > MAX_PRECIO) {
      throw new Error("El precio excede el límite permitido");
    }
    return newErrors;
  };

  const filteredArticulos = articulos.filter((articulo) => {
    const matchesSearch =
      (articulo.descripcion || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (articulo.proveedor || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        (articulo.codigo || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (articulo.ubicacion || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesLocation =
      !selectedLocation ||
      articulo.ubicacion.trim() === selectedLocation.value.trim();

    if (!fromDate && !toDate) return matchesSearch && matchesLocation;

    const fechaArticuloStr = articulo.fecha ? articulo.fecha.split("T")[0] : "";
    const [year, month, day] = fechaArticuloStr
      .split("-")
      .map((num) => parseInt(num, 10));
    const fechaArticulo = new Date(Date.UTC(year, month - 1, day));

    let fechaInicio = null;
    let fechaFin = null;

    if (fromDate) {
      const [startYear, startMonth, startDay] = fromDate
        .split("-")
        .map((num) => parseInt(num, 10));
      fechaInicio = new Date(Date.UTC(startYear, startMonth - 1, startDay));
    }

    if (toDate) {
      const [endYear, endMonth, endDay] = toDate
        .split("-")
        .map((num) => parseInt(num, 10));
      fechaFin = new Date(
        Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999)
      );
    }

    const cumpleFechaInicio = !fechaInicio || fechaArticulo >= fechaInicio;
    const cumpleFechaFin = !fechaFin || fechaArticulo <= fechaFin;

    return (
      matchesSearch && matchesLocation && cumpleFechaInicio && cumpleFechaFin
    );
  });

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const tableRows = filteredArticulos.map((articulo) => ({
    id: articulo.id,
    codigo: articulo.codigo || "Nuevo Código",
    fecha: formatDateForDisplay(articulo.fecha),
    descripcion: articulo.descripcion || "",
    proveedor: articulo.proveedor || "",
    ubicacion: articulo.ubicacion || "",
    observacion: articulo.observacion || "",
    precio: formatCurrency(articulo.precio),
  }));

  const handleEdit = (row, index) => {
    const [day, month, year] = row.fecha.split("/");
    const formattedDate = `${year}-${month}-${day}`;

    const precio = row.precio ? currencyToNumber(row.precio) : 0;

    setEditingRowIndex(index);
    setEditedRowData({
      ...row,
      fecha: formattedDate,
      precio: precio,
    });
    setErrors({});
  };

  const handleInputChange = (e, field) => {
    if (field === "id") return;

    let value = e.target.value;

    if (field === "precio") {
      // Remover caracteres no numéricos excepto el punto
      const numericValue = value.replace(/[^\d]/g, "");

      // Convertir a número
      let numberValue = numericValue ? parseInt(numericValue, 10) : 0;

      // Si el valor excede el límite, mantener el valor anterior
      if (numberValue > MAX_PRECIO) {
        return;
      }

      // Formatear el valor con puntos como separadores de miles
      value = formatCurrency(numberValue); // Usar la función formatCurrency para agregar los puntos
    }

    setEditedRowData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const handleSave = async () => {
    const validationErrors = validateRow(editedRowData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const dataToSend = {
        ...editedRowData,
        precio: currencyToNumber(editedRowData.precio), // Convertir el precio a número
      };

      const response = await apiFetch(
        `${API_URL}/api/articulos_administrativos/${editedRowData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Error al actualizar el artículo");
      }

      await response.json();
      reloadArticulos();
      handleCancel();
    } catch (error) {
      console.error("Error al guardar:", error);
      notify(`Error al guardar los cambios: ${error.message}`, 'error');
    }
  };

  const handleDelete = async (observacion) => {
    if (!articuloToDelete?.id) {
      console.error("No hay ID de artículo para eliminar");
      return;
    }

    try {
      const url = `${API_URL}/api/articulos_administrativos/${articuloToDelete.id}`;

      const response = await apiFetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ observacion }), // Incluir la observación
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Error al eliminar el artículo");
      }

      await response.json();
      reloadArticulos();
      setIsModalOpen(false);
      setArticuloToDelete(null);

      // Navegar a la página ArticulosBaja.jsx
      navigate(ROUTES.administrativeDisposals); // Cambia la ruta según tu configuración
    } catch (error) {
      console.error("Error al eliminar:", error);
      notify(`Error al eliminar el artículo: ${error.message}`, 'error');
      setIsModalOpen(false);
    }
  };

  const handleDeleteClick = (row) => {
    setArticuloToDelete(row);
    setIsObservacionModalOpen(true);
  };

  const handleObservacionSave = (observacion) => {
    setIsObservacionModalOpen(false);
    setIsModalOpen(true); // Mostrar modal de confirmación después de la observación
    // Guardar la observación junto con el artículo a eliminar
    setArticuloToDelete((prev) => ({
      ...prev,
      observacion,
    }));
  };

  return (
    <div className="">
    <DisposalObservationModal
      isOpen={isObservacionModalOpen}
      onClose={() => setIsObservacionModalOpen(false)}
      onSave={handleObservacionSave}
    />

    <ConfirmDialog
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onConfirm={() => handleDelete(articuloToDelete?.observacion)}
      message="¿Está seguro de que desea dar de baja este artículo?"
    />

    {/* Responsive Card Container */}
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-stretch space-y-2 md:space-y-0 md:space-x-2">
        <div className="relative flex-1 max-w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-subtle" />
          </div>
          <input
            type="text"
            placeholder="Buscar por descripción, proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Action Buttons Grid */}
        <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            <AdministrativeArticlesPdfButton
              isStorageSelected={false}
              reloadArticulos={reloadArticulos}
              filteredData={filteredArticulos}
              allData={articulos}
            />
  

            <ExcelExportButton
              filteredData={filteredArticulos}
              allData={articulos}
            />
          </div>
  

   
          <BarcodePdfButton articulos={articulos} />

      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Location Filter */}
        <div className="space-y-2">
          <label className="label">
            Ubicación
          </label>
          <Select styles={selectStyles}
            options={ubicaciones}
            value={ubicaciones.find(
              (option) => option.value === selectedLocation?.value
            ) || null}
            onChange={(option) => setSelectedLocation(option)}
            isClearable
            placeholder="Seleccionar ubicación..."
            className="text-sm"
          />
        </div>

        {/* Date Filters */}
        <div className="space-y-2">
          <label className="label">
            Desde
          </label>
          <DateInput
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="label">
            Hasta
          </label>
          <DateInput
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Table Section */}

      <div className="overflow-x-auto">
          <AdministrativeArticlesTable
            headers={headers}
            rows={tableRows}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            editingRowIndex={editingRowIndex}
            editedRowData={editedRowData}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
            handleCancel={handleCancel}
            errors={errors}
            disableFields={["id", "ubicacion",  "fecha"]}
          />
        </div>
      </div>

  </div>
  );
};

export default AdministrativeArticlesSection;