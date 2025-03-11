import React, { useState } from "react";
import AdminArticlesTable from "../../Components/AdminArticlesTable";
import { useNavigate } from "react-router-dom";
import CategorySelect from "../../Components/CategorySelect";
import DateInput from "../../Components/DateInput";
import { Search } from "lucide-react";
import ButtonGroup from "../../Components/PDF";
import ExcelExportButton from "../../Components/Excel";
import ModalConfirmacion from "../../Components/ModalConf";
import ModalObservacion from "../../Components/ModalObs";
import BarcodeGenerator from "../../Components/BarcodeGenerator";
import Select from "react-select";

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

const ArticulosAdministrativos = ({ articulos = [], reloadArticulos }) => {
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

  const ubicaciones = [
    { value: "Recepción", label: "Recepción" },
    { value: "Tesorería", label: "Tesorería" },
    { value: "Coordinación convivencia", label: "Coordinación convivencia" },
    { value: "Rectoría", label: "Rectoría" },
    { value: "Secretaría académica", label: "Secretaría académica" },
    { value: "Coordinación académica", label: "Coordinación académica" },
    { value: "Sala de profesores", label: "Sala de profesores" },
    { value: "Aux contable y financiera", label: "Aux contable y financiera" },
    {
      value: "Aux administrativa y contable",
      label: "Aux administrativa y contable",
    },
    { value: "Contadora", label: "Contadora" },
    { value: "Cocina", label: "Cocina" },
    { value: "Almacén", label: "Almacén" },
    {
      value: "Espacio de servicios generales",
      label: "Espacio de servicios generales",
    },
    { value: "Sala audiovisuales", label: "Sala audiovisuales" },
    { value: "Sala lúdica", label: "Sala lúdica" },
    { value: "Capilla", label: "Capilla" },
        // Salones y sus competencias
        { value: '102 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos', label: '102 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos' },
        { value: '103 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos', label: '103 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos' },
        { value: '104 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos', label: '104 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos' },
        { value: '105 - Curiosos-Pilosos-Ciudadanos-Comunicativos', label: '105 - Curiosos-Pilosos-Ciudadanos-Comunicativos' },
        { value: '106 - Curiosos-Pilosos-Ciudadanos-Comunicativos', label: '106 - Curiosos-Pilosos-Ciudadanos-Comunicativos' },
        { value: '107 - Ciudadanos-Comunicativos', label: '107 - Ciudadanos-Comunicativos' },
        { value: '108 - Curiosos-Pilosos/Pilosos', label: '108 - Curiosos-Pilosos/Pilosos' },
        { value: '109 - Ciudadanos/Pensamiento Filosófico', label: '109 - Ciudadanos/Pensamiento Filosófico' },
        { value: '201 - Comunicativos', label: '201 - Comunicativos' },
        { value: '202 - Comunicativos', label: '202 - Comunicativos' },
        { value: '203 - Fraternos y Espirituales', label: '203 - Fraternos y Espirituales' },
        { value: '204 - Pensamiento Matemático', label: '204 - Pensamiento Matemático' },
        { value: '205 - Ciudadanos', label: '205 - Ciudadanos' },
        { value: '206 - Activos', label: '206 - Activos' },
        { value: '206 - Pensamiento Matemático', label: '206 - Pensamiento Matemático' },
        { value: '207 - Indagación Biológica/Indagación Química', label: '207 - Indagación Biológica/Indagación Química' },
        { value: '211 - Indagación Biológica/Indagación Química', label: '211 - Indagación Biológica/Indagación Química' },
        { value: '212 - Indagación Biológica/Indagación Química', label: '212 - Indagación Biológica/Indagación Química' },
        { value: '301 - Innovadores', label: '301 - Innovadores' },
        { value: '302 - Fraternos-Espirituales/Ciudadanos', label: '302 - Fraternos-Espirituales/Ciudadanos' },
        { value: '303 - Ciudadanos/Comunicativos', label: '303 - Ciudadanos/Comunicativos' },
        { value: '304 - Comunicativos', label: '304 - Comunicativos' },
        { value: '305 - Curiosos', label: '305 - Curiosos' },
        { value: '306 - Pilosos/Curiosos', label: '306 - Pilosos/Curiosos' },
        { value: '307 - Wac', label: '307 - Wac' },
        { value: '308 - Comunicativos/Semillero de Lectura', label: '308 - Comunicativos/Semillero de Lectura' },
        { value: '311 - Wac', label: '311 - Wac' },
        { value: '312 - Indagación Física', label: '312 - Indagación Física' },
        { value: '313 - Pensamiento Matemático/Indagación Física', label: '313 - Pensamiento Matemático/Indagación Física' },
        { value: '314 - Pensamiento Matemático/Indagación Física', label: '314 - Pensamiento Matemático/Indagación Física' },
        { value: 'Sala 1 - 208 - Tecnología/Desarrollo Software/Diseño Gráfico', label: 'Sala 1 - 208 - Tecnología/Desarrollo Software/Diseño Gráfico' },
        { value: 'Sala 2 - 209 - Desarrollo Software/Diseño Gráfico', label: 'Sala 2 - 209 - Desarrollo Software/Diseño Gráfico' },
        { value: 'Sala 3 - 210 - Tecnología/Diseño Gráfico', label: 'Sala 3 - 210 - Tecnología/Diseño Gráfico' },
        { value: 'Lab. Wac 309 - Wac', label: 'Lab. Wac 309 - Wac' }
      
  ];
  
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

      const response = await fetch(
        `https://inventarioschool-v1.onrender.com/api/articulos_administrativos/${editedRowData.id}`,
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
        throw new Error(errorData.message || "Error al actualizar el artículo");
      }

      await response.json();
      reloadArticulos();
      handleCancel();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert(`Error al guardar los cambios: ${error.message}`);
    }
  };

  const handleDelete = async (observacion) => {
    if (!articuloToDelete?.id) {
      console.error("No hay ID de artículo para eliminar");
      return;
    }

    try {
      const url = `https://inventarioschool-v1.onrender.com/api/articulos_administrativos/${articuloToDelete.id}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ observacion }), // Incluir la observación
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar el artículo");
      }

      await response.json();
      reloadArticulos();
      setIsModalOpen(false);
      setArticuloToDelete(null);

      // Navegar a la página ArticulosBaja.jsx
      navigate("/ArticulosBaja"); // Cambia la ruta según tu configuración
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert(`Error al eliminar el artículo: ${error.message}`);
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
    <ModalObservacion
      isOpen={isObservacionModalOpen}
      onClose={() => setIsObservacionModalOpen(false)}
      onSave={handleObservacionSave}
    />

    <ModalConfirmacion
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
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por descripción, proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons Grid */}
        <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            <ButtonGroup
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
  

   
          <BarcodeGenerator articulos={articulos} />

      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Location Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ubicación
          </label>
          <Select
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
          <label className="block text-sm font-medium text-gray-700">
            Desde
          </label>
          <DateInput
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
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
          <AdminArticlesTable
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
            disableFields={["id"]}
          />
        </div>
      </div>

  </div>
  );
};

export default ArticulosAdministrativos;