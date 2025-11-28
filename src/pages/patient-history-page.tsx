"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  addToast,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { RiskLevelBadge } from "../components/risk-level-badge";
import { PatientCard } from "../components/patient-card";
import { usePatients, type PatientReport } from "../hooks/use-patients";

const PatientHistoryContent = () => {
  const history = useRouter();
  const location = useSearchParams();
  const { patients, getPatient, getPatientEvaluations, isLoadingPatients } =
    usePatients();

  // Get patient ID from URL query params if it exists
  const patientIdFromUrl = location?.get("id") ?? null;

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPatient, setSelectedPatient] = React.useState<
    string | number | null
  >(patientIdFromUrl);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "fecha_reporte",
    direction: "descending",
  });
  const [patientEvaluations, setPatientEvaluations] = React.useState<
    PatientReport[]
  >([]);
  const [isLoadingEvaluations, setIsLoadingEvaluations] = React.useState(false);
  const rowsPerPage = 10;

  // Filter patients based on search query and sort by ID descending (newest first)
  const filteredPatients = React.useMemo(() => {
    return patients
      .filter(
        (patient) =>
          patient.nombre_completo
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          patient.id_paciente.toString().includes(searchQuery)
      )
      .sort((a, b) => b.id_paciente - a.id_paciente);
  }, [patients, searchQuery]);

  // Fetch evaluations when selected patient changes
  React.useEffect(() => {
    const fetchEvaluations = async () => {
      if (!selectedPatient) {
        setPatientEvaluations([]);
        return;
      }

      setIsLoadingEvaluations(true);
      const evaluations = await getPatientEvaluations(selectedPatient);

      // Sort evaluations
      const sorted = evaluations.sort((a, b) => {
        const aValue = a[sortDescriptor.column as keyof PatientReport];
        const bValue = b[sortDescriptor.column as keyof PatientReport];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDescriptor.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDescriptor.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });

      setPatientEvaluations(sorted);
      setIsLoadingEvaluations(false);
    };

    fetchEvaluations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient, sortDescriptor]);

  // Pagination
  const pages = Math.ceil(filteredPatients.length / rowsPerPage);
  const paginatedPatients = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredPatients.slice(start, end);
  }, [filteredPatients, currentPage]);

  const handleViewPatient = (patientId: string | number) => {
    setSelectedPatient(patientId);
  };

  const handleNewEvaluation = (patientId: string | number) => {
    history.push(`/patient-evaluation?id=${patientId}`);
  };

  const handleViewReport = (evaluationId: number) => {
    history.push(`/risk-report/${evaluationId}`);
  };

  const handleSortChange = (column: string) => {
    setSortDescriptor((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const selectedPatientData = selectedPatient
    ? getPatient(selectedPatient)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historial de Pacientes</h1>
        <p className="text-default-500">
          Ver y gestionar el historial de pacientes y evaluaciones
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1 space-y-6"
        >
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Pacientes</h2>
              <Button
                size="sm"
                color="primary"
                variant="flat"
                startContent={<Icon icon="lucide:plus" />}
                onPress={() => history.push("/patient-evaluation")}
              >
                Nuevo Paciente
              </Button>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input
                  placeholder="Buscar pacientes..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  startContent={
                    <Icon icon="lucide:search" className="text-default-400" />
                  }
                  isClearable
                />

                {isLoadingPatients ? (
                  <div className="py-8 text-center">
                    <Spinner />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {paginatedPatients.length > 0 ? (
                      paginatedPatients.map((patient) => (
                        <div
                          key={patient.id_paciente}
                          className={`p-3 rounded-medium cursor-pointer transition-colors ${
                            selectedPatient === patient.id_paciente
                              ? "bg-primary text-white"
                              : "bg-content2 hover:bg-content3"
                          }`}
                          onClick={() => handleViewPatient(patient.id_paciente)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p
                                className={`font-medium ${
                                  selectedPatient === patient.id_paciente
                                    ? "text-white"
                                    : ""
                                }`}
                              >
                                {patient.nombre_completo}
                              </p>
                              <p
                                className={`text-tiny ${
                                  selectedPatient === patient.id_paciente
                                    ? "text-white/80"
                                    : "text-default-500"
                                }`}
                              >
                                ID: {patient.id_paciente} | {patient.edad} años
                                | {patient.sexo}
                              </p>
                            </div>
                            {patient.nivel_riesgo && (
                              <div
                                className={`text-tiny font-medium px-2 py-1 rounded-full ${
                                  patient.nivel_riesgo < 40
                                    ? "bg-success-100 text-success-600"
                                    : patient.nivel_riesgo < 70
                                    ? "bg-warning-100 text-warning-600"
                                    : "bg-danger-100 text-danger-600"
                                }`}
                              >
                                {patient.nivel_riesgo}%
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-default-500">
                        <Icon
                          icon="lucide:user-x"
                          className="text-default-300 text-2xl mb-2"
                        />
                        <p>No se encontraron pacientes</p>
                      </div>
                    )}
                  </div>
                )}

                {filteredPatients.length > rowsPerPage && (
                  <div className="flex justify-center">
                    <Pagination
                      total={pages}
                      initialPage={1}
                      page={currentPage}
                      onChange={setCurrentPage}
                      classNames={{
                        wrapper:
                          "gap-0 overflow-visible h-8 rounded-sm border border-divider",
                        item: "w-8 h-8 text-small rounded-none  text-black",
                        cursor:
                          "bg-linear-to-b shadow-lg from-primary  dark:from-default-300 dark:to-default-100 text-white font-bold",
                      }}
                    />
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {selectedPatient && selectedPatientData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PatientCard
                patient={selectedPatientData}
                onViewHistory={handleViewPatient}
                onNewEvaluation={handleNewEvaluation}
              />
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {selectedPatient
                  ? `Historial de Evaluaciones: ${selectedPatientData?.nombre_completo}`
                  : "Historial de Evaluaciones"}
              </h2>
              {selectedPatient && (
                <Button
                  color="primary"
                  size="sm"
                  onPress={() => handleNewEvaluation(selectedPatient)}
                >
                  Nueva Evaluación
                </Button>
              )}
            </CardHeader>
            <CardBody>
              {selectedPatient ? (
                isLoadingEvaluations ? (
                  <div className="py-12 text-center">
                    <Spinner />
                  </div>
                ) : patientEvaluations.length > 0 ? (
                  <Table removeWrapper aria-label="Patient evaluations table">
                    <TableHeader>
                      <TableColumn
                        className="cursor-pointer"
                        onClick={() => handleSortChange("fecha_reporte")}
                      >
                        <div className="flex items-center gap-1">
                          FECHA
                          {sortDescriptor.column === "fecha_reporte" && (
                            <Icon
                              icon={
                                sortDescriptor.direction === "ascending"
                                  ? "lucide:arrow-up"
                                  : "lucide:arrow-down"
                              }
                              className="text-tiny"
                            />
                          )}
                        </div>
                      </TableColumn>
                      <TableColumn
                        className="cursor-pointer"
                        onClick={() => handleSortChange("puntuacion_riesgo")}
                      >
                        <div className="flex items-center gap-1">
                          RIESGO
                          {sortDescriptor.column === "puntuacion_riesgo" && (
                            <Icon
                              icon={
                                sortDescriptor.direction === "ascending"
                                  ? "lucide:arrow-up"
                                  : "lucide:arrow-down"
                              }
                              className="text-tiny"
                            />
                          )}
                        </div>
                      </TableColumn>
                      <TableColumn>ACCIONES</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {patientEvaluations.map((evaluation) => (
                        <TableRow key={evaluation.id_reporte}>
                          <TableCell>{evaluation.fecha_reporte}</TableCell>
                          <TableCell>
                            <RiskLevelBadge
                              riskLevel={evaluation.puntuacion_riesgo || 0}
                              showText={true}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                onPress={() =>
                                  handleViewReport(evaluation.id_reporte)
                                }
                              >
                                Ver Informe
                              </Button>
                              <Dropdown>
                                <DropdownTrigger>
                                  <Button size="sm" variant="flat" isIconOnly>
                                    <Icon icon="lucide:more-vertical" />
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                  aria-label="Actions"
                                  onAction={(key) => {
                                    if (key === "download") {
                                      const link = document.createElement("a");
                                      link.href = evaluation.url_pdf;
                                      link.download = `reporte_${evaluation.id_reporte}.pdf`;
                                      link.click();
                                    }
                                    if (key === "send") {
                                      const patientEmail =
                                        selectedPatientData?.email;

                                      if (!patientEmail) {
                                        // We can't use toast here easily without importing it or passing it down,
                                        // but for now let's alert or just log since this is inside a map
                                        // Ideally we should use the addToast hook if available in this scope
                                        console.warn("No email for patient");
                                        return;
                                      }

                                      const subject = encodeURIComponent(
                                        `Reporte de Evaluación de Riesgo - ${selectedPatientData?.nombre_completo}`
                                      );
                                      const body = encodeURIComponent(
                                        `Estimado(a) ${selectedPatientData?.nombre_completo},\n\nAdjunto encontrará el enlace a su reporte de evaluación de riesgo cardiovascular:\n\n${evaluation.url_pdf}\n\nAtentamente,\nSu Equipo Médico`
                                      );

                                      window.location.href = `mailto:${patientEmail}?subject=${subject}&body=${body}`;

                                      addToast({
                                        title: "Abriendo Cliente de Correo",
                                        description:
                                          "Se está abriendo su aplicación de correo predeterminada. Si no sucede nada, asegúrese de tener una instalada (ej. Outlook).",
                                        color: "warning",
                                      });
                                    }
                                  }}
                                >
                                  <DropdownItem key="download">
                                    Revisar PDF
                                  </DropdownItem>
                                  <DropdownItem key="send">
                                    Enviar al Paciente
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center text-default-500">
                    <Icon
                      icon="lucide:file-x"
                      className="text-default-300 text-3xl mb-2"
                    />
                    <p>No se encontraron evaluaciones para este paciente</p>
                    <Button
                      color="primary"
                      className="mt-4"
                      onPress={() => handleNewEvaluation(selectedPatient)}
                    >
                      Crear Primera Evaluación
                    </Button>
                  </div>
                )
              ) : (
                <div className="py-12 text-center text-default-500">
                  <Icon
                    icon="lucide:user-search"
                    className="text-default-300 text-3xl mb-2"
                  />
                  <p>
                    Seleccione un paciente para ver su historial de evaluaciones
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export const PatientHistoryPage = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <PatientHistoryContent />
    </React.Suspense>
  );
};

export default PatientHistoryPage;
