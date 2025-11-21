"use client"
import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Input,
  Button,
  Switch,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Select,
  SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "doctor" | "nurse" | "staff";
  status: "active" | "inactive";
}

interface SystemSetting {
  id: string;
  name: string;
  value: string | number | boolean;
  type: "text" | "number" | "boolean" | "select";
  options?: string[];
  description: string;
}

export const AdminPage = () => {
  const [users, setUsers] = React.useState<User[]>([
    {
      id: "U-001",
      name: "Dr. John Smith",
      email: "john.smith@hospital.com",
      role: "admin",
      status: "active",
    },
    {
      id: "U-002",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@hospital.com",
      role: "doctor",
      status: "active",
    },
    {
      id: "U-003",
      name: "Nurse Emily Davis",
      email: "emily.davis@hospital.com",
      role: "nurse",
      status: "active",
    },
    {
      id: "U-004",
      name: "Dr. Michael Brown",
      email: "michael.brown@hospital.com",
      role: "doctor",
      status: "inactive",
    },
    {
      id: "U-005",
      name: "Admin Lisa Wilson",
      email: "lisa.wilson@hospital.com",
      role: "admin",
      status: "active",
    },
  ]);

  const [settings, setSettings] = React.useState<SystemSetting[]>([
    {
      id: "S-001",
      name: "High Risk Threshold",
      value: 70,
      type: "number",
      description: "Risk percentage threshold for high risk classification",
    },
    {
      id: "S-002",
      name: "Moderate Risk Threshold",
      value: 40,
      type: "number",
      description: "Risk percentage threshold for moderate risk classification",
    },
    {
      id: "S-003",
      name: "Enable Automatic Alerts",
      value: true,
      type: "boolean",
      description: "Automatically generate alerts for high risk patients",
    },
    {
      id: "S-004",
      name: "Alert Notification Method",
      value: "email",
      type: "select",
      options: ["email", "sms", "both", "none"],
      description: "Method for sending alerts to doctors",
    },
    {
      id: "S-005",
      name: "Data Retention Period (days)",
      value: 365,
      type: "number",
      description: "Number of days to retain patient data",
    },
  ]);

  const [selectedTab, setSelectedTab] = React.useState("users");
  const [isAddingUser, setIsAddingUser] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // New user form
  const [newUser, setNewUser] = React.useState({
    name: "",
    email: "",
    role: "doctor" as const,
    password: "",
    confirmPassword: "",
  });

  const handleUserStatusChange = (userId: string, newStatus: boolean) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, status: newStatus ? "active" : "inactive" }
          : user
      )
    );

    addToast({
      title: "User Status Updated",
      description: `User status has been ${
        newStatus ? "activated" : "deactivated"
      }`,
      color: "success",
    });
  };

  const handleSettingChange = (
    settingId: string,
    value: string | number | boolean
  ) => {
    setSettings(
      settings.map((setting) =>
        setting.id === settingId ? { ...setting, value } : setting
      )
    );
  };

  const handleAddUser = () => {
    if (newUser.password !== newUser.confirmPassword) {
      addToast({
        title: "Error",
        description: "Passwords do not match",
        color: "danger",
      });
      return;
    }

    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      const newUserId = `U-${(users.length + 1).toString().padStart(3, "0")}`;

      setUsers([
        ...users,
        {
          id: newUserId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: "active",
        },
      ]);

      setNewUser({
        name: "",
        email: "",
        role: "doctor",
        password: "",
        confirmPassword: "",
      });

      setIsAddingUser(false);
      setIsSaving(false);

      addToast({
        title: "User Added",
        description: "New user has been added successfully",
        color: "success",
      });
    }, 1000);
  };

  const handleSaveSettings = () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);

      addToast({
        title: "Settings Saved",
        description: "System settings have been updated successfully",
        color: "success",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Administración</h1>
        <p className="text-default-500">
          Gestionar usuarios y configuración del sistema
        </p>
      </div>

      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(String(key))}
        color="primary"
        variant="underlined"
        classNames={{
          tabList: "gap-6",
          cursor: "w-full",
          tab: "max-w-fit px-0 h-12",
        }}
      >
        <Tab
          key="users"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:users" />
              <span>Gestión de Usuarios</span>
            </div>
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6"
          >
            <Card>
              <CardHeader className="flex justify-between">
                <h2 className="text-lg font-semibold">Usuarios del Sistema</h2>
                <Button
                  color="primary"
                  onPress={() => setIsAddingUser(true)}
                  startContent={<Icon icon="lucide:user-plus" />}
                >
                  Añadir Usuario
                </Button>
              </CardHeader>
              <CardBody>
                <Table removeWrapper aria-label="Users table">
                  <TableHeader>
                    <TableColumn>NOMBRE</TableColumn>
                    <TableColumn>CORREO</TableColumn>
                    <TableColumn>ROL</TableColumn>
                    <TableColumn>ESTADO</TableColumn>
                    <TableColumn>ACCIONES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center">
                              <Icon
                                icon="lucide:user"
                                className="text-default-500"
                              />
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div
                            className={`px-2 py-1 rounded-full text-tiny inline-block ${
                              user.role === "admin"
                                ? "bg-secondary-100 text-secondary"
                                : user.role === "doctor"
                                ? "bg-primary-100 text-primary"
                                : "bg-default-100 text-default-600"
                            }`}
                          >
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            size="sm"
                            isSelected={user.status === "active"}
                            onValueChange={(isSelected) =>
                              handleUserStatusChange(user.id, isSelected)
                            }
                            color={
                              user.status === "active" ? "success" : "danger"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              color="secondary"
                              isIconOnly
                            >
                              <Icon icon="lucide:edit" />
                            </Button>
                            <Button
                              size="sm"
                              variant="flat"
                              color="danger"
                              isIconOnly
                            >
                              <Icon icon="lucide:trash" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </motion.div>
        </Tab>
   
        <Tab
          key="logs"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:file-text" />
              <span>Registros del Sistema</span>
            </div>
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">
                  Registros de Actividad del Sistema
                </h2>
              </CardHeader>
              <CardBody>
                <Table removeWrapper aria-label="System logs table">
                  <TableHeader>
                    <TableColumn>FECHA Y HORA</TableColumn>
                    <TableColumn>USUARIO</TableColumn>
                    <TableColumn>ACCIÓN</TableColumn>
                    <TableColumn>DETALLES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        time: "2024-07-15 14:32:45",
                        user: "Dr. John Smith",
                        action: "Login",
                        details: "Successful login",
                      },
                      {
                        time: "2024-07-15 14:28:12",
                        user: "Dr. Sarah Johnson",
                        action: "Patient Evaluation",
                        details: "Created evaluation for patient P-1002",
                      },
                      {
                        time: "2024-07-15 13:45:23",
                        user: "Admin Lisa Wilson",
                        action: "User Management",
                        details: "Updated user U-004 status to inactive",
                      },
                      {
                        time: "2024-07-15 12:30:15",
                        user: "Dr. John Smith",
                        action: "Report Generation",
                        details: "Generated PDF report for evaluation E-2001",
                      },
                      {
                        time: "2024-07-15 11:22:37",
                        user: "Dr. Sarah Johnson",
                        action: "Patient Creation",
                        details: "Created new patient P-1010",
                      },
                    ].map((log, index) => (
                      <TableRow key={index}>
                        <TableCell>{log.time}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>
                          <div
                            className={`px-2 py-1 rounded-full text-tiny inline-block ${
                              log.action === "Login"
                                ? "bg-success-100 text-success"
                                : log.action.includes("Patient")
                                ? "bg-primary-100 text-primary"
                                : "bg-default-100 text-default-600"
                            }`}
                          >
                            {log.action}
                          </div>
                        </TableCell>
                        <TableCell>{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </motion.div>
        </Tab>
      </Tabs>

      {isAddingUser && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <h2 className="text-lg font-semibold">Añadir Nuevo Usuario</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Nombre Completo"
                placeholder="Ingrese nombre completo del usuario"
                value={newUser.name}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, name: value })
                }
                isRequired
              />
              <Input
                label="Correo Electrónico"
                placeholder="Ingrese correo electrónico del usuario"
                type="email"
                value={newUser.email}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, email: value })
                }
                isRequired
              />
              <Select
                label="Rol"
                selectedKeys={[newUser.role]}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  setNewUser({
                    ...newUser,
                    role: selectedKey as User["role"],
                  } as typeof newUser & { role: User["role"] });
                }}
                isRequired
              >
                <SelectItem key="admin">Administrador</SelectItem>
                <SelectItem key="doctor">Doctor</SelectItem>
                <SelectItem key="nurse">Enfermero/a</SelectItem>
                <SelectItem key="staff">Personal</SelectItem>
              </Select>
              <Input
                label="Contraseña"
                placeholder="Ingrese contraseña"
                type="password"
                value={newUser.password}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, password: value })
                }
                isRequired
              />
              <Input
                label="Confirmar Contraseña"
                placeholder="Confirme contraseña"
                type="password"
                value={newUser.confirmPassword}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, confirmPassword: value })
                }
                isRequired
              />
            </CardBody>
            <CardFooter>
              <div className="flex justify-end gap-2 w-full">
                <Button variant="flat" onPress={() => setIsAddingUser(false)}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleAddUser}
                  isLoading={isSaving}
                  isDisabled={
                    !newUser.name ||
                    !newUser.email ||
                    !newUser.password ||
                    !newUser.confirmPassword
                  }
                >
                  Añadir Usuario
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
