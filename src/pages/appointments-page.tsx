"use client";
import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Pagination,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import axios from "axios";

interface Paciente {
  id_paciente: number;
  nombre_completo: string;
  email?: string;
  edad?: number;
  sexo?: string;
}

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
}

interface Appointment {
  id_cita?: string | number;
  id_paciente?: number;
  id_usuario?: string | number;
  fecha_cita: string; // This is a timestamp from backend
  motivo: string;
  estado: "Programada" | "Completada" | "Cancelada";
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  paciente?: Paciente;
  usuario?: Usuario;
}

export const AppointmentsPage = () => {
  const getUserId = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )userId=([^;]+)"));
    return match ? match[2] : null;
  };

  const getToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )auth-token=([^;]+)"));
    return match ? match[2] : null;
  };

  const userId = getUserId();

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  // Estados para la gestión de citas
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = React.useState<
    Appointment[]
  >([]);
  const [patients, setPatients] = React.useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [selectedAppointment, setSelectedAppointment] =
    React.useState<Appointment | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<
    string | number | null
  >(null);

  // Estados para filtros
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");

  // Estados para el formulario de cita
  const [formData, setFormData] = React.useState({
    id_paciente: "",
    fecha_cita: "",
    hora_cita: "",
    motivo: "",
    estado: "Programada" as "Programada" | "Completada" | "Cancelada",
    observaciones: "",
  });

  const fetchAppointments = React.useCallback(async () => {
    if (!userId) {
      console.error("No userId found");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const token = getToken();
      const response = await axios.get(
        `http://localhost:3000/api/citas/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Appointments fetched:", response.data);

      const data = Array.isArray(response.data) ? response.data : [];
      setAppointments(data);
      setFilteredAppointments(data);
      setTotalPages(Math.ceil(data.length / 10));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      addToast({
        title: "Error",
        description: "No se pudieron cargar las citas",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchPatients = React.useCallback(async () => {
    if (!userId) return;

    try {
      const token = getToken();
      const response = await axios.get(
        `http://localhost:3000/api/pacientes/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Patients fetched:", response.data);
      const data = Array.isArray(response.data) ? response.data : [];
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      addToast({
        title: "Error",
        description: "No se pudieron cargar los pacientes",
        color: "danger",
      });
    }
  }, [userId]);

  // Función para filtrar citas
  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filtrar por búsqueda (motivo o paciente)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (appointment) =>
          appointment.motivo?.toLowerCase().includes(query) ||
          appointment.paciente?.nombre_completo?.toLowerCase().includes(query)
      );
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.estado === statusFilter
      );
    }

    // Filtrar por rango de fechas
    if (startDate && endDate) {
      filtered = filtered.filter((appointment) => {
        const appointmentDate = new Date(appointment.fecha_cita);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return appointmentDate >= start && appointmentDate <= end;
      });
    }

    setFilteredAppointments(filtered);
    setTotalPages(Math.ceil(filtered.length / 10));
    setCurrentPage(1);
  };

  // Cargar citas al iniciar
  React.useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, [fetchAppointments, fetchPatients]);

  // Filtrar citas cuando cambian los filtros
  React.useEffect(() => {
    filterAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, startDate, endDate, appointments]);

  // Función para abrir el modal de nueva cita
  const handleNewAppointment = () => {
    setIsEditing(false);
    setSelectedAppointment(null);
    setFormData({
      id_paciente: "",
      fecha_cita: "",
      hora_cita: "",
      motivo: "",
      estado: "Programada",
      observaciones: "",
    });
    onOpen();
  };

  // Función para abrir el modal de edición de cita
  const handleEditAppointment = (appointment: Appointment) => {
    setIsEditing(true);
    setSelectedAppointment(appointment);
    // Extract date and time from timestamp
    const appointmentDate = new Date(appointment.fecha_cita);
    const dateStr = appointmentDate.toISOString().split("T")[0];
    const timeStr = appointmentDate.toTimeString().slice(0, 5);

    setFormData({
      id_paciente: appointment.id_paciente?.toString() || "",
      fecha_cita: dateStr,
      hora_cita: timeStr,
      motivo: appointment.motivo,
      estado: appointment.estado,
      observaciones: appointment.observaciones || "",
    });
    onOpen();
  };

  // Función para confirmar eliminación de cita
  const handleDeleteConfirm = (id: string | number | undefined) => {
    if (id) setConfirmDelete(id);
  };

  // Función para eliminar cita
  const handleDeleteAppointment = async () => {
    if (!confirmDelete) return;

    setIsLoading(true);

    try {
      const token = getToken();
      await axios.delete(`http://localhost:3000/api/citas/${confirmDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh appointments list
      await fetchAppointments();
      setConfirmDelete(null);

      addToast({
        title: "Cita eliminada",
        description: "La cita ha sido eliminada correctamente",
        color: "success",
      });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      addToast({
        title: "Error",
        description: "No se pudo eliminar la cita",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para guardar cita (crear o actualizar)
  const handleSaveAppointment = async () => {
    // Validar campos requeridos
    if (
      !formData.id_paciente ||
      !formData.fecha_cita ||
      !formData.hora_cita ||
      !formData.motivo
    ) {
      addToast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        color: "danger",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getToken();
      // Combine date and time into ISO timestamp (without Z suffix)
      const combinedDateTime = new Date(
        `${formData.fecha_cita}T${formData.hora_cita}:00`
      );
      const isoString = combinedDateTime.toISOString().replace("Z", "");

      if (isEditing && selectedAppointment?.id_cita) {
        // Actualizar cita existente
        await axios.patch(
          `http://localhost:3000/api/citas/${selectedAppointment.id_cita}`,
          {
            id_paciente: parseInt(formData.id_paciente),
            fecha_cita: isoString,
            motivo: formData.motivo,
            estado: formData.estado,
            observaciones: formData.observaciones,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        addToast({
          title: "Cita actualizada",
          description: "La cita ha sido actualizada correctamente",
          color: "success",
        });
      } else {
        // Crear nueva cita
        await axios.post(
          "http://localhost:3000/api/citas",
          {
            id_usuario: userId,
            id_paciente: parseInt(formData.id_paciente),
            fecha_cita: isoString,
            motivo: formData.motivo,
            estado: formData.estado,
            observaciones: formData.observaciones,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        addToast({
          title: "Cita creada",
          description: "La cita ha sido creada correctamente",
          color: "success",
        });
      }

      // Refresh appointments list
      await fetchAppointments();
      onClose();
    } catch (error) {
      console.error("Error saving appointment:", error);
      addToast({
        title: "Error",
        description: "No se pudo guardar la cita",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Programada":
        return "primary";
      case "Completada":
        return "success";
      case "Cancelada":
        return "danger";
      default:
        return "default";
    }
  };

  // Función para verificar si una cita está próxima (menos de 2 días)
  const isUpcoming = (dateStr: string) => {
    const appointmentDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 2;
  };

  // Paginación
  const itemsPerPage = 10;
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Formatear fecha para mostrar
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateStr).toLocaleDateString("es-ES", options);
  };

  // Formatear hora para mostrar
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Citas Médicas</h1>
          <p className="text-default-500">
            Administra y programa citas con tus pacientes.
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Icon icon="lucide:plus" />}
          onPress={handleNewAppointment}
        >
          Nueva Cita
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar por paciente o motivo..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={
                <Icon icon="lucide:search" className="text-default-400" />
              }
              className="w-full md:w-1/3"
              isClearable
            />

            <div className="flex gap-2 flex-wrap">
              <Select
                placeholder="Filtrar por estado"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto min-w-[180px]"
              >
                <SelectItem key="all">Todos los estados</SelectItem>
                <SelectItem key="Programada">Programada</SelectItem>
                <SelectItem key="Completada">Completada</SelectItem>
                <SelectItem key="Cancelada">Cancelada</SelectItem>
              </Select>

              <Input
                type="date"
                placeholder="Fecha inicio"
                label="Desde"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto"
              />

              <Input
                type="date"
                placeholder="Fecha fin"
                label="Hasta"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Table
            removeWrapper
            aria-label="Tabla de citas médicas"
            isHeaderSticky
            classNames={{
              base: "max-h-[600px]",
            }}
          >
            <TableHeader>
              <TableColumn>PACIENTE</TableColumn>
              <TableColumn>FECHA Y HORA</TableColumn>
              <TableColumn>MOTIVO</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn>OBSERVACIONES</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              loadingContent={<div className="py-8">Cargando citas...</div>}
              emptyContent={
                <div className="py-8">
                  No se encontraron citas con los filtros aplicados.
                </div>
              }
            >
              {paginatedAppointments.map((appointment) => (
                <TableRow
                  key={appointment.id_cita}
                  className={
                    isUpcoming(appointment.fecha_cita)
                      ? "border-l-4 border-warning"
                      : ""
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center">
                        <Icon icon="lucide:user" className="text-default-500" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {appointment.paciente?.nombre_completo ||
                            "Sin nombre"}
                        </p>
                        <p className="text-tiny text-default-500">
                          {appointment.paciente?.email || ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{formatDate(appointment.fecha_cita)}</p>
                      <p className="text-tiny text-default-500">
                        {formatTime(appointment.fecha_cita)}
                      </p>
                      {isUpcoming(appointment.fecha_cita) && (
                        <Chip size="sm" color="warning" variant="flat">
                          Próxima
                        </Chip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[200px] truncate">
                      {appointment.motivo}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(appointment.estado)}
                      variant="flat"
                    >
                      {appointment.estado}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <p className="text-tiny text-default-500 max-w-[150px] truncate">
                      {appointment.observaciones || "Sin observaciones"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        isIconOnly
                        onPress={() => handleEditAppointment(appointment)}
                      >
                        <Icon icon="lucide:edit" />
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        isIconOnly
                        onPress={() => handleDeleteConfirm(appointment.id_cita)}
                      >
                        <Icon icon="lucide:trash" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <p className="text-small text-default-500">
              Mostrando{" "}
              {Math.min(
                (currentPage - 1) * itemsPerPage + 1,
                filteredAppointments.length
              )}
              –
              {Math.min(
                currentPage * itemsPerPage,
                filteredAppointments.length
              )}{" "}
              de {filteredAppointments.length} citas
            </p>
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={setCurrentPage}
            />
          </div>
        </CardBody>
      </Card>

      {/* Modal para crear/editar cita */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2 className="text-lg font-semibold">
                  {isEditing ? "Editar Cita" : "Nueva Cita"}
                </h2>
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Paciente"
                    placeholder="Seleccione un paciente"
                    selectedKeys={
                      formData.id_paciente ? [formData.id_paciente] : []
                    }
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      setFormData({ ...formData, id_paciente: selectedKey });
                    }}
                    isRequired
                  >
                    {patients.map((patient) => (
                      <SelectItem
                        key={patient.id_paciente.toString()}
                     
                      >
                        {patient.nombre_completo}
                      </SelectItem>
                    ))} 
                  </Select>

                  <Input
                    type="date"
                    label="Fecha"
                    placeholder="Seleccione fecha"
                    value={formData.fecha_cita}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha_cita: e.target.value })
                    }
                    isRequired
                  />

                  <Input
                    type="time"
                    label="Hora"
                    placeholder="Seleccione hora"
                    value={formData.hora_cita}
                    onChange={(e) =>
                      setFormData({ ...formData, hora_cita: e.target.value })
                    }
                    isRequired
                  />

                  <Input
                    label="Motivo"
                    placeholder="Ingrese motivo de la consulta"
                    value={formData.motivo}
                    onValueChange={(value) =>
                      setFormData({ ...formData, motivo: value })
                    }
                    className="md:col-span-2"
                    isRequired
                  />

                  <Select
                    label="Estado"
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estado: e.target.value as
                          | "Programada"
                          | "Completada"
                          | "Cancelada",
                      })
                    }
                  >
                    <SelectItem key="Programada">Programada</SelectItem>
                    <SelectItem key="Completada">Completada</SelectItem>
                    <SelectItem key="Cancelada">Cancelada</SelectItem>
                  </Select>

                  <div className="md:col-span-2">
                    <Textarea
                      label="Observaciones"
                      placeholder="Ingrese observaciones adicionales"
                      value={formData.observaciones}
                      onValueChange={(value) =>
                        setFormData({ ...formData, observaciones: value })
                      }
                      minRows={3}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleSaveAppointment}
                  isLoading={isSubmitting}
                >
                  {isEditing ? "Actualizar" : "Guardar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
        size="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2 className="text-lg font-semibold">Confirmar Eliminación</h2>
              </ModalHeader>
              <ModalBody>
                <p>
                  ¿Está seguro que desea eliminar esta cita? Esta acción no se
                  puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="danger" onPress={handleDeleteAppointment}>
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
