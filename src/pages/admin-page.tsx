"use client";
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
  Pagination,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
import axios from "axios";

interface User {
  id?: string | number;
  nombre?: string;
  correo?: string;
  tipo?: string; // API returns "Doctor", "Admin", etc.
  estado?: 1 | 0;
}

interface SystemSetting {
  id?: string | number;
  name?: string;
  value?: string | number | boolean;
  type?: "text" | "number" | "boolean" | "select";
  options?: string[];
  description?: string;
}

interface SystemLog {
  id?: string | number;
  fecha_ahora: string;
  nombre: string;
  accion: string;
  descripcion: string;
}

export const AdminPage = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [logs, setLogs] = React.useState<SystemLog[]>([]);

  // Pagination State for Users
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(false);

  // Pagination State for Logs
  const [logPage, setLogPage] = React.useState(1);
  const [logLimit] = React.useState(10);
  const [totalLogs, setTotalLogs] = React.useState(0);
  const [isLoadingLogs, setIsLoadingLogs] = React.useState(false);

  const getToken = () => {
    const match = document.cookie.match(new RegExp("(^| )auth-token=([^;]+)"));
    return match ? match[2] : null;
   
  };

  // Fetch users
  const fetchUsers = React.useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const token = getToken();
      const response = await axios.get(
        `http://localhost:3000/api/usuarios?page=${page}&limit=${limit}`,
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
        setUsers(response.data.slice(start, end));
        setTotalUsers(response.data.length);
      } else if (response.data && typeof response.data === "object") {
        // Expected paginated response: { data: User[], total: number, ... }
        setUsers(response.data.data || []);
        setTotalUsers(response.data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      addToast({
        title: "Error",
        description: "Failed to load users",
        color: "danger",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  }, [page, limit]);

  // Fetch logs
  const fetchLogs = React.useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const token = getToken();
      const response = await axios.get(
        `http://localhost:3000/api/system-logs?page=${logPage}&limit=${logLimit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        // Fallback: Client-side pagination
        const start = (logPage - 1) * logLimit;
        const end = start + logLimit;
        setLogs(response.data.slice(start, end));
        setTotalLogs(response.data.length);
      } else if (response.data && typeof response.data === "object") {
        setLogs(response.data.data || []);
        setTotalLogs(response.data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      addToast({
        title: "Error",
        description: "Failed to load system logs",
        color: "danger",
      });
    } finally {
      setIsLoadingLogs(false);
    }
  }, [logPage, logLimit]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

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
  const [isChangingPass, setIsChangingPass] = React.useState(false);

  // New user form
  const [newUser, setNewUser] = React.useState({
    name: "",
    email: "",
    role: "doctor",
    password: "",
    confirmPassword: "",
  });

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [passwordForm, setPasswordForm] = React.useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleUserStatusChange = async (
    userId: string | number | undefined,
    newStatus: boolean | number
  ) => {
    if (!userId) return;

    // Optimistic update
    const previousUsers = [...users];
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, estado: newStatus ? 1 : 0 } : user
      )
    );

    try {
      const token = getToken();
      await axios.patch(
        `http://localhost:3000/api/usuarios/estado/${userId}`,
        {
          estado: newStatus ? 1 : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      addToast({
        title: "User Status Updated",
        description: `User status has been ${
          newStatus ? "activated" : "deactivated"
        }`,
        color: "success",
      });
    } catch (error) {
      console.error("Failed to update user status:", error);
      // Revert optimistic update
      setUsers(previousUsers);
      addToast({
        title: "Error",
        description: "Failed to update user status",
        color: "danger",
      });
    }
  };

  const handleSettingChange = (
    settingId: string | number | undefined,
    value: string | number | boolean
  ) => {
    setSettings(
      settings.map((setting) =>
        setting.id === settingId ? { ...setting, value } : setting
      )
    );
  };

  const handleAddUser = async () => {
    if (newUser.password !== newUser.confirmPassword) {
      addToast({
        title: "Error",
        description: "Passwords do not match",
        color: "danger",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Split name into first and last name (simple heuristic)
      const nameParts = newUser.name.trim().split(" ");
      const nombre = nameParts[0];
      const apellido = nameParts.slice(1).join(" ") || "";

      // Map role to ID (Assuming 1=Admin, 2=Doctor, 3=Nurse, 4=Staff based on typical patterns, adjust if needed)
      const roleMap: Record<string, number> = {
        admin: 1,
        doctor: 2,
        nurse: 3,
        staff: 4,
      };
      const tipo_usuario_id = roleMap[newUser.role] || 2;

      const payload = {
        nombre,
        apellido,
        correo: newUser.email,
        contrasena_hash: newUser.password,
        tipo_usuario_id,
        estado: 1,
      };

      const token = getToken();
      await axios.post("http://localhost:3000/api/usuarios", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh list
      fetchUsers();

      setNewUser({
        name: "",
        email: "",
        role: "doctor",
        password: "",
        confirmPassword: "",
      });

      setIsAddingUser(false);

      addToast({
        title: "User Added",
        description: "New user has been added successfully",
        color: "success",
      });
    } catch (error) {
      console.error("Failed to add user:", error);
      addToast({
        title: "Error",
        description: "Failed to add user",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({
        title: "Error",
        description: "Passwords do not match",
        color: "danger",
      });
      return;
    }

    if (!selectedUser?.id) return;

    setIsSaving(true);

    try {
      const token = getToken();
      await axios.patch(
        `http://localhost:3000/api/usuarios/contrasena/${selectedUser.id}`,
        {
          contrasena_hash: passwordForm.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      addToast({
        title: "Success",
        description: "Password updated successfully",
        color: "success",
      });

      setIsChangingPass(false);
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to update password:", error);
      addToast({
        title: "Error",
        description: "Failed to update password",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
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

  const usersPages = Math.ceil(totalUsers / limit);
  const logsPages = Math.ceil(totalLogs / logLimit);

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
                <Table
                  removeWrapper
                  aria-label="Users table"
                  bottomContent={
                    usersPages > 0 ? (
                      <div className="flex w-full justify-center ">
                        <Pagination
                                         classNames={{
        wrapper: "gap-0 overflow-visible h-8 rounded-sm border border-divider",
        item: "w-8 h-8 text-small rounded-none  text-black",
        cursor:
          "bg-linear-to-b shadow-lg from-primary  dark:from-default-300 dark:to-default-100 text-white font-bold",
      }}
                          isCompact
                          showControls
                          showShadow
                          color="primary"
                          page={page}
                          total={usersPages}
                          onChange={(page) => setPage(page)}
                        />
                      </div>
                    ) : null
                  }
                >
                  <TableHeader>
                    <TableColumn>NOMBRE</TableColumn>
                    <TableColumn>CORREO</TableColumn>
                    <TableColumn>ROL</TableColumn>
                    <TableColumn>ESTADO</TableColumn>
                    <TableColumn>ACCIONES</TableColumn>
                  </TableHeader>
                  <TableBody
                    items={users}
                    loadingContent={<Spinner />}
                    loadingState={isLoadingUsers ? "loading" : "idle"}
                    emptyContent={"No users found"}
                  >
                    {(user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center">
                              <Icon
                                icon="lucide:user"
                                className="text-default-500"
                              />
                            </div>
                            <span>{user.nombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.correo}</TableCell>
                        <TableCell>
                          <div
                            className={`px-2 py-1 rounded-full text-tiny inline-block ${
                              user.tipo?.toLowerCase() === "admin"
                                ? "bg-secondary-100 text-secondary"
                                : user.tipo?.toLowerCase() === "doctor"
                                ? "bg-primary-100 text-primary"
                                : "bg-default-100 text-default-600"
                            }`}
                          >
                            {user.tipo}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            size="sm"
                            isSelected={user.estado === 1}
                            onValueChange={(isSelected) =>
                              handleUserStatusChange(user.id, isSelected)
                            }
                            color={user.estado === 1 ? "success" : "danger"}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              color="secondary"
                              isIconOnly
                              onPress={() => {
                                setSelectedUser(user);
                                setIsChangingPass(true);
                              }}
                            >
                              <Icon icon="lucide:edit" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
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
                <Table
                  removeWrapper
                  aria-label="System logs table"
                  bottomContent={
                    logsPages > 0 ? (
                      <div className="flex w-full justify-center gap-4">
                        <Pagination
                       classNames={{
        wrapper: "gap-0 overflow-visible h-8 rounded-sm border border-divider",
        item: "w-8 h-8 text-small rounded-none  text-black",
        cursor:
          "bg-linear-to-b shadow-lg from-primary  dark:from-default-300 dark:to-default-100 text-white font-bold",
      }}
                          isCompact
                          showControls
                          showShadow
                          color="primary"
                          page={logPage}
                          total={logsPages}
                          onChange={(page) => setLogPage(page)}
                        />
                      </div>
                    ) : null
                  }
                >
                  <TableHeader>
                    <TableColumn>FECHA Y HORA</TableColumn>
                    <TableColumn>USUARIO</TableColumn>
                    <TableColumn>ACCIÓN</TableColumn>
                    <TableColumn>DETALLES</TableColumn>
                  </TableHeader>
                  <TableBody
                    items={logs}
                    loadingContent={<Spinner />}
                    loadingState={isLoadingLogs ? "loading" : "idle"}
                    emptyContent={"No logs found"}
                  >
                    {(log) => (
                      <TableRow key={log.id || Math.random()}>
                        <TableCell>
                          {new Date(log.fecha_ahora).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.nombre}</TableCell>
                        <TableCell>
                          <div
                            className={`px-2 py-1 rounded-full text-tiny inline-block ${
                              log.accion === "Login"
                                ? "bg-success-100 text-success"
                                : log.accion.includes("Patient")
                                ? "bg-primary-100 text-primary"
                                : "bg-default-100 text-default-600"
                            }`}
                          >
                            {log.accion}
                          </div>
                        </TableCell>
                        <TableCell>{log.descripcion}</TableCell>
                      </TableRow>
                    )}
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
                    role: selectedKey as string,
                  });
                }}
                isRequired
              >
                <SelectItem key="admin">Administrador</SelectItem>
                <SelectItem key="doctor">Doctor</SelectItem>
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
      {isChangingPass && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <h2 className="text-lg font-semibold">Cambiar Contraseña</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Nueva Contraseña"
                placeholder="Ingrese nueva contraseña"
                type="password"
                value={passwordForm.newPassword}
                onValueChange={(value) =>
                  setPasswordForm({ ...passwordForm, newPassword: value })
                }
                isRequired
              />
              <Input
                label="Confirmar Contraseña"
                placeholder="Confirme nueva contraseña"
                type="password"
                value={passwordForm.confirmPassword}
                onValueChange={(value) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: value })
                }
                isRequired
              />
            </CardBody>
            <CardFooter>
              <div className="flex justify-end gap-2 w-full">
                <Button
                  variant="flat"
                  onPress={() => {
                    setIsChangingPass(false);
                    setPasswordForm({
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setSelectedUser(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleChangePassword}
                  isLoading={isSaving}
                  isDisabled={
                    !passwordForm.newPassword ||
                    !passwordForm.confirmPassword ||
                    passwordForm.newPassword !== passwordForm.confirmPassword
                  }
                >
                  Guardar Cambios
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
