"use client";
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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatsCard } from "../components/stats-card";
import { PatientCard } from "../components/patient-card";
import { RiskLevelBadge } from "../components/risk-level-badge";
import { usePatients, type Patient } from "../hooks/use-patients";

export const DashboardPage = () => {
  const history = useRouter();
  const { patients } = usePatients();

  const safeAvgRisk = (patients: Patient[]) => {
    if (!patients || patients.length === 0) return 0;

    const sum = patients.reduce((acc, p) => acc + (p.nivel_riesgo || 0), 0);

    // 0/0 or Infinity check
    if (!isFinite(sum)) return 0;

    return Math.round(sum / patients.length);
  };

  // Get high-risk patients (risk level >= 70)
  const highRiskPatients = patients.filter(
    (patient) => (patient.nivel_riesgo || 0) >= 70
  );

  // Recent evaluations will be fetched separately when needed
  // For now, we'll hide this section or fetch it from a dedicated endpoint

  // Monthly evaluation data for chart
  const monthlyData = [
    { month: "Jan", evaluations: 45 },
    { month: "Feb", evaluations: 52 },
    { month: "Mar", evaluations: 48 },
    { month: "Apr", evaluations: 61 },
    { month: "May", evaluations: 55 },
    { month: "Jun", evaluations: 67 },
    { month: "Jul", evaluations: 72 },
  ];

  const handleViewPatientHistory = (patientId: string | number) => {
    history.push(`/patient-history?id=${patientId}`);
  };

  const handleNewEvaluation = (patientId: string | number) => {
    history.push(`/patient-evaluation?id=${patientId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Panel Principal</h1>
          <p className="text-default-500">Bienvenido de nuevo, Dr. Smith</p>
        </div>
        <Button
          color="primary"
          startContent={<Icon icon="lucide:plus" />}
          onPress={() => history.push("/patient-evaluation")}
        >
          Nueva Evaluación
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard
          title="Total de Pacientes"
          value={patients.length}
          icon="lucide:users"
          color="primary"
          trend={{ value: 12, isUpward: true }}
        />
        <StatsCard
          title="Evaluaciones"
          value={patients.reduce(
            (acc, p) => acc + (p.ultima_evaluacion ? 1 : 0),
            0
          )}
          icon="lucide:clipboard-check"
          color="secondary"
          trend={{ value: 8, isUpward: true }}
        />
        <StatsCard
          title="Pacientes de Alto Riesgo"
          value={highRiskPatients.length}
          icon="lucide:alert-triangle"
          color="danger"
          trend={{ value: 5, isUpward: true }}
        />
        <StatsCard
          title="Puntaje de Riesgo Prom."
          value={safeAvgRisk(patients)}
          icon="lucide:activity"
          color="warning"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex justify-between">
              <h2 className="text-lg font-semibold">Evaluaciones Mensuales</h2>
            </CardHeader>
            <CardBody>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--heroui-content1)",
                        border: "none",
                        borderRadius: "var(--heroui-radius-medium)",
                        boxShadow: "var(--heroui-shadow-sm)",
                      }}
                    />
                    <Bar
                      dataKey="evaluations"
                      fill="var(--heroui-primary)"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex justify-between">
              <h2 className="text-lg font-semibold">
                Pacientes de Alto Riesgo
              </h2>
              <Button
                size="sm"
                variant="flat"
                color="danger"
                onPress={() => history.push("/alerts")}
              >
                Ver Todos
              </Button>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {highRiskPatients.slice(0, 3).map((patient) => (
                  <div
                    key={patient.id_paciente}
                    className="flex justify-between items-center p-2 rounded-medium bg-content2"
                  >
                    <div>
                      <p className="font-medium">{patient.nombre_completo}</p>
                      <p className="text-tiny text-default-500">
                        ID: {patient.id_paciente}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <RiskLevelBadge
                        riskLevel={patient.nivel_riesgo || 0}
                        showText={false}
                      />
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={() =>
                          handleViewPatientHistory(patient.id_paciente)
                        }
                      >
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
                {highRiskPatients.length === 0 && (
                  <div className="py-8 text-center text-default-500">
                    <Icon
                      icon="lucide:check-circle"
                      className="text-success text-2xl mb-2"
                    />
                    <p>No hay pacientes de alto riesgo en este momento</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex justify-between">
            <h2 className="text-lg font-semibold">Evaluaciones Recientes</h2>
            <Button
              size="sm"
              variant="flat"
              color="secondary"
              onPress={() => history.push("/patient-history")}
            >
              Ver Todos los Registros
            </Button>
          </CardHeader>
          <CardBody>
            <Table removeWrapper aria-label="Recent patients table">
              <TableHeader>
                <TableColumn>PACIENTE</TableColumn>
                <TableColumn>ÚLTIMA EVALUACIÓN</TableColumn>
                <TableColumn>NIVEL DE RIESGO</TableColumn>
                <TableColumn>ACCIÓN</TableColumn>
              </TableHeader>
              <TableBody emptyContent={"No hay pacientes recientes"}>
                {patients.slice(0, 5).map((patient) => (
                  <TableRow key={patient.id_paciente}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{patient.nombre_completo}</p>
                        <p className="text-tiny text-default-500">
                          ID: {patient.id_paciente}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{patient.ultima_evaluacion || "N/A"}</TableCell>
                    <TableCell>
                      <RiskLevelBadge riskLevel={patient.nivel_riesgo || 0} />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() =>
                          handleViewPatientHistory(patient.id_paciente)
                        }
                      >
                        Ver Historial
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader className="flex justify-between">
            <h2 className="text-lg font-semibold">Pacientes Recientes</h2>
            <Button
              size="sm"
              variant="flat"
              color="secondary"
              onPress={() => history.push("/patient-history")}
            >
              Ver Todos los Pacientes
            </Button>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {patients.slice(0, 4).map((patient) => (
                <PatientCard
                  key={patient.id_paciente}
                  patient={patient}
                  onViewHistory={handleViewPatientHistory}
                  onNewEvaluation={handleNewEvaluation}
                />
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};
