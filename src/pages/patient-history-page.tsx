"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody, CardHeader, Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { RiskLevelBadge } from "../components/risk-level-badge";
import { PatientCard } from "../components/patient-card";
import { usePatients } from "../hooks/use-patients";

export const PatientHistoryPage = () => {
  const history = useRouter();
  const location =useSearchParams();
  const { patients, evaluations, getPatient } = usePatients();
  
  // Get patient ID from URL query params if it exists
  const patientIdFromUrl = location?.get("id") ?? null;
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPatient, setSelectedPatient] = React.useState<string | null>(patientIdFromUrl);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortDescriptor, setSortDescriptor] = React.useState({ column: "date", direction: "descending" });
  const rowsPerPage = 10;
  
  // Filter patients based on search query
  const filteredPatients = React.useMemo(() => {
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patients, searchQuery]);
  
  // Get evaluations for selected patient
  const patientEvaluations = React.useMemo(() => {
    if (!selectedPatient) return [];
    
    return evaluations
      .filter(evaluation => evaluation.patientId === selectedPatient)
      .sort((a, b) => {
        const aValue = a[sortDescriptor.column as keyof typeof a];
        const bValue = b[sortDescriptor.column as keyof typeof b];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDescriptor.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDescriptor.direction === 'ascending'
            ? aValue - bValue
            : bValue - aValue;
        }
        
        return 0;
      });
  }, [evaluations, selectedPatient, sortDescriptor]);
  
  // Pagination
  const pages = Math.ceil(filteredPatients.length / rowsPerPage);
  const paginatedPatients = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredPatients.slice(start, end);
  }, [filteredPatients, currentPage]);
  
  const handleViewPatient = (patientId: string) => {
    setSelectedPatient(patientId);
  };
  
  const handleNewEvaluation = (patientId: string) => {
    history.push(`/patient-evaluation?id=${patientId}`);
  };
  
  const handleViewReport = (evaluationId: string) => {
    history.push(`/risk-report/${evaluationId}`);
  };
  
  const handleSortChange = (column: string) => {
    setSortDescriptor(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historial de Pacientes</h1>
        <p className="text-default-500">Ver y gestionar el historial de pacientes y evaluaciones</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1 space-y-6"
        >
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Pacientes</h2>
              <Button 
                size="sm" 
                color="primary"
                variant="flat"
                startContent={<Icon icon="lucide:plus" />}
                onPress={() => history.push("/patient-evaluation")}
              >
                Nuevo Paciente
              </Button>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input
                  placeholder="Buscar pacientes..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  startContent={<Icon icon="lucide:search" className="text-default-400" />}
                  isClearable
                />
                
                <div className="space-y-2">
                  {paginatedPatients.length > 0 ? (
                    paginatedPatients.map(patient => (
                      <div 
                        key={patient.id}
                        className={`p-3 rounded-medium cursor-pointer transition-colors ${
                          selectedPatient === patient.id 
                            ? 'bg-primary text-white' 
                            : 'bg-content2 hover:bg-content3'
                        }`}
                        onClick={() => handleViewPatient(patient.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className={`font-medium ${selectedPatient === patient.id ? 'text-white' : ''}`}>
                              {patient.name}
                            </p>
                            <p className={`text-tiny ${selectedPatient === patient.id ? 'text-white/80' : 'text-default-500'}`}>
                              ID: {patient.id} | {patient.age} years | {patient.gender === "male" ? "Male" : patient.gender === "female" ? "Female" : "Other"}
                            </p>
                          </div>
                          {patient.riskLevel && (
                            <div className={`text-tiny font-medium px-2 py-1 rounded-full ${
                              patient.riskLevel < 40 
                                ? 'bg-success-100 text-success-600' 
                                : patient.riskLevel < 70 
                                  ? 'bg-warning-100 text-warning-600' 
                                  : 'bg-danger-100 text-danger-600'
                            }`}>
                              {patient.riskLevel}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-default-500">
                      <Icon icon="lucide:user-x" className="text-default-300 text-2xl mb-2" />
                      <p>No se encontraron pacientes</p>
                    </div>
                  )}
                </div>
                
                {filteredPatients.length > rowsPerPage && (
                  <div className="flex justify-center">
                    <Pagination
                      total={pages}
                      initialPage={1}
                      page={currentPage}
                      onChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
          
          {selectedPatient && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PatientCard 
                patient={getPatient(selectedPatient)!}
                onViewHistory={handleViewPatient}
                onNewEvaluation={handleNewEvaluation}
              />
            </motion.div>
          )}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {selectedPatient 
                  ? `Historial de Evaluaciones: ${getPatient(selectedPatient)?.name}`
                  : "Historial de Evaluaciones"
                }
              </h2>
              {selectedPatient && (
                <Button 
                  color="primary"
                  size="sm"
                  onPress={() => handleNewEvaluation(selectedPatient)}
                >
                  Nueva Evaluación
                </Button>
              )}
            </CardHeader>
            <CardBody>
              {selectedPatient ? (
                patientEvaluations.length > 0 ? (
                  <Table removeWrapper aria-label="Patient evaluations table">
                    <TableHeader>
                      <TableColumn 
                        className="cursor-pointer" 
                        onClick={() => handleSortChange('date')}
                      >
                        <div className="flex items-center gap-1">
                          FECHA
                          {sortDescriptor.column === 'date' && (
                            <Icon 
                              icon={sortDescriptor.direction === 'ascending' ? "lucide:arrow-up" : "lucide:arrow-down"} 
                              className="text-tiny" 
                            />
                          )}
                        </div>
                      </TableColumn>
                      <TableColumn 
                        className="cursor-pointer" 
                        onClick={() => handleSortChange('age')}
                      >
                        <div className="flex items-center gap-1">
                          EDAD
                          {sortDescriptor.column === 'age' && (
                            <Icon 
                              icon={sortDescriptor.direction === 'ascending' ? "lucide:arrow-up" : "lucide:arrow-down"} 
                              className="text-tiny" 
                            />
                          )}
                        </div>
                      </TableColumn>
                      <TableColumn>IMC</TableColumn>
                      <TableColumn>PA</TableColumn>
                      <TableColumn 
                        className="cursor-pointer" 
                        onClick={() => handleSortChange('riskScore')}
                      >
                        <div className="flex items-center gap-1">
                          RIESGO
                          {sortDescriptor.column === 'riskScore' && (
                            <Icon 
                              icon={sortDescriptor.direction === 'ascending' ? "lucide:arrow-up" : "lucide:arrow-down"} 
                              className="text-tiny" 
                            />
                          )}
                        </div>
                      </TableColumn>
                      <TableColumn>ACCIONES</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {patientEvaluations.map(evaluation => (
                        <TableRow key={evaluation.id}>
                          <TableCell>{evaluation.date}</TableCell>
                          <TableCell>{evaluation.age}</TableCell>
                          <TableCell>{evaluation.bmi}</TableCell>
                          <TableCell>{evaluation.bloodPressureSystolic}/{evaluation.bloodPressureDiastolic}</TableCell>
                          <TableCell>
                            <RiskLevelBadge riskLevel={evaluation.riskScore || 0} showText={false} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                color="primary"
                                variant="flat"
                                onPress={() => handleViewReport(evaluation.id)}
                              >
                                Ver Informe
                              </Button>
                              <Dropdown>
                                <DropdownTrigger>
                                  <Button 
                                    size="sm" 
                                    variant="flat" 
                                    isIconOnly
                                  >
                                    <Icon icon="lucide:more-vertical" />
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Actions">
                                  <DropdownItem key="Descargar PDF">Descargar PDF</DropdownItem>
                                  <DropdownItem key="Enviar al Paciente">Enviar al Paciente</DropdownItem>
                                  <DropdownItem key="Imprimir Informe">Imprimir Informe</DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center text-default-500">
                    <Icon icon="lucide:file-x" className="text-default-300 text-3xl mb-2" />
                    <p>No se encontraron evaluaciones para este paciente</p>
                    <Button 
                      color="primary" 
                      className="mt-4"
                      onPress={() => handleNewEvaluation(selectedPatient)}
                    >
                      Crear Primera Evaluación
                    </Button>
                  </div>
                )
              ) : (
                <div className="py-12 text-center text-default-500">
                  <Icon icon="lucide:user-search" className="text-default-300 text-3xl mb-2" />
                  <p>Seleccione un paciente para ver su historial de evaluaciones</p>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};