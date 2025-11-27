// src/components/patient-card.tsx
"use client"; // 👈 IMPORTANTE: Es un componente interactivo

import React from "react";
// TRADUCCIÓN: Importamos desde @heroui/react
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { RiskLevelBadge } from "./risk-level-badge";

// Updated to match API response structure
interface Patient {
  id_paciente: number;
  nombre_completo: string;
  edad: number;
  sexo: string;
  nivel_riesgo?: number;
  ultima_evaluacion?: string;
}

interface PatientCardProps {
  patient: Patient;
  onViewHistory: (patientId: string | number) => void;
  onNewEvaluation: (patientId: string | number) => void;
}

export const PatientCard = ({
  patient,
  onViewHistory,
  onNewEvaluation,
}: PatientCardProps) => {
  return (
    // TRADUCCIÓN: El Card de HeroUI es más simple.
    // Le añadimos clases de Tailwind directamente.
    <Card className="w-full shadow-md rounded-lg">
      <CardBody className="p-4">
        {" "}
        {/* HeroUI usa 'className' para padding */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Icon icon="lucide:user" className="text-xl text-gray-500" />
            </div>
            <div>
              <p className="font-medium">{patient.nombre_completo}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>ID: {patient.id_paciente}</span>
                <span>•</span>
                <span>{patient.edad} años</span>
                <span>•</span>
                <span>{patient.sexo}</span>
              </div>
            </div>
          </div>
          {patient.nivel_riesgo !== undefined && (
            <RiskLevelBadge riskLevel={patient.nivel_riesgo} />
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {patient.ultima_evaluacion ? (
              <span>Última evaluación: {patient.ultima_evaluacion}</span>
            ) : (
              <span>Sin evaluaciones previas</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-secondary-100 text-secondary-800 hover:bg-secondary-200"
              onClick={() => onViewHistory(patient.id_paciente)}
            >
              Ver Historial
            </Button>

            <Button
              size="sm"
              className="bg-primary-600 text-white hover:bg-primary-700"
              onClick={() => onNewEvaluation(patient.id_paciente)}
            >
              Nueva Evaluación
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
