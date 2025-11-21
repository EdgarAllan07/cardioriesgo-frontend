// src/components/patient-card.tsx
"use client"; // 👈 IMPORTANTE: Es un componente interactivo

import React from "react";
// TRADUCCIÓN: Importamos desde @heroui/react
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { RiskLevelBadge } from "./risk-level-badge";

// TRADUCCIÓN: He "adivinado" la estructura de tu tipo Patient
// basado en el código que me diste.
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  riskLevel?: number; // Risk level as a number (0-100)
  lastEvaluation?: string;
}

interface PatientCardProps {
  patient: Patient;
  onViewHistory: (patientId: string) => void;
  onNewEvaluation: (patientId: string) => void;
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
              <p className="font-medium">{patient.name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>ID: {patient.id}</span>
                <span>•</span>
                <span>{patient.age} años</span>
                <span>•</span>
                <span>
                  {patient.gender === "male"
                    ? "Masculino"
                    : patient.gender === "female"
                    ? "Femenino"
                    : "Otro"}
                </span>
              </div>
            </div>
          </div>
          {patient.riskLevel !== undefined && (
            <RiskLevelBadge riskLevel={patient.riskLevel} />
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {patient.lastEvaluation ? (
              <span>Última evaluación: {patient.lastEvaluation}</span>
            ) : (
              <span>Sin evaluaciones previas</span>
            )}
          </div>
          <div className="flex gap-2">
            {/* --- TRADUCCIÓN CLAVE DEL BOTÓN --- */}
            <Button
              size="sm"
              // TRADUCCIÓN: Reemplazamos 'variant' y 'color' por clases de Tailwind.
              // Estas clases son un ejemplo, ajústalas a tu gusto.
              className="bg-secondary-100 text-secondary-800 hover:bg-secondary-200"
              // TRADUCCIÓN: ¡CRÍTICO! Se cambia 'onPress' por 'onClick'
              onClick={() => onViewHistory(patient.id)}
            >
              Ver Historial
            </Button>

            {/* --- TRADUCCIÓN CLAVE DEL BOTÓN --- */}
            <Button
              size="sm"
              // TRADUCCIÓN: Clases para el botón primario (ejemplo)
              className="bg-primary-600 text-white hover:bg-primary-700"
              // TRADUCCIÓN: ¡CRÍTICO! Se cambia 'onPress' por 'onClick'
              onClick={() => onNewEvaluation(patient.id)}
            >
              Nueva Evaluación
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
