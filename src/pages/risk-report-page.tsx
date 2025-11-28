"use client";
import React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { usePatients, type PatientEvaluation } from "../hooks/use-patients";
import { addToast } from "@heroui/react";

export const RiskReportPage = () => {
  const params = useParams();
  const history = useRouter();
  const { getEvaluation } = usePatients();
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const [evaluation, setEvaluation] = React.useState<PatientEvaluation | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const id = params?.id ?? null;

  // Fetch evaluation data
  React.useEffect(() => {
    const fetchEvaluation = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const data = await getEvaluation(id as string);
      setEvaluation(data);
      setIsLoading(false);
    };

    fetchEvaluation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 40) return "success";
    if (riskScore < 70) return "warning";
    return "danger";
  };

  const getRiskText = (riskScore: number) => {
    if (riskScore < 40) return "Riesgo Bajo";
    if (riskScore < 70) return "Riesgo Moderado";
    return "Riesgo Alto";
  };

  const handleGeneratePDF = () => {
    if (!evaluation?.url_pdf) {
      addToast({
        title: "Error",
        description: "No hay PDF disponible para este reporte",
        color: "danger",
      });
      return;
    }

    setIsGeneratingPDF(true);

    // Download the PDF
    const link = document.createElement("a");
    link.href = evaluation.url_pdf;
    link.download = `reporte_${evaluation.id_reporte}.pdf`;
    link.click();

    setTimeout(() => {
      setIsGeneratingPDF(false);
      addToast({
        title: "PDF Descargado",
        description: "El reporte ha sido descargado exitosamente",
        color: "success",
      });
    }, 1000);
  };

  const handleSendToPatient = () => {
    if (!evaluation?.email) {
      addToast({
        title: "Error",
        description: "El paciente no tiene un correo electrónico registrado",
        color: "danger",
      });
      return;
    }

    if (!evaluation?.url_pdf) {
      addToast({
        title: "Error",
        description: "No hay PDF disponible para enviar",
        color: "danger",
      });
      return;
    }

    const subject = encodeURIComponent(
      `Reporte de Evaluación de Riesgo - ${evaluation.nombre_completo}`
    );
    const body = encodeURIComponent(
      `Estimado(a) ${evaluation.nombre_completo},\n\nAdjunto encontrará el enlace a su reporte de evaluación de riesgo cardiovascular:\n\n${evaluation.url_pdf}\n\nAtentamente,\nSu Equipo Médico`
    );

    window.location.href = `mailto:${evaluation.email}?subject=${subject}&body=${body}`;

    addToast({
      title: "Abriendo Cliente de Correo",
      description:
        "Se está abriendo su aplicación de correo predeterminada. Si no sucede nada, asegúrese de tener una instalada (ej. Outlook).",
      color: "warning",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Spinner size="lg" />
        <p className="text-default-500 mt-4">Cargando reporte...</p>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Icon
          icon="lucide:file-question"
          className="text-4xl text-default-400 mb-4"
        />
        <p className="text-default-500">Reporte de evaluación no encontrado</p>
        <Button
          color="primary"
          variant="flat"
          className="mt-4"
          onPress={() => history.push("/dashboard")}
        >
          Volver al Panel Principal
        </Button>
      </div>
    );
  }

  // Data for pie chart
  const pieData =
    evaluation.enfermedades?.map((disease) => ({
      name: disease.nombre,
      value: Math.round(disease.probabilidad * 100),
    })) || [];

  // Colors for pie chart
  const COLORS = ["#1ABC9C", "#2980B9", "#9B59B6", "#F1C40F", "#E74C3C"];

  // Parse symptoms if it's a string
  const symptoms =
    typeof evaluation.sintomas === "string"
      ? evaluation.sintomas
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Informe de Evaluación de Riesgo
          </h1>
          <p className="text-default-500">
            Paciente: {evaluation.nombre_completo} | ID:{" "}
            {evaluation.id_paciente} | Fecha: {evaluation.fecha_reporte}
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button
            variant="flat"
            color="secondary"
            startContent={<Icon icon="lucide:mail" />}
            onPress={handleSendToPatient}
          >
            Enviar al Paciente
          </Button>
          <Button
            color="primary"
            startContent={<Icon icon="lucide:file-text" />}
            isLoading={isGeneratingPDF}
            onPress={handleGeneratePDF}
          >
            {isGeneratingPDF ? "Descargando..." : "Descargar PDF"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Resumen de Riesgo</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-default-200 mb-4">
                  <span
                    className={`text-4xl font-bold text-${getRiskColor(
                      evaluation.puntuacion_riesgo || 0
                    )}`}
                  >
                    {evaluation.puntuacion_riesgo}%
                  </span>
                </div>
                <h3
                  className={`text-xl font-semibold text-${getRiskColor(
                    evaluation.puntuacion_riesgo || 0
                  )}`}
                >
                  {getRiskText(evaluation.puntuacion_riesgo || 0)}
                </h3>
                <p className="text-default-500 mt-1">
                  Puntaje de Riesgo Cardiovascular
                </p>
              </div>

              <div>
                <div className="flex justify-between text-small mb-1">
                  <span>Bajo</span>
                  <span>Moderado</span>
                  <span>Alto</span>
                </div>
                <Progress
                  aria-label="Risk progress"
                  value={evaluation.puntuacion_riesgo}
                  color={getRiskColor(evaluation.puntuacion_riesgo || 0)}
                  className="h-3"
                />
              </div>

              <div className="space-y-2">
                <p className="font-medium">Factores de Riesgo Clave:</p>
                <ul className="space-y-1 text-small">
                  {evaluation.tabaquismo && (
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="lucide:alert-circle"
                        className="text-danger"
                      />
                      <span>Fumador</span>
                    </li>
                  )}
                  {evaluation.presion_sistolica > 140 && (
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="lucide:alert-circle"
                        className="text-danger"
                      />
                      <span>
                        Presión Arterial Alta ({evaluation.presion_sistolica}/
                        {evaluation.presion_diastolica} mmHg)
                      </span>
                    </li>
                  )}
                  {evaluation.colesterol_total > 200 && (
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="lucide:alert-circle"
                        className="text-danger"
                      />
                      <span>
                        Colesterol Alto ({evaluation.colesterol_total} mg/dL)
                      </span>
                    </li>
                  )}
                  {evaluation.imc > 30 && (
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="lucide:alert-circle"
                        className="text-danger"
                      />
                      <span>Obesidad (IMC: {evaluation.imc})</span>
                    </li>
                  )}
                  {evaluation.antecedentes_familiares && (
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="lucide:alert-circle"
                        className="text-danger"
                      />
                      <span>Antecedentes Familiares de ECV</span>
                    </li>
                  )}
                  {evaluation.edad > 65 && (
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="lucide:alert-circle"
                        className="text-danger"
                      />
                      <span>Edad Avanzada ({evaluation.edad} años)</span>
                    </li>
                  )}
                </ul>

                <Divider className="my-3" />

                <p className="font-medium">Información de Contacto:</p>
                <ul className="space-y-1 text-small">
                  <li className="flex items-center gap-2">
                    <Icon icon="lucide:mail" className="text-primary" />
                    <span>{evaluation.email || "No disponible"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="lucide:phone" className="text-primary" />
                    <span>{evaluation.telefono || "No disponible"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="lucide:calendar" className="text-primary" />
                    <span>
                      Fecha de nacimiento:{" "}
                      {evaluation.fecha_nacimiento || "No disponible"}
                    </span>
                  </li>
                </ul>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">
                Análisis de Probabilidad de Enfermedades
              </h2>
            </CardHeader>
            <CardBody>
              {pieData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Probabilidad"]}
                          contentStyle={{
                            backgroundColor: "var(--heroui-content1)",
                            border: "none",
                            borderRadius: "var(--heroui-radius-medium)",
                            boxShadow: "var(--heroui-shadow-sm)",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <Table removeWrapper aria-label="Disease probability table">
                      <TableHeader>
                        <TableColumn>ENFERMEDAD</TableColumn>
                        <TableColumn>PROBABILIDAD</TableColumn>
                        <TableColumn>NIVEL</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {(evaluation.enfermedades ?? []).map(
                          (disease, index) => {
                            const probability = Math.round(
                              disease.probabilidad * 100
                            );
                            let riskColor: "success" | "warning" | "danger";

                            if (probability < 40) riskColor = "success";
                            else if (probability < 70) riskColor = "warning";
                            else riskColor = "danger";

                            return (
                              <TableRow key={index}>
                                <TableCell>{disease.nombre}</TableCell>
                                <TableCell>{probability}%</TableCell>
                                <TableCell>
                                  <div
                                    className={`px-2 py-1 rounded-full bg-${riskColor}-100 text-${riskColor} text-tiny inline-block`}
                                  >
                                    {probability < 40
                                      ? "Bajo"
                                      : probability < 70
                                      ? "Moderado"
                                      : "Alto"}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          }
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-default-500">
                  <p>No hay datos de enfermedades disponibles</p>
                </div>
              )}
            </CardBody>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Datos del Paciente</h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Demografía</h3>
                    <div className="space-y-2 text-small">
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          ID del Paciente:
                        </span>
                        <span>{evaluation.id_paciente}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Nombre:</span>
                        <span>{evaluation.nombre_completo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Edad:</span>
                        <span>{evaluation.edad} años</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Género:</span>
                        <span>{evaluation.sexo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">IMC:</span>
                        <span>{evaluation.imc} kg/m²</span>
                      </div>
                    </div>

                    <Divider className="my-3" />

                    <h3 className="font-medium mb-2">
                      Factores de Estilo de Vida
                    </h3>
                    <div className="space-y-2 text-small">
                      <div className="flex justify-between">
                        <span className="text-default-500">Fumador:</span>
                        <span>{evaluation.tabaquismo ? "Sí" : "No"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Consumo de Alcohol:
                        </span>
                        <span>{evaluation.consumo_alcohol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Actividad Física:
                        </span>
                        <span>{evaluation.actividad_fisica}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Antecedentes Familiares:
                        </span>
                        <span>
                          {evaluation.antecedentes_familiares ? "Sí" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Mediciones Clínicas</h3>
                    <div className="space-y-2 text-small">
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Presión Arterial:
                        </span>
                        <span>
                          {evaluation.presion_sistolica}/
                          {evaluation.presion_diastolica} mmHg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Colesterol Total:
                        </span>
                        <span>{evaluation.colesterol_total} mg/dL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Colesterol LDL:
                        </span>
                        <span>{evaluation.colesterol_ldl} mg/dL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Colesterol HDL:
                        </span>
                        <span>{evaluation.colesterol_hdl} mg/dL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Glucosa en Sangre:
                        </span>
                        <span>{evaluation.glucosa} mg/dL</span>
                      </div>
                    </div>

                    {symptoms.length > 0 && (
                      <>
                        <Divider className="my-3" />

                        <h3 className="font-medium mb-2">
                          Síntomas Reportados
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {symptoms.map((symptom, index) => (
                            <div
                              key={index}
                              className="px-2 py-1 rounded-full bg-default-100 text-tiny"
                            >
                              {symptom}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardBody>
              <CardFooter>
                <div className="w-full">
                  <h3 className="font-medium mb-2">Recomendaciones</h3>
                  <div className="p-3 rounded-medium bg-content2 text-small">
                    {evaluation.puntuacion_riesgo &&
                    evaluation.puntuacion_riesgo >= 70 ? (
                      <p>
                        <span className="font-semibold">Riesgo Alto:</span> Se
                        recomienda atención médica inmediata. Programe pruebas
                        de seguimiento que incluyan ECG, prueba de esfuerzo y
                        panel lipídico. Considere medicación para el manejo de
                        la presión arterial y el colesterol. Las modificaciones
                        en el estilo de vida son críticas.
                      </p>
                    ) : evaluation.puntuacion_riesgo &&
                      evaluation.puntuacion_riesgo >= 40 ? (
                      <p>
                        <span className="font-semibold">Riesgo Moderado:</span>{" "}
                        Se aconseja monitoreo regular. Programe seguimiento en 3
                        meses. Enfóquese en modificaciones del estilo de vida
                        incluyendo dieta, ejercicio y dejar de fumar si
                        corresponde. Considere medicación preventiva según
                        factores de riesgo específicos.
                      </p>
                    ) : (
                      <p>
                        <span className="font-semibold">Riesgo Bajo:</span>{" "}
                        Continúe con hábitos de vida saludables. Se recomiendan
                        chequeos anuales. Mantenga actividad física y dieta
                        saludable. Monitoree presión arterial y colesterol
                        anualmente.
                      </p>
                    )}
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="flat"
          startContent={<Icon icon="lucide:arrow-left" />}
          onPress={() => history.back()}
        >
          Volver
        </Button>
        <Button
          color="primary"
          onPress={() =>
            history.push(`/patient-evaluation?id=${evaluation.id_paciente}`)
          }
        >
          Nueva Evaluación
        </Button>
      </div>
    </div>
  );
};

export default RiskReportPage;
