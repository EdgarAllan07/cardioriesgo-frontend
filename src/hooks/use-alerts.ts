import React from "react";

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  riskLevel: number;
  date: string;
  viewed: boolean;
}

export function useAlerts() {
  // In a real app, this would come from an API
  const [alerts, setAlerts] = React.useState<Alert[]>([
    {
      id: "alert-1",
      patientId: "P-1001",
      patientName: "John Smith",
      riskLevel: 85,
      date: "2024-07-15",
      viewed: false
    },
    {
      id: "alert-2",
      patientId: "P-1042",
      patientName: "Maria Garcia",
      riskLevel: 78,
      date: "2024-07-14",
      viewed: false
    },
    {
      id: "alert-3",
      patientId: "P-1023",
      patientName: "Robert Johnson",
      riskLevel: 92,
      date: "2024-07-13",
      viewed: true
    }
  ]);

  const alertsCount = alerts.filter(alert => !alert.viewed).length;

  const markAsViewed = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, viewed: true } : alert
    ));
  };

  const markAllAsViewed = () => {
    setAlerts(alerts.map(alert => ({ ...alert, viewed: true })));
  };

  return {
    alerts,
    alertsCount,
    markAsViewed,
    markAllAsViewed
  };
}
