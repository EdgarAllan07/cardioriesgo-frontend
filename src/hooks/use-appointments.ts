import React from "react";
import axios from "axios";
import { API_URL } from "../config/api";

export interface Appointment {
  id_cita?: string | number;
  id_paciente?: number;
  id_usuario?: string | number;
  fecha_cita: string;
  motivo: string;
  estado: "Programada" | "Completada" | "Cancelada";
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  paciente?: {
    nombre_completo: string;
  };
}

export const useAppointments = () => {
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

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

  const fetchAppointments = React.useCallback(async () => {
    const userId = getUserId();
    const token = getToken();

    if (!userId || !token) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/citas/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = Array.isArray(response.data) ? response.data : [];
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    isLoading,
    fetchAppointments,
  };
};
