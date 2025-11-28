import React from "react";
import axios from "axios";
import { API_URL } from "../config/api";

export interface Patient {
  id_paciente: number;
  nombre_completo: string;
  edad: number;
  sexo: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  ultima_evaluacion?: string;
  nivel_riesgo?: number;
}

export interface PatientEvaluation {
  id_reporte: number;
  id_paciente: number;
  nombre_completo: string;
  fecha_reporte: string;
  edad: number;
  sexo: string;
  imc: number;
  presion_sistolica: number;
  presion_diastolica: number;
  colesterol_total: number;
  colesterol_ldl: number;
  colesterol_hdl: number;
  glucosa: number;
  tabaquismo: boolean;
  consumo_alcohol: string;
  actividad_fisica: string;
  antecedentes_familiares: boolean;
  sintomas: string;
  puntuacion_riesgo: number;
  enfermedades?: Array<{
    nombre: string;
    probabilidad: number;
  }>;
  url_pdf?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
}

export interface PatientReport {
  id_reporte: number;
  fecha_reporte: string;
  puntuacion_riesgo: number;
  url_pdf: string;
}

// Helper functions for authentication (moved outside to be stable)
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

export function usePatients() {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = React.useState(false);
  const [patientsError, setpatientsError] = React.useState<string | null>(null);

  // Pagination state
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [totalPatients, setTotalPatients] = React.useState(0);

  // Fetch patients from API
  const fetchPatients = React.useCallback(async () => {
    const userId = getUserId();
    const token = getToken();

    if (!userId || !token) {
      setpatientsError("No se encontró la sesión del usuario");
      return;
    }

    setIsLoadingPatients(true);
    setpatientsError(null);

    try {
      const response = await axios.get(
        `${API_URL}/api/pacientes/${userId}?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle different response structures
      if (Array.isArray(response.data)) {
        // Fallback: Client-side pagination if backend returns all data
        const start = (page - 1) * limit;
        const end = start + limit;
        setPatients(response.data.slice(start, end));
        setTotalPatients(response.data.length);
      } else if (response.data && typeof response.data === "object") {
        // Expected paginated response: { data: Patient[], total: number }
        setPatients(response.data.data || []);
        setTotalPatients(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setpatientsError("Error al cargar la lista de pacientes");
      setPatients([]);
    } finally {
      setIsLoadingPatients(false);
    }
  }, [page, limit]);

  // Fetch patients on mount and when page changes
  React.useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Get a single patient by ID (from current loaded patients)
  const getPatient = React.useCallback(
    (id: string | number) => {
      return patients.find((patient) => patient.id_paciente === Number(id));
    },
    [patients]
  );

  // Fetch a specific evaluation/report by ID
  const getEvaluation = React.useCallback(
    async (reportId: string | number): Promise<PatientEvaluation | null> => {
      const token = getToken();

      if (!token) {
        console.error("No authentication token found");
        return null;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/reportes/${reportId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data;
      } catch (error) {
        console.error("Error fetching evaluation:", error);
        return null;
      }
    },
    []
  );

  // Fetch all evaluations for a specific patient
  const getPatientEvaluations = React.useCallback(
    async (patientId: string | number): Promise<PatientReport[]> => {
      const token = getToken();

      if (!token) {
        console.error("No authentication token found");
        return [];
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/reportes/paciente/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data.data || [];
      } catch (error) {
        console.error("Error fetching patient evaluations:", error);
        return [];
      }
    },
    []
  );

  // Refresh patients list (useful after creating new evaluation)
  const refreshPatients = React.useCallback(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    isLoadingPatients,
    patientsError,
    page,
    setPage,
    limit,
    totalPatients,
    getPatient,
    getEvaluation,
    getPatientEvaluations,
    refreshPatients,
  };
}
