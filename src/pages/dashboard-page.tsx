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
import { RiskLevelBadge } from "../components/risk-level-badge";
import { usePatients, type Patient } from "../hooks/use-patients";

export const DashboardPage = () => {
  const history = useRouter();
  const { patients, getPatientEvaluations } = usePatients();
  const [monthlyData, setMonthlyData] = React.useState<
    { month: string; evaluations: number }[]
  >([]);

  const safeAvgRisk = (patients: Patient[]) => {
    if (!patients || patients.length === 0) return 0;

    const sum = patients.reduce((acc, p) => acc + (p.nivel_riesgo || 0), 0);

    // 0/0 or Infinity check
    if (!isFinite(sum)) return 0;

    return Math.round(sum / patients.length);
  };

  // Get high-risk patients (risk level >= 70) and sort by risk descending
  const highRiskPatients = patients
    .filter((patient) => (patient.nivel_riesgo || 0) >= 70)
    .sort((a, b) => (b.nivel_riesgo || 0) - (a.nivel_riesgo || 0));

  // Get recent patients sorted by last evaluation date
  const recentPatients = [...patients].sort((a, b) => {
    if (!a.ultima_evaluacion) return 1;
    if (!b.ultima_evaluacion) return -1;
    return (
      new Date(b.ultima_evaluacion).getTime() -
      new Date(a.ultima_evaluacion).getTime()
    );
  });

  // Fetch and process monthly evaluation data
  React.useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        // Fetch evaluations for all patients
        const allEvaluationsPromises = patients.map((patient) =>
          getPatientEvaluations(patient.id_paciente)
        );

        const allEvaluationsArrays = await Promise.all(allEvaluationsPromises);
        const allEvaluations = allEvaluationsArrays.flat();

        // Generate last 12 months
        const months: {
          month: string;
          monthKey: string;
          evaluations: number;
        }[] = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = date.toLocaleDateString("es-ES", {
            month: "short",
          });
          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;

          months.push({
            month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            monthKey,
            evaluations: 0,
          });
        }

        // Count evaluations per month
        allEvaluations.forEach((evaluation) => {
          if (evaluation.fecha_reporte) {
            const evalDate = new Date(evaluation.fecha_reporte);
            const evalMonthKey = `${evalDate.getFullYear()}-${String(
              evalDate.getMonth() + 1
            ).padStart(2, "0")}`;

            const monthData = months.find((m) => m.monthKey === evalMonthKey);
            if (monthData) {
              monthData.evaluations++;
            }
          }
        });

        // Remove monthKey before setting state (only keep month and evaluations)
        setMonthlyData(
          months.map(({ month, evaluations }) => ({ month, evaluations }))
        );
      } catch (error) {
        console.error("Error fetching monthly data:", error);
        // Set empty data on error
        setMonthlyData([]);
      }
    };

    if (patients.length > 0) {
      fetchMonthlyData();
    } else {
      // If no patients, show empty chart for last 12 months
      const months: { month: string; evaluations: number }[] = [];
      const now = new Date();

      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString("es-ES", { month: "short" });

        months.push({
          month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          evaluations: 0,
        });
      }

      setMonthlyData(months);
    }
  }, [patients, getPatientEvaluations]);

  const handleViewPatientHistory = (patientId: string | number) => {
    history.push(`/patient-history?id=${patientId}`);
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
          className="hidden md:block lg:col-span-2"
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
                {recentPatients.slice(0, 5).map((patient) => (
                  <TableRow key={patient.id_paciente}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{patient.nombre_completo}</p>
                        <p className="text-tiny text-default-500">
                          ID: {patient.id_paciente}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.ultima_evaluacion || "Sin evaluación"}
                    </TableCell>
                    <TableCell>
                      <RiskLevelBadge
                        riskLevel={patient.nivel_riesgo || 0}
                        showText={true}
                      />
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
    </div>
  );
};

export default DashboardPage;
