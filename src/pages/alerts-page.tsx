"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardFooter, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Checkbox } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAlerts } from "../hooks/use-alerts";

export const AlertsPage = () => {
  const history = useRouter();
  const { alerts, markAsViewed, markAllAsViewed } = useAlerts();
  const [selectedAlerts, setSelectedAlerts] = React.useState<string[]>([]);
  
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedAlerts(alerts.map(alert => alert.id));
    } else {
      setSelectedAlerts([]);
    }
  };
  
  const handleSelectAlert = (alertId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedAlerts([...selectedAlerts, alertId]);
    } else {
      setSelectedAlerts(selectedAlerts.filter(id => id !== alertId));
    }
  };
  
  const handleMarkAsViewed = () => {
    selectedAlerts.forEach(id => markAsViewed(id));
    setSelectedAlerts([]);
  };
  
  const handleViewPatient = (patientId: string) => {
    history.push(`/patient-history?id=${patientId}`);
  };
  
  const getRiskColor = (riskLevel: number) => {
    if (riskLevel < 40) return "success";
    if (riskLevel < 70) return "warning";
    return "danger";
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertas y Notificaciones</h1>
        <p className="text-default-500">Ver y gestionar alertas de pacientes de alto riesgo</p>
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
                <Button 
                  color="primary"
                  onPress={handleMarkAsViewed}
                >
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
                      isSelected={selectedAlerts.length === alerts.length}
                      isIndeterminate={selectedAlerts.length > 0 && selectedAlerts.length < alerts.length}
                      onValueChange={handleSelectAll}
                    />
                  </TableColumn>
                  <TableColumn>PACIENTE</TableColumn>
                  <TableColumn>NIVEL DE RIESGO</TableColumn>
                  <TableColumn>FECHA</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                  <TableColumn>ACCIONES</TableColumn>
                </TableHeader>
                <TableBody>
                  {alerts.map(alert => (
                    <TableRow key={alert.id} className={!alert.viewed ? "bg-content2" : ""}>
                      <TableCell>
                        <Checkbox
                          isSelected={selectedAlerts.includes(alert.id)}
                          onValueChange={(isSelected) => handleSelectAlert(alert.id, isSelected)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center">
                            <Icon icon="lucide:user" className="text-default-500" />
                          </div>
                          <div>
                            <p className="font-medium">{alert.patientName}</p>
                            <p className="text-tiny text-default-500">ID: {alert.patientId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-2 text-${getRiskColor(alert.riskLevel)}`}>
                          <Icon icon="lucide:alert-triangle" />
                          <span className="font-medium">{alert.riskLevel}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{alert.date}</TableCell>
                      <TableCell>
                        <Chip 
                          color={alert.viewed ? "default" : "danger"} 
                          variant="flat"
                          size="sm"
                        >
                          {alert.viewed ? "Visto" : "Nuevo"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            color="primary"
                            onPress={() => handleViewPatient(alert.patientId)}
                          >
                            Ver Paciente
                          </Button>
                          {!alert.viewed && (
                            <Button 
                              size="sm" 
                              variant="flat"
                              onPress={() => markAsViewed(alert.id)}
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
                <Icon icon="lucide:check-circle" className="text-success text-3xl mb-2" />
                <p>No hay alertas en este momento</p>
                <p className="text-small mt-1">Todos los pacientes están en buen estado de salud</p>
              </div>
            )}
          </CardBody>
          <CardFooter>
            <div className="flex justify-between w-full">
              <p className="text-small text-default-500">
                Mostrando {alerts.length} alertas • {alerts.filter(a => !a.viewed).length} nuevas
              </p>
              <Button 
                variant="flat" 
                color="primary"
                onPress={() => history.push("/dashboard")}
              >
                Volver al Panel Principal
              </Button>
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
          <CardBody className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Notificaciones por Correo</p>
                <p className="text-small text-default-500">Recibir notificaciones por correo para pacientes de alto riesgo</p>
              </div>
              <Checkbox defaultSelected />
            </div>
    
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Umbral de Riesgo</p>
                <p className="text-small text-default-500">Nivel mínimo de riesgo para activar una alerta</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-default-500">70%</span>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <Button color="primary">Guardar Configuración</Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};