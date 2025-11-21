"use client"
import React from "react";
import { useRouter } from "next/navigation";
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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Textarea,
  DatePicker,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
import { parseDate, getLocalTimeZone } from "@internationalized/date";

interface Doctor {
  id: string;
  name: string;
}

interface Patient {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: "Programada" | "Completada" | "Cancelada";
  notes?: string;
  reminderSent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AppointmentsPage = () => {

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  // Estados para la gestión de citas
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = React.useState<
    Appointment[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [selectedAppointment, setSelectedAppointment] =
    React.useState<Appointment | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

  // Estados para filtros
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");

  // Estados para el formulario de cita
  const [formData, setFormData] = React.useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    reason: "",
    status: "Programada" as "Programada" | "Completada" | "Cancelada",
    notes: "",
  });

  const fetchAppointments = async () => {
    setIsLoading(true);

    // Simulación de llamada a API
    setTimeout(() => {
      const mockAppointments: Appointment[] = [
        {
          id: "A-001",
          patientId: "P-1001",
          patientName: "John Smith",
          doctorId: "D-001",
          doctorName: "Dr. Juan Pérez",
          date: "2024-07-20",
          time: "09:30",
          reason: "Control de presión arterial",
          status: "Programada",
          notes: "Paciente con hipertensión controlada",
          reminderSent: true,
          createdAt: "2024-07-15T10:30:00",
          updatedAt: "2024-07-15T10:30:00",
        },
        {
          id: "A-002",
          patientId: "P-1002",
          patientName: "Sarah Johnson",
          doctorId: "D-002",
          doctorName: "Dra. María García",
          date: "2024-07-18",
          time: "11:00",
          reason: "Evaluación de riesgo cardiovascular",
          status: "Programada",
          reminderSent: true,
          createdAt: "2024-07-14T14:20:00",
          updatedAt: "2024-07-14T14:20:00",
        },
        {
          id: "A-003",
          patientId: "P-1003",
          patientName: "Michael Brown",
          doctorId: "D-001",
          doctorName: "Dr. Juan Pérez",
          date: "2024-07-15",
          time: "16:45",
          reason: "Seguimiento post-operatorio",
          status: "Completada",
          notes: "Paciente evoluciona favorablemente",
          createdAt: "2024-07-10T09:15:00",
          updatedAt: "2024-07-15T17:30:00",
        },
        {
          id: "A-004",
          patientId: "P-1004",
          patientName: "Emily Davis",
          doctorId: "D-003",
          doctorName: "Dr. Carlos Rodríguez",
          date: "2024-07-16",
          time: "10:15",
          reason: "Consulta por dolor en el pecho",
          status: "Cancelada",
          notes: "Paciente reprogramará",
          createdAt: "2024-07-12T11:20:00",
          updatedAt: "2024-07-15T08:45:00",
        },
        {
          id: "A-005",
          patientId: "P-1005",
          patientName: "Robert Wilson",
          doctorId: "D-002",
          doctorName: "Dra. María García",
          date: "2024-07-21",
          time: "15:00",
          reason: "Revisión de electrocardiograma",
          status: "Programada",
          createdAt: "2024-07-16T13:10:00",
          updatedAt: "2024-07-16T13:10:00",
        },
      ];

      setAppointments(mockAppointments);
      setFilteredAppointments(mockAppointments);
      setTotalPages(Math.ceil(mockAppointments.length / 10));
      setIsLoading(false);
    }, 1000);
  };

  // Datos de ejemplo para doctores y pacientes
  const doctors: Doctor[] = [
    { id: "D-001", name: "Dr. Juan Pérez" },
    { id: "D-002", name: "Dra. María García" },
    { id: "D-003", name: "Dr. Carlos Rodríguez" },
  ];

  const patients: Patient[] = [
    { id: "P-1001", name: "John Smith" },
    { id: "P-1002", name: "Sarah Johnson" },
    { id: "P-1003", name: "Michael Brown" },
    { id: "P-1004", name: "Emily Davis" },
    { id: "P-1005", name: "Robert Wilson" },
  ];

  // Función para filtrar citas
  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (appointment) =>
          appointment.patientName.toLowerCase().includes(query) ||
          appointment.doctorName.toLowerCase().includes(query)
      );
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.status === statusFilter
      );
    }

    // Filtrar por rango de fechas
    if (startDate && endDate) {
      filtered = filtered.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
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
  }, []);

  // Filtrar citas cuando cambian los filtros
  React.useEffect(() => {
    filterAppointments();
  }, [searchQuery, statusFilter, startDate, endDate, appointments]);

  // Función para cargar citas desde el API

  // Función para abrir el modal de nueva cita
  const handleNewAppointment = () => {
    setIsEditing(false);
    setSelectedAppointment(null);
    setFormData({
      patientId: "",
      doctorId: "",
      date: "",
      time: "",
      reason: "",
      status: "Programada",
      notes: "",
    });
    onOpen();
  };

  // Función para abrir el modal de edición de cita
  const handleEditAppointment = (appointment: Appointment) => {
    setIsEditing(true);
    setSelectedAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
      notes: appointment.notes || "",
    });
    onOpen();
  };

  // Función para confirmar eliminación de cita
  const handleDeleteConfirm = (id: string) => {
    setConfirmDelete(id);
  };

  // Función para eliminar cita
  const handleDeleteAppointment = async () => {
    if (!confirmDelete) return;

    // Simulación de llamada a API DELETE
    setIsLoading(true);

    setTimeout(() => {
      const updatedAppointments = appointments.filter(
        (appointment) => appointment.id !== confirmDelete
      );

      setAppointments(updatedAppointments);
      setConfirmDelete(null);
      setIsLoading(false);

      addToast({
        title: "Cita eliminada",
        description: "La cita ha sido eliminada correctamente",
        color: "success",
      });
    }, 1000);
  };

  // Función para guardar cita (crear o actualizar)
  const handleSaveAppointment = async () => {
    // Validar campos requeridos
    if (
      !formData.patientId ||
      !formData.doctorId ||
      !formData.date ||
      !formData.time ||
      !formData.reason
    ) {
      addToast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        color: "danger",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulación de llamada a API POST o PUT
    setTimeout(() => {
      if (isEditing && selectedAppointment) {
        // Actualizar cita existente
        const updatedAppointments = appointments.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? {
                ...appointment,
                patientId: formData.patientId,
                patientName:
                  patients.find((p) => p.id === formData.patientId)?.name || "",
                doctorId: formData.doctorId,
                doctorName:
                  doctors.find((d) => d.id === formData.doctorId)?.name || "",
                date: formData.date,
                time: formData.time,
                reason: formData.reason,
                status: formData.status,
                notes: formData.notes,
                updatedAt: new Date().toISOString(),
              }
            : appointment
        );

        setAppointments(updatedAppointments);

        addToast({
          title: "Cita actualizada",
          description: "La cita ha sido actualizada correctamente",
          color: "success",
        });
      } else {
        // Crear nueva cita
        const newAppointment: Appointment = {
          id: `A-${(appointments.length + 1).toString().padStart(3, "0")}`,
          patientId: formData.patientId,
          patientName:
            patients.find((p) => p.id === formData.patientId)?.name || "",
          doctorId: formData.doctorId,
          doctorName:
            doctors.find((d) => d.id === formData.doctorId)?.name || "",
          date: formData.date,
          time: formData.time,
          reason: formData.reason,
          status: formData.status,
          notes: formData.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setAppointments([...appointments, newAppointment]);

        addToast({
          title: "Cita creada",
          description: "La cita ha sido creada correctamente",
          color: "success",
        });
      }

      setIsSubmitting(false);
      onClose();
    }, 1500);
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
              placeholder="Buscar por paciente o doctor..."
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
              <TableColumn>DOCTOR</TableColumn>
              <TableColumn>FECHA Y HORA</TableColumn>
              <TableColumn>MOTIVO</TableColumn>
              <TableColumn>ESTADO</TableColumn>
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
                  key={appointment.id}
                  className={
                    isUpcoming(appointment.date)
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
                        <p className="font-medium">{appointment.patientName}</p>
                        <p className="text-tiny text-default-500">
                          ID: {appointment.patientId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{appointment.doctorName}</p>
                      <p className="text-tiny text-default-500">
                        ID: {appointment.doctorId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{formatDate(appointment.date)}</p>
                      <p className="text-tiny text-default-500">
                        {appointment.time}
                      </p>
                      {isUpcoming(appointment.date) && (
                        <Chip size="sm" color="warning" variant="flat">
                          Próxima
                        </Chip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[200px] truncate">
                      {appointment.reason}
                    </p>
                    {appointment.reminderSent && (
                      <div className="flex items-center gap-1 text-tiny text-success mt-1">
                        <Icon icon="lucide:mail-check" width={14} height={14} />
                        <span>Recordatorio enviado</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(appointment.status)}
                      variant="flat"
                    >
                      {appointment.status}
                    </Chip>
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
                        onPress={() => handleDeleteConfirm(appointment.id)}
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
                    value={formData.patientId}
                    onChange={(e) =>
                      setFormData({ ...formData, patientId: e.target.value })
                    }
                    isRequired
                  >
                    {patients.map((patient) => (
                      <SelectItem key={patient.id}>{patient.name}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Doctor"
                    placeholder="Seleccione un doctor"
                    value={formData.doctorId}
                    onChange={(e) =>
                      setFormData({ ...formData, doctorId: e.target.value })
                    }
                    isRequired
                  >
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id}>{doctor.name}</SelectItem>
                    ))}
                  </Select>

                  <Input
                    type="date"
                    label="Fecha"
                    placeholder="Seleccione fecha"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    isRequired
                  />

                  <Input
                    type="time"
                    label="Hora"
                    placeholder="Seleccione hora"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    isRequired
                  />

                  <Input
                    label="Motivo"
                    placeholder="Ingrese motivo de la consulta"
                    value={formData.reason}
                    onValueChange={(value) =>
                      setFormData({ ...formData, reason: value })
                    }
                    className="md:col-span-2"
                    isRequired
                  />

                  <Select
                    label="Estado"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as
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
                      placeholder="Ingrese notas adicionales"
                      value={formData.notes}
                      onValueChange={(value) =>
                        setFormData({ ...formData, notes: value })
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
