"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Checkbox,
  Pagination,
  Input,
  Slider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
import axios from "axios";

interface Alert {
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

interface AlertConfig {
  id_config?: number;
  usuario_id?: number;
  activar_notificaciones: boolean;
  umbral_riesgo: number;
  updated_at?: string;
}

export const AlertsPage = () => {
  const history = useRouter();

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

  const userId = getUserId();

  // Estados
  const [alerts, setAlerts] = React.useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = React.useState<Alert[]>([]);
  const [selectedAlerts, setSelectedAlerts] = React.useState<number[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  // Estados de configuración
  const [config, setConfig] = React.useState<AlertConfig>({
    activar_notificaciones: true,
    umbral_riesgo: 70,
  });
  const [isSavingConfig, setIsSavingConfig] = React.useState(false);

  // Fetch alerts
  const fetchAlerts = React.useCallback(async () => {
    if (!userId) {
      console.error("No userId found");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const token = getToken();
      const response = await axios.get(
        `http://localhost:3000/api/alertas/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Alerts fetched:", response.data);

      const data = Array.isArray(response.data) ? response.data : [];
      setAlerts(data);
      setFilteredAlerts(data);
      setTotalPages(Math.ceil(data.length / 10));
    } catch (error) {
      console.error("Error fetching alerts:", error);
      addToast({
        title: "Error",
        description: "No se pudieron cargar las alertas",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch alert configuration
  const fetchConfig = React.useCallback(async () => {
    if (!userId) return;

    try {
      const token = getToken();
      const response = await axios.get(
        `http://localhost:3000/api/alertas/config/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Config fetched:", response.data);

      if (response.data) {
        setConfig({
          activar_notificaciones: response.data.activar_notificaciones,
          umbral_riesgo: response.data.umbral_riesgo,
        });
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      addToast({
        title: "Error",
        description: "No se pudo cargar la configuración",
        color: "danger",
      });
    }
  }, [userId]);

  // Load data on mount
  React.useEffect(() => {
    fetchAlerts();
    fetchConfig();
  }, [fetchAlerts, fetchConfig]);

  // Mark single alert as viewed
  const markAsViewed = async (alertId: number) => {
    try {
      const token = getToken();
      await axios.patch(
        `http://localhost:3000/api/alertas/${alertId}`,
        {
          estado: "Visto",
        },
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
          alert.id_alerta === alertId ? { ...alert, estado: "Visto" } : alert
        )
      );

      addToast({
        title: "Alerta marcada",
        description: "La alerta ha sido marcada como vista",
        color: "success",
      });
    } catch (error) {
      console.error("Error marking alert as viewed:", error);
      addToast({
        title: "Error",
        description: "No se pudo marcar la alerta",
        color: "danger",
      });
    }
  };

  // Mark all alerts as viewed
  const markAllAsViewed = async () => {
    const newAlerts = alerts.filter((alert) => alert.estado === "nuevo");

    try {
      const token = getToken();
      // Mark all new alerts as viewed
      await Promise.all(
        newAlerts.map((alert) =>
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

      // Refresh alerts
      await fetchAlerts();

      addToast({
        title: "Alertas marcadas",
        description: "Todas las alertas han sido marcadas como vistas",
        color: "success",
      });
    } catch (error) {
      console.error("Error marking all alerts:", error);
      addToast({
        title: "Error",
        description: "No se pudieron marcar todas las alertas",
        color: "danger",
      });
    }
  };

  // Mark selected alerts as viewed
  const handleMarkAsViewed = async () => {
    try {
      const token = getToken();
      await Promise.all(
        selectedAlerts.map((alertId) =>
          axios.patch(
            `http://localhost:3000/api/alertas/${alertId}`,
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

      // Refresh alerts
      await fetchAlerts();
      setSelectedAlerts([]);

      addToast({
        title: "Alertas marcadas",
        description: "Las alertas seleccionadas han sido marcadas como vistas",
        color: "success",
      });
    } catch (error) {
      console.error("Error marking selected alerts:", error);
      addToast({
        title: "Error",
        description: "No se pudieron marcar las alertas seleccionadas",
        color: "danger",
      });
    }
  };

  // Save configuration
  const handleSaveConfig = async () => {
    if (!userId) return;

    setIsSavingConfig(true);

    try {
      const token = getToken();
      await axios.patch(
        `http://localhost:3000/api/alertas/config/${userId}`,
        {
          activar_notificaciones: config.activar_notificaciones,
          umbral_riesgo: config.umbral_riesgo,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      addToast({
        title: "Configuración guardada",
        description: "La configuración de alertas ha sido actualizada",
        color: "success",
      });
    } catch (error) {
      console.error("Error saving config:", error);
      addToast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        color: "danger",
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedAlerts(paginatedAlerts.map((alert) => alert.id_alerta));
    } else {
      setSelectedAlerts([]);
    }
  };

  const handleSelectAlert = (alertId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedAlerts([...selectedAlerts, alertId]);
    } else {
      setSelectedAlerts(selectedAlerts.filter((id) => id !== alertId));
    }
  };

  const handleViewPatient = (patientId: number) => {
    history.push(`/patient-history?id=${patientId}`);
  };

  const getRiskColor = (riskLevel: string) => {
    const risk = parseFloat(riskLevel);
    if (risk < 40) return "success";
    if (risk < 70) return "warning";
    return "danger";
  };

  // Pagination
  const itemsPerPage = 10;
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateStr).toLocaleDateString("es-ES", options);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertas y Notificaciones</h1>
        <p className="text-default-500">
          Ver y gestionar alertas de pacientes de alto riesgo
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="flex justify-between">
            <h2 className="text-lg font-semibold">Pacientes de Alto Riesgo</h2>
            <div className="flex gap-2">
              <Button
                variant="flat"
                color="primary"
                onPress={markAllAsViewed}
                startContent={<Icon icon="lucide:check-circle" />}
              >
                Marcar Todo como Visto
              </Button>
              {selectedAlerts.length > 0 && (
                <Button color="primary" onPress={handleMarkAsViewed}>
                  Marcar Seleccionados ({selectedAlerts.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardBody>
            {alerts.length > 0 ? (
              <Table removeWrapper aria-label="Alerts table">
                <TableHeader>
                  <TableColumn>
                    <Checkbox
                      isSelected={
                        selectedAlerts.length === paginatedAlerts.length &&
                        paginatedAlerts.length > 0
                      }
                      isIndeterminate={
                        selectedAlerts.length > 0 &&
                        selectedAlerts.length < paginatedAlerts.length
                      }
                      onValueChange={handleSelectAll}
                    />
                  </TableColumn>
                  <TableColumn>PACIENTE</TableColumn>
                  <TableColumn>NIVEL DE RIESGO</TableColumn>
                  <TableColumn>MENSAJE</TableColumn>
                  <TableColumn>FECHA</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                  <TableColumn>ACCIONES</TableColumn>
                </TableHeader>
                <TableBody
                  isLoading={isLoading}
                  loadingContent={
                    <div className="py-8">Cargando alertas...</div>
                  }
                  emptyContent={
                    <div className="py-8">No se encontraron alertas.</div>
                  }
                >
                  {paginatedAlerts.map((alert) => (
                    <TableRow
                      key={alert.id_alerta}
                      className={alert.estado === "nuevo" ? "bg-content2" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          isSelected={selectedAlerts.includes(alert.id_alerta)}
                          onValueChange={(isSelected) =>
                            handleSelectAlert(alert.id_alerta, isSelected)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center">
                            <Icon
                              icon="lucide:user"
                              className="text-default-500"
                            />
                          </div>
                          <div>
                            <p className="font-medium">
                              {alert.nombre_paciente}
                            </p>
                            <p className="text-tiny text-default-500">
                              ID: {alert.paciente_id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getRiskColor(alert.riesgo_estimado)}
                          variant="flat"
                          startContent={<Icon icon="lucide:alert-triangle" />}
                        >
                          {alert.riesgo_estimado}%
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-[200px] truncate">
                          {alert.mensaje}
                        </p>
                      </TableCell>
                      <TableCell>{formatDate(alert.fecha)}</TableCell>
                      <TableCell>
                        <Chip
                          color={
                            alert.estado === "Visto" ? "default" : "danger"
                          }
                          variant="flat"
                          size="sm"
                        >
                          {alert.estado === "nuevo" ? "Nuevo" : alert.estado}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            onPress={() => handleViewPatient(alert.paciente_id)}
                          >
                            Ver Paciente
                          </Button>
                          {alert.estado === "nuevo" && (
                            <Button
                              size="sm"
                              variant="flat"
                              onPress={() => markAsViewed(alert.id_alerta)}
                            >
                              Marcar como Visto
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-default-500">
                <Icon
                  icon="lucide:check-circle"
                  className="text-success text-3xl mb-2"
                />
                <p>No hay alertas en este momento</p>
                <p className="text-small mt-1">
                  Todos los pacientes están en buen estado de salud
                </p>
              </div>
            )}
          </CardBody>
          <CardFooter>
            <div className="flex justify-between w-full items-center">
              <p className="text-small text-default-500">
                Mostrando{" "}
                {Math.min(
                  (currentPage - 1) * itemsPerPage + 1,
                  filteredAlerts.length
                )}
                –{Math.min(currentPage * itemsPerPage, filteredAlerts.length)}{" "}
                de {filteredAlerts.length} alertas •{" "}
                {alerts.filter((a) => a.estado === "nuevo").length} nuevas
              </p>
              {totalPages > 1 && (
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={setCurrentPage}
                />
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Configuración de Alertas</h2>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Notificaciones por Correo</p>
                <p className="text-small text-default-500">
                  Recibir notificaciones por correo para pacientes de alto
                  riesgo
                </p>
              </div>
              <Checkbox
                isSelected={config.activar_notificaciones}
                onValueChange={(value) =>
                  setConfig({ ...config, activar_notificaciones: value })
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Umbral de Riesgo</p>
                  <p className="text-small text-default-500">
                    Nivel mínimo de riesgo para activar una alerta
                  </p>
                </div>
                <span className="text-default-500 font-semibold">
                  {config.umbral_riesgo}%
                </span>
              </div>
              <Slider
                size="sm"
                step={5}
                minValue={0}
                maxValue={100}
                value={config.umbral_riesgo}
                onChange={(value) =>
                  setConfig({
                    ...config,
                    umbral_riesgo: Array.isArray(value) ? value[0] : value,
                  })
                }
                className="max-w-full"
                color="primary"
              />
            </div>
          </CardBody>
          <CardFooter>
            <Button
              color="primary"
              onPress={handleSaveConfig}
              isLoading={isSavingConfig}
            >
              Guardar Configuración
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};
