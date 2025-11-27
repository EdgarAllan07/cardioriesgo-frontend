"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Input,
  Button,
  Checkbox,
  RadioGroup,
  Radio,
  Textarea,
  Select,
  SelectItem,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { usePatients } from "../hooks/use-patients";
import { addToast } from "@heroui/react";
import axios from "axios";

export const PatientEvaluationPage = () => {
  const history = useRouter();
  const location = useSearchParams();
  const { patients, getPatient } = usePatients();

  // Get patient ID from URL query params if it exists
  const patientIdFromUrl = location?.get("id") ?? null;

  const [isNewPatient, setIsNewPatient] = React.useState(!patientIdFromUrl);
  const [isLoading, setIsLoading] = React.useState(false);

  // Patient info
  const [patientId, setPatientId] = React.useState(patientIdFromUrl || "");
  const [patientName, setPatientName] = React.useState("");
  const [age, setAge] = React.useState("");
  const [gender, setGender] = React.useState<"male" | "female" | "other">(
    "male"
  );
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [birthDate, setBirthDate] = React.useState("");

  // Helper functions for authentication
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

  // Clinical data
  const [height, setHeight] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [systolic, setSystolic] = React.useState("");
  const [diastolic, setDiastolic] = React.useState("");
  const [totalCholesterol, setTotalCholesterol] = React.useState("");
  const [ldl, setLdl] = React.useState("");
  const [hdl, setHdl] = React.useState("");
  const [glucose, setGlucose] = React.useState("");
  const [smoking, setSmoking] = React.useState(false);
  const [alcohol, setAlcohol] = React.useState<"none" | "moderate" | "heavy">(
    "none"
  );
  const [activity, setActivity] = React.useState<
    "sedentary" | "moderate" | "active"
  >("moderate");
  const [familyHistory, setFamilyHistory] = React.useState(false);
  const [symptoms, setSymptoms] = React.useState<string[]>([]);
  const [notes, setNotes] = React.useState("");

  // Load patient data if ID is provided
  React.useEffect(() => {
    if (patientIdFromUrl) {
      const patient = getPatient(patientIdFromUrl);
      if (patient) {
        setPatientId(patient.id_paciente.toString());
        setPatientName(patient.nombre_completo);
        setAge(patient.edad.toString());
        // Map sexo from Spanish to gender enum
        const genderMap: Record<string, "male" | "female" | "other"> = {
          Masculino: "male",
          Femenino: "female",
          Otro: "other",
        };
        setGender(genderMap[patient.sexo] || "other");
        setEmail(patient.email || "");
        setPhone(patient.telefono || "");
        setBirthDate(patient.fecha_nacimiento || "");
        setIsNewPatient(false);
      }
    }
  }, [patientIdFromUrl, getPatient]);

  const calculateBMI = () => {
    if (!height || !weight) return 0;
    const heightInMeters = parseFloat(height) / 100;
    return parseFloat(weight) / (heightInMeters * heightInMeters);
  };

  const handleSymptomToggle = (symptom: string) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter((s) => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userId = getUserId();
      const token = getToken();

      if (!userId || !token) {
        throw new Error("No se encontró la sesión del usuario");
      }

      // Calculate BMI
      const bmi = calculateBMI();

      // Map gender to Spanish
      const genderMap: Record<string, string> = {
        male: "Masculino",
        female: "Femenino",
        other: "Otro",
      };

      // Map alcohol consumption to Spanish
      const alcoholMap: Record<string, string> = {
        none: "Ninguno",
        moderate: "Moderado",
        heavy: "Alto",
      };

      // Map physical activity to Spanish
      const activityMap: Record<string, string> = {
        sedentary: "Sedentario",
        moderate: "Moderado",
        active: "Activo",
      };

      // Prepare payload for API
      const payload = {
        usuario_id: parseInt(userId),
        nombre_completo: patientName,
        edad: parseInt(age),
        sexo: genderMap[gender],
        fecha_nacimiento: birthDate,
        telefono: phone,
        email: email,
        presion_sistolica: parseInt(systolic),
        presion_diastolica: parseInt(diastolic),
        colesterol_total: parseInt(totalCholesterol),
        colesterol_ldl: parseInt(ldl),
        colesterol_hdl: parseInt(hdl),
        glucosa: parseInt(glucose),
        peso_kg: parseFloat(weight),
        altura_cm: parseFloat(height),
        imc: parseFloat(bmi.toFixed(1)),
        tabaquismo: smoking,
        consumo_alcohol: alcoholMap[alcohol],
        actividad_fisica: activityMap[activity],
        antecedentes_familiares: familyHistory,
        sintomas: symptoms.join(", "),
      };

      // Call API to generate report
      const response = await axios.post(
        "http://localhost:3000/api/reportes/generar",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setIsLoading(false);

      addToast({
        title: "Evaluación Completa",
        description: "Datos del paciente han sido procesados exitosamente",
        color: "success",
      });

      // Redirect to risk report with the returned evaluation ID
      const reportId =
        response.data?.evaluacion_id || response.data?.id_reporte || "new";
      history.push(`/risk-report/${reportId}`);
    } catch (error) {
      setIsLoading(false);
      console.error("Error submitting evaluation:", error);
      addToast({
        title: "Error",
        description: "Hubo un error procesando la evaluación",
        color: "danger",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Evaluación de Paciente</h1>
        <p className="text-default-500">
          Ingrese datos del paciente para evaluación de riesgo cardiovascular
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 space-y-6"
          >
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">
                  Información del Paciente
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {!patientIdFromUrl && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      isSelected={isNewPatient}
                      onValueChange={setIsNewPatient}
                    >
                      Nuevo Paciente
                    </Checkbox>
                  </div>
                )}

                {!isNewPatient && !patientIdFromUrl && (
                  <Select
                    label="Seleccionar Paciente"
                    placeholder="Elija un paciente"
                    value={patientId}
                    color="primary"
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setPatientId(selectedId);
                      const patient = getPatient(selectedId);
                      if (patient) {
                        setPatientName(patient.nombre_completo);
                        setAge(patient.edad.toString());
                        // Map sexo from Spanish to gender enum
                        const genderMap: Record<
                          string,
                          "male" | "female" | "other"
                        > = {
                          Masculino: "male",
                          Femenino: "female",
                          Otro: "other",
                        };
                        setGender(genderMap[patient.sexo] || "other");
                      }
                    }}
                    isRequired
                    classNames={{
                      value: "text-foreground",
                    }}
                  >
                    {patients.map((patient) => (
                      <SelectItem key={patient.id_paciente}>
                        {patient.nombre_completo} (ID: {patient.id_paciente})
                      </SelectItem>
                    ))}
                  </Select>
                )}

                {isNewPatient && (
                  <Input
                    label="Nombre del Paciente"
                    placeholder="Ingrese nombre completo"
                    value={patientName}
                    onValueChange={setPatientName}
                    isRequired
                  />
                )}

                <Input
                  label="Edad"
                  placeholder="Ingrese edad"
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onValueChange={setAge}
                  isRequired
                />

                <RadioGroup
                  label="Género"
                  orientation="horizontal"
                  value={gender}
                  onValueChange={setGender as (value: string) => void}
                >
                  <Radio value="male">Masculino</Radio>
                  <Radio value="female">Femenino</Radio>
                  <Radio value="other">Otro</Radio>
                </RadioGroup>

                <Input
                  label="Correo Electrónico"
                  placeholder="Ingrese correo electrónico"
                  type="email"
                  value={email}
                  onValueChange={setEmail}
                />

                <Input
                  label="Teléfono"
                  placeholder="Ingrese número de teléfono"
                  value={phone}
                  onValueChange={setPhone}
                />

                <Input
                  label="Fecha de Nacimiento"
                  placeholder="YYYY-MM-DD"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">
                  Factores de Estilo de Vida
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox isSelected={smoking} onValueChange={setSmoking}>
                    Fumador
                  </Checkbox>
                </div>

                <div>
                  <p className="text-small mb-1">Consumo de Alcohol</p>
                  <RadioGroup
                    orientation="horizontal"
                    value={alcohol}
                    onValueChange={setAlcohol as (value: string) => void}
                  >
                    <Radio value="none">Ninguno</Radio>
                    <Radio value="moderate">Moderado</Radio>
                    <Radio value="heavy">Alto</Radio>
                  </RadioGroup>
                </div>

                <div>
                  <p className="text-small mb-1">Actividad Física</p>
                  <RadioGroup
                    orientation="horizontal"
                    value={activity}
                    onValueChange={setActivity as (value: string) => void}
                  >
                    <Radio value="sedentary">Sedentario</Radio>
                    <Radio value="moderate">Moderado</Radio>
                    <Radio value="active">Activo</Radio>
                  </RadioGroup>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    isSelected={familyHistory}
                    onValueChange={setFamilyHistory}
                  >
                    Antecedentes Familiares de Enfermedad Cardiovascular
                  </Checkbox>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Mediciones Clínicas</h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h3 className="font-medium">Medidas Corporales</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Altura (cm)"
                        placeholder="ej., 175"
                        type="number"
                        min="50"
                        max="250"
                        value={height}
                        onValueChange={setHeight}
                        isRequired
                        endContent={<div className="text-default-400">cm</div>}
                      />
                      <Input
                        label="Peso (kg)"
                        placeholder="ej., 70"
                        type="number"
                        min="20"
                        max="300"
                        value={weight}
                        onValueChange={setWeight}
                        isRequired
                        endContent={<div className="text-default-400">kg</div>}
                      />
                    </div>

                    {height && weight && (
                      <div className="p-2 bg-content2 rounded-medium">
                        <p className="text-small">
                          BMI:{" "}
                          <span className="font-medium">
                            {calculateBMI().toFixed(1)}
                          </span>{" "}
                          kg/m²
                        </p>
                      </div>
                    )}

                    <Divider />

                    <h3 className="font-medium">Presión Arterial</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Sistólica (mmHg)"
                        placeholder="ej., 120"
                        type="number"
                        min="60"
                        max="250"
                        value={systolic}
                        onValueChange={setSystolic}
                        isRequired
                        endContent={
                          <div className="text-default-400">mmHg</div>
                        }
                      />
                      <Input
                        label="Diastólica (mmHg)"
                        placeholder="ej., 80"
                        type="number"
                        min="40"
                        max="150"
                        value={diastolic}
                        onValueChange={setDiastolic}
                        isRequired
                        endContent={
                          <div className="text-default-400">mmHg</div>
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Análisis de Sangre</h3>
                    <Input
                      label="Colesterol Total (mg/dL)"
                      placeholder="ej., 200"
                      type="number"
                      min="50"
                      max="500"
                      value={totalCholesterol}
                      onValueChange={setTotalCholesterol}
                      isRequired
                      endContent={<div className="text-default-400">mg/dL</div>}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="LDL (mg/dL)"
                        placeholder="ej., 130"
                        type="number"
                        min="30"
                        max="300"
                        value={ldl}
                        onValueChange={setLdl}
                        isRequired
                        endContent={
                          <div className="text-default-400">mg/dL</div>
                        }
                      />
                      <Input
                        label="HDL (mg/dL)"
                        placeholder="ej., 50"
                        type="number"
                        min="20"
                        max="100"
                        value={hdl}
                        onValueChange={setHdl}
                        isRequired
                        endContent={
                          <div className="text-default-400">mg/dL</div>
                        }
                      />
                    </div>
                    <Input
                      label="Glucosa en Sangre (mg/dL)"
                      placeholder="ej., 90"
                      type="number"
                      min="50"
                      max="300"
                      value={glucose}
                      onValueChange={setGlucose}
                      isRequired
                      endContent={<div className="text-default-400">mg/dL</div>}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Síntomas y Notas</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <p className="text-small mb-2">
                    Síntomas (seleccione todos los que apliquen)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      "dolor en el pecho",
                      "dificultad para respirar",
                      "fatiga",
                      "mareos",
                      "palpitaciones",
                      "hinchazón en las piernas",
                      "fiebre alta",
                      "náuseas",
                      "dolor de cabeza",
                    ].map((symptom) => (
                      <Checkbox
                        key={symptom}
                        isSelected={symptoms.includes(symptom)}
                        onValueChange={() => handleSymptomToggle(symptom)}
                      >
                        {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                      </Checkbox>
                    ))}
                  </div>
                </div>

                <Textarea
                  label="Notas Adicionales"
                  placeholder="Ingrese cualquier información adicional sobre el paciente"
                  value={notes}
                  onValueChange={setNotes}
                  minRows={3}
                />
              </CardBody>
              <CardFooter>
                <div className="flex justify-end gap-2 w-full">
                  <Button variant="flat" onPress={() => history.back()}>
                    Cancelar
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    isLoading={isLoading}
                    startContent={!isLoading && <Icon icon="lucide:activity" />}
                  >
                    {isLoading ? "Procesando..." : "Calcular Riesgo"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </form>
    </div>
  );
};
