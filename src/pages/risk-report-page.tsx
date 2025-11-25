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
import { usePatients } from "../hooks/use-patients";
import { addToast } from "@heroui/react";

export const RiskReportPage = () => {
  const params = useParams();
  const history = useRouter();
  const { getEvaluation, getPatient } = usePatients();
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const id = params?.id ?? null;

  const evaluation = getEvaluation(id as string);
  const patient = evaluation ? getPatient(evaluation.patientId) : null;

  if (!evaluation || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Icon
          icon="lucide:file-question"
          className="text-4xl text-default-400 mb-4"
        />
        <p className="text-default-500">Evaluation report not found</p>
        <Button
          color="primary"
          variant="flat"
          className="mt-4"
          onPress={() => history.push("/dashboard")}
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 40) return "success";
    if (riskScore < 70) return "warning";
    return "danger";
  };

  const getRiskText = (riskScore: number) => {
    if (riskScore < 40) return "Low Risk";
    if (riskScore < 70) return "Moderate Risk";
    return "High Risk";
  };

  const handleGeneratePDF = () => {
    setIsGeneratingPDF(true);

    // Simulate PDF generation
    setTimeout(() => {
      setIsGeneratingPDF(false);
      addToast({
        title: "PDF Generated",
        description: "Report has been downloaded successfully",
        color: "success",
      });
    }, 2000);
  };

  const handleSendToPatient = () => {
    addToast({
      title: "Report Sent",
      description: "Report has been sent to the patient's email",
      color: "success",
    });
  };

  // Data for pie chart
  const pieData =
    evaluation.diseases?.map((disease) => ({
      name: disease.name,
      value: Math.round(disease.probability * 100),
    })) || [];

  // Colors for pie chart
  const COLORS = ["#1ABC9C", "#2980B9", "#9B59B6", "#F1C40F", "#E74C3C"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Informe de Evaluación de Riesgo
          </h1>
          <p className="text-default-500">
            Paciente: {patient.name} | ID: {patient.id} | Fecha:{" "}
            {evaluation.date}
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
            onClick={() => {
    const link = document.createElement("a");
    link.href = "https://fwluwiovzewlrcvkptbw.supabase.co/storage/v1/object/public/expedientes/reports/paciente_31/reporte_1763950696477.pdf"; // tu URL
    link.download = "reporte_P-1001.pdf"; 
    link.click();
  }}
          >
            {isGeneratingPDF ? "Generando..." : "Descargar PDF"}
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
                      evaluation.riskScore || 0
                    )}`}
                  >
                    {evaluation.riskScore}%
                  </span>
                </div>
                <h3
                  className={`text-xl font-semibold text-${getRiskColor(
                    evaluation.riskScore || 0
                  )}`}
                >
                  {getRiskText(evaluation.riskScore || 0) === "Low Risk"
                    ? "Riesgo Bajo"
                    : getRiskText(evaluation.riskScore || 0) === "Moderate Risk"
                    ? "Riesgo Moderado"
                    : "Riesgo Alto"}
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
                  value={evaluation.riskScore}
                  color={getRiskColor(evaluation.riskScore || 0)}
                  className="h-3"
                />
              </div>

              <div className="space-y-2">
                <p className="font-medium">Factores de Riesgo Clave:</p>
                <ul className="space-y-1 text-small">
                  {evaluation.smoking && (
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="lucide:alert-circle"
                        className="text-danger"
                      />
                      <span>Fumador</span>
                    </li>
                  )}
                  {evaluation.bloodPressureSystolic > 140 && (
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="lucide:alert-circle"
                        className="text-danger"
                      />
                      <span>
                        Presión Arterial Alta (
                        {evaluation.bloodPressureSystolic}/
                        {evaluation.bloodPressureDiastolic} mmHg)
                      </span>
                    </li>
                  )}
                  {evaluation.cholesterolTotal > 200 && (
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="lucide:alert-circle"
                        className="text-danger"
                      />
                      <span>
                        Colesterol Alto ({evaluation.cholesterolTotal} mg/dL)
                      </span>
                    </li>
                  )}
                  {evaluation.bmi > 30 && (
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="lucide:alert-circle"
                        className="text-danger"
                      />
                      <span>Obesidad (IMC: {evaluation.bmi})</span>
                    </li>
                  )}
                  {evaluation.familyHistory && (
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="lucide:alert-circle"
                        className="text-danger"
                      />
                      <span>Antecedentes Familiares de ECV</span>
                    </li>
                  )}
                  {evaluation.age > 65 && (
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="lucide:alert-circle"
                        className="text-danger"
                      />
                      <span>Edad Avanzada ({evaluation.age} años)</span>
                    </li>
                  )}
                </ul>

                <Divider className="my-3" />

                <p className="font-medium">Información de Contacto:</p>
                <ul className="space-y-1 text-small">
                  <li className="flex items-center gap-2">
                    <Icon icon="lucide:mail" className="text-primary" />
                    <span>{patient.email || "No disponible"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="lucide:phone" className="text-primary" />
                    <span>{patient.phone || "No disponible"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="lucide:calendar" className="text-primary" />
                    <span>
                      Fecha de nacimiento:{" "}
                      {patient.birthDate || "No disponible"}
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
                        formatter={(value) => [`${value}%`, "Probability"]}
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
                      {(evaluation.diseases ?? []).map((disease, index) => {
                        const probability = Math.round(
                          disease.probability * 100
                        );
                        let riskColor: "success" | "warning" | "danger";

                        if (probability < 40) riskColor = "success";
                        else if (probability < 70) riskColor = "warning";
                        else riskColor = "danger";

                        return (
                          <TableRow key={index}>
                            <TableCell>{disease.name}</TableCell>
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
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
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
                        <span>{patient.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Nombre:</span>
                        <span>{patient.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Edad:</span>
                        <span>{evaluation.age} años</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Género:</span>
                        <span>
                          {evaluation.gender === "male"
                            ? "Masculino"
                            : evaluation.gender === "female"
                            ? "Femenino"
                            : "Otro"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">IMC:</span>
                        <span>{evaluation.bmi} kg/m²</span>
                      </div>
                    </div>

                    <Divider className="my-3" />

                    <h3 className="font-medium mb-2">
                      Factores de Estilo de Vida
                    </h3>
                    <div className="space-y-2 text-small">
                      <div className="flex justify-between">
                        <span className="text-default-500">Fumador:</span>
                        <span>{evaluation.smoking ? "Sí" : "No"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Consumo de Alcohol:
                        </span>
                        <span>
                          {evaluation.alcohol === "none"
                            ? "Ninguno"
                            : evaluation.alcohol === "moderate"
                            ? "Moderado"
                            : "Alto"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Actividad Física:
                        </span>
                        <span>
                          {evaluation.physicalActivity === "sedentary"
                            ? "Sedentario"
                            : evaluation.physicalActivity === "moderate"
                            ? "Moderado"
                            : "Activo"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Antecedentes Familiares:
                        </span>
                        <span>{evaluation.familyHistory ? "Sí" : "No"}</span>
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
                          {evaluation.bloodPressureSystolic}/
                          {evaluation.bloodPressureDiastolic} mmHg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Colesterol Total:
                        </span>
                        <span>{evaluation.cholesterolTotal} mg/dL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Colesterol LDL:
                        </span>
                        <span>{evaluation.cholesterolLDL} mg/dL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Colesterol HDL:
                        </span>
                        <span>{evaluation.cholesterolHDL} mg/dL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          Glucosa en Sangre:
                        </span>
                        <span>{evaluation.bloodGlucose} mg/dL</span>
                      </div>
                    </div>

                    {evaluation.symptoms.length > 0 && (
                      <>
                        <Divider className="my-3" />

                        <h3 className="font-medium mb-2">
                          Síntomas Reportados
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {evaluation.symptoms.map((symptom, index) => (
                            <div
                              key={index}
                              className="px-2 py-1 rounded-full bg-default-100 text-tiny"
                            >
                              {symptom.charAt(0).toUpperCase() +
                                symptom.slice(1)}
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
                    {evaluation.riskScore && evaluation.riskScore >= 70 ? (
                      <p>
                        <span className="font-semibold">Riesgo Alto:</span> Se
                        recomienda atención médica inmediata. Programe pruebas
                        de seguimiento que incluyan ECG, prueba de esfuerzo y
                        panel lipídico. Considere medicación para el manejo de
                        la presión arterial y el colesterol. Las modificaciones
                        en el estilo de vida son críticas.
                      </p>
                    ) : evaluation.riskScore && evaluation.riskScore >= 40 ? (
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
          onPress={() => history.push(`/patient-evaluation?id=${patient.id}`)}
        >
          Nueva Evaluación
        </Button>
      </div>
    </div>
  );
};
