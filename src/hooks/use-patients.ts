import React from "react";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  lastEvaluation?: string;
  riskLevel?: number;
  email?: string;
  phone?: string;
  birthDate?: string;
}

export interface PatientEvaluation {
  id: string;
  patientId: string;
  date: string;
  age: number;
  gender: "male" | "female" | "other";
  bmi: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  cholesterolTotal: number;
  cholesterolLDL: number;
  cholesterolHDL: number;
  bloodGlucose: number;
  smoking: boolean;
  alcohol: "none" | "moderate" | "heavy";
  physicalActivity: "sedentary" | "moderate" | "active";
  familyHistory: boolean;
  symptoms: string[];
  riskScore?: number;
  diseases?: Array<{
    name: string;
    probability: number;
  }>;
}

export function usePatients() {
  // In a real app, this would come from an API
  const [patients, setPatients] = React.useState<Patient[]>([
    { 
      id: "P-1001", 
      name: "John Smith", 
      age: 58, 
      gender: "male", 
      lastEvaluation: "2024-07-10", 
      riskLevel: 85,
      email: "john.smith@email.com",
      phone: "+34 612 345 678",
      birthDate: "1966-03-15"
    },
    { 
      id: "P-1002", 
      name: "Sarah Johnson", 
      age: 45, 
      gender: "female", 
      lastEvaluation: "2024-07-08", 
      riskLevel: 32,
      email: "sarah.johnson@email.com",
      phone: "+34 623 456 789",
      birthDate: "1979-08-22"
    },
    { id: "P-1003", name: "Michael Brown", age: 62, gender: "male", lastEvaluation: "2024-07-05", riskLevel: 67 },
    { id: "P-1004", name: "Emily Davis", age: 39, gender: "female", lastEvaluation: "2024-07-01", riskLevel: 18 },
    { id: "P-1005", name: "Robert Wilson", age: 71, gender: "male", lastEvaluation: "2024-06-28", riskLevel: 74 },
    { id: "P-1006", name: "Jennifer Taylor", age: 52, gender: "female", lastEvaluation: "2024-06-25", riskLevel: 45 },
    { id: "P-1007", name: "David Martinez", age: 48, gender: "male", lastEvaluation: "2024-06-20", riskLevel: 38 },
    { id: "P-1008", name: "Lisa Anderson", age: 65, gender: "female", lastEvaluation: "2024-06-15", riskLevel: 71 },
    { id: "P-1009", name: "James Thomas", age: 54, gender: "male", lastEvaluation: "2024-06-10", riskLevel: 52 },
    { id: "P-1010", name: "Patricia White", age: 67, gender: "female", lastEvaluation: "2024-06-05", riskLevel: 63 }
  ]);

  const [evaluations, setEvaluations] = React.useState<PatientEvaluation[]>([
    {
      id: "E-2001",
      patientId: "P-1001",
      date: "2024-07-10",
      age: 58,
      gender: "male",
      bmi: 28.5,
      bloodPressureSystolic: 145,
      bloodPressureDiastolic: 95,
      cholesterolTotal: 240,
      cholesterolLDL: 160,
      cholesterolHDL: 42,
      bloodGlucose: 110,
      smoking: true,
      alcohol: "moderate",
      physicalActivity: "sedentary",
      familyHistory: true,
      symptoms: ["Dolor en el pecho", "Problemas para respirar"],
      riskScore: 85,
      diseases: [
        { name: "Arterial Coronaria", probability: 0.78 },
        { name: "Hipertensión Arterial", probability: 0.92 },
        { name: "Diabetes Tipo 2", probability: 0.45 }
      ]
    },
    {
      id: "E-2002",
      patientId: "P-1002",
      date: "2024-07-08",
      age: 45,
      gender: "female",
      bmi: 23.1,
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 75,
      cholesterolTotal: 185,
      cholesterolLDL: 110,
      cholesterolHDL: 65,
      bloodGlucose: 88,
      smoking: false,
      alcohol: "moderate",
      physicalActivity: "active",
      familyHistory: false,
      symptoms: [],
      riskScore: 32,
      diseases: [
        { name: "Coronary Artery Disease", probability: 0.12 },
        { name: "Hypertension", probability: 0.25 },
        { name: "Type 2 Diabetes", probability: 0.08 }
      ]
    }
  ]);

  const addPatient = (patient: Omit<Patient, "id">) => {
    const newPatient = {
      ...patient,
      id: `P-${1011 + patients.length}`
    };
    setPatients([...patients, newPatient]);
    return newPatient;
  };

  const addEvaluation = (evaluation: Omit<PatientEvaluation, "id" | "date" | "riskScore" | "diseases">) => {
    // Simulate AI risk calculation
    const riskScore = Math.floor(Math.random() * 100);
    
    // Generate mock disease probabilities based on risk score
    const diseases = [
      { 
        name: "Coronary Artery Disease", 
        probability: riskScore > 70 ? riskScore / 100 - 0.1 : riskScore / 100 - 0.3 
      },
      { 
        name: "Hypertension", 
        probability: evaluation.bloodPressureSystolic > 140 ? 0.8 : 0.3 
      },
      { 
        name: "Type 2 Diabetes", 
        probability: evaluation.bloodGlucose > 100 ? 0.6 : 0.2 
      },
      { 
        name: "Stroke", 
        probability: riskScore > 80 ? 0.7 : 0.15 
      }
    ];
    
    const newEvaluation = {
      ...evaluation,
      id: `E-${2000 + evaluations.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      riskScore,
      diseases
    };
    
    setEvaluations([...evaluations, newEvaluation]);
    
    // Update patient's last evaluation and risk level
    setPatients(patients.map(patient => 
      patient.id === evaluation.patientId 
        ? { 
            ...patient, 
            lastEvaluation: newEvaluation.date,
            riskLevel: riskScore
          } 
        : patient
    ));
    
    return newEvaluation;
  };

  const getPatient = (id: string) => {
    return patients.find(patient => patient.id === id);
  };

  const getEvaluation = (id: string) => {
    return evaluations.find(evaluation => evaluation.id === id);
  };

  const getPatientEvaluations = (patientId: string) => {
    return evaluations.filter(evaluation => evaluation.patientId === patientId);
  };

  return {
    patients,
    evaluations,
    addPatient,
    addEvaluation,
    getPatient,
    getEvaluation,
    getPatientEvaluations
  };
}
