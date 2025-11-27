import React from "react";
import axios from "axios";

export interface Alert {
  id_alerta: number;
  paciente_id: number;
  evaluacion_id: number;
  usuario_id: number;
  riesgo_estimado: string;
  nivel_riesgo: string;
  estado: "nuevo" | "Visto";
  fecha: string;
  mensaje: string;
  nombre_paciente: string;
}

export function useAlerts() {
  const [alerts, setAlerts] = React.useState<Alert[]>([]);
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

  const fetchAlerts = React.useCallback(async () => {
    const userId = getUserId();
    const token = getToken();

    if (!userId || !token) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:3000/api/alertas/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle both array and paginated response
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setAlerts(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      // Don't show error toast here to avoid annoying the user
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch alerts on mount
  React.useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Poll for new alerts every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Listen for new evaluation events to refresh alerts
  React.useEffect(() => {
    const handleNewEvaluation = () => {
      console.log("New evaluation detected, refreshing alerts...");
      fetchAlerts();
    };

    window.addEventListener("evaluationCreated", handleNewEvaluation);

    return () => {
      window.removeEventListener("evaluationCreated", handleNewEvaluation);
    };
  }, [fetchAlerts]);

  // Listen for alert updates from alerts page
  React.useEffect(() => {
    const handleAlertUpdate = () => {
      console.log("Alert updated, refreshing alerts...");
      fetchAlerts();
    };

    window.addEventListener("alertsUpdated", handleAlertUpdate);

    return () => {
      window.removeEventListener("alertsUpdated", handleAlertUpdate);
    };
  }, [fetchAlerts]);

  // Count only "nuevo" (unread) alerts
  const alertsCount = alerts.filter((alert) => alert.estado === "nuevo").length;

  const markAsViewed = async (id: number) => {
    const token = getToken();

    if (!token) return;

    try {
      await axios.patch(
        `http://localhost:3000/api/alertas/${id}`,
        { estado: "Visto" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setAlerts(
        alerts.map((alert) =>
          alert.id_alerta === id ? { ...alert, estado: "Visto" } : alert
        )
      );
    } catch (error) {
      console.error("Error marking alert as viewed:", error);
    }
  };

  const markAllAsViewed = async () => {
    const token = getToken();
    const userId = getUserId();

    if (!token || !userId) return;

    try {
      // Mark all unread alerts as read
      const unreadAlerts = alerts.filter((alert) => alert.estado === "nuevo");

      await Promise.all(
        unreadAlerts.map((alert) =>
          axios.patch(
            `http://localhost:3000/api/alertas/${alert.id_alerta}`,
            { estado: "Visto" },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );

      // Update local state
      setAlerts(alerts.map((alert) => ({ ...alert, estado: "Visto" })));
    } catch (error) {
      console.error("Error marking all alerts as viewed:", error);
    }
  };

  return {
    alerts,
    alertsCount,
    isLoading,
    markAsViewed,
    markAllAsViewed,
    refreshAlerts: fetchAlerts,
  };
}
