"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Input,
  Button,
  Divider,
  Avatar,
  Tooltip,
  Switch,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
import axios from "axios";

interface UserData {
  id_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  tipo_usuario_id: string;
  contrasena: string;
  foto_perfil?: string;
}

interface UserUpdatePayload {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena_hash?: string;
}

export const UserSettingsPage = () => {
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

  // Estado para los datos del usuario
  const [userData, setUserData] = React.useState<UserData>({
    id_usuario: "",
    nombre: "",
    apellido: "",
    correo: "",
    tipo_usuario_id: "",
    contrasena: "",
    foto_perfil: "",
  });

  // Estados para el formulario de cambio de contraseña
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Estados para el manejo de carga y errores
  const [isSaving, setIsSaving] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState("");

  // Estado para la imagen seleccionada
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Referencia para el input de archivo
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Obtener datos del usuario
  const fetchUser = React.useCallback(async () => {
    try {
      const token = getToken();
      console.log("Fetching user with ID:", userId);

      if (!userId || !token) {
        console.error("Missing userId or token");
        return;
      }

      const response = await axios.get(
        `http://localhost:3000/api/usuarios/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("User data fetched:", response.data);

      const data = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      if (data) {
        setUserData({
          id_usuario: data.id_usuario || "",
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          correo: data.correo || "",
          tipo_usuario_id: data.tipo_usuario_id || "",
          contrasena: data.contrasena || "",
          foto_perfil: data.foto_perfil || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      addToast({
        title: "Error",
        description: "No se pudo cargar la información del usuario",
        color: "danger",
      });
    }
  }, [userId]);

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Efecto para crear una URL de vista previa cuando se selecciona una imagen
  React.useEffect(() => {
    if (selectedImage) {
      const objectUrl = URL.createObjectURL(selectedImage);
      setPreviewUrl(objectUrl);
    }
  }, [selectedImage]);

  // Manejador para la selección de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validar que sea una imagen
      if (!file.type.match("image.*")) {
        addToast({
          title: "Error",
          description: "Por favor seleccione un archivo de imagen válido",
          color: "danger",
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          title: "Error",
          description: "La imagen no debe exceder 5MB",
          color: "danger",
        });
        return;
      }

      setSelectedImage(file);
    }
  };

  // Manejador para abrir el selector de archivos
  const handleSelectImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Manejador para guardar cambios (Información general + Contraseña)
  const handleSaveChanges = async () => {
    // Validar contraseña si se está intentando cambiar
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError("Las contraseñas no coinciden");
        addToast({
          title: "Error",
          description: "Las contraseñas no coinciden",
          color: "danger",
        });
        return;
      }
      if (newPassword.length < 8) {
        setPasswordError("La contraseña debe tener al menos 8 caracteres");
        addToast({
          title: "Error",
          description: "La contraseña es muy corta",
          color: "danger",
        });
        return;
      }
    }
    setPasswordError("");
    setIsSaving(true);

    try {
      const token = getToken();
      let response;

      // Preparar FormData si hay imagen, o JSON si no
      if (selectedImage) {
        const formData = new FormData();
        formData.append("nombre", userData.nombre);
        formData.append("apellido", userData.apellido);
        formData.append("correo", userData.correo);
        formData.append("avatar", selectedImage);
        if (newPassword) {
          formData.append("contrasena_hash", newPassword);
        }

        response = await axios.patch(
          `http://localhost:3000/api/usuarios/${userId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        const payload: UserUpdatePayload = {
          nombre: userData.nombre,
          apellido: userData.apellido,
          correo: userData.correo,
        };
        if (newPassword) {
          payload.contrasena_hash = newPassword;
        }

        response = await axios.patch(
          `http://localhost:3000/api/usuarios/${userId}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setUserData(response.data);

      // Limpiar estados post-guardado
      if (selectedImage) {
        setSelectedImage(null);
        setPreviewUrl(null);
      }
      if (newPassword) {
        setNewPassword("");
        setConfirmPassword("");
        setCurrentPassword("");
      }

      addToast({
        title: "Cambios guardados",
        description: "Tu información ha sido actualizada correctamente",
        color: "success",
      });
      fetchUser();

      // Dispatch custom event to notify navbar to refresh user data
      window.dispatchEvent(new CustomEvent("userProfileUpdated"));
    } catch (error) {
      console.error("Error updating user:", error);
      addToast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración de Cuenta</h1>
        <p className="text-default-500">
          Actualiza tu información personal y preferencias
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sección de foto de perfil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1 space-y-6"
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Foto de Perfil</h2>
            </CardHeader>
            <CardBody className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar
                  src={previewUrl || userData.foto_perfil}
                  className="w-32 h-32"
                  isBordered
                  color="primary"
                  name={`${userData.nombre} ${userData.apellido}`}
                />
                <Tooltip content="Cambiar foto">
                  <Button
                    isIconOnly
                    className="absolute bottom-0 right-0 rounded-full"
                    size="sm"
                    color="primary"
                    onPress={handleSelectImage}
                  >
                    <Icon icon="lucide:camera" />
                  </Button>
                </Tooltip>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <Button
                color="primary"
                variant="flat"
                startContent={<Icon icon="lucide:upload" />}
                onPress={handleSelectImage}
                className="w-full"
              >
                Cambiar Foto
              </Button>

              {previewUrl && (
                <div className="text-center">
                  <p className="text-small text-success">
                    Nueva imagen seleccionada
                  </p>
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => {
                      setSelectedImage(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              )}

              <div className="text-center text-small text-default-500">
                <p>Formatos permitidos: JPG, PNG</p>
                <p>Tamaño máximo: 5MB</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Información de Cuenta</h2>
            </CardHeader>
            <CardBody className="space-y-2">
              <div>
                <p className="text-small text-default-500">ID de Usuario</p>
                <p className="font-medium">
                  {userData.id_usuario || "Cargando..."}
                </p>
              </div>
              <div>
                <p className="text-small text-default-500">Rol</p>
                <div className="px-2 py-1 rounded-full bg-primary-100 text-primary text-tiny inline-block">
                  {userData.tipo_usuario_id}
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Sección de información personal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Información Personal</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  placeholder="Ingrese su nombre"
                  value={userData.nombre}
                  onValueChange={(value) =>
                    setUserData({ ...userData, nombre: value })
                  }
                />
                <Input
                  label="Apellido"
                  placeholder="Ingrese su apellido"
                  value={userData.apellido}
                  onValueChange={(value) =>
                    setUserData({ ...userData, apellido: value })
                  }
                />
              </div>

              <Input
                label="Correo Electrónico"
                placeholder="Ingrese su correo electrónico"
                value={userData.correo}
                isReadOnly
                description="El correo electrónico no se puede modificar"
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Seguridad</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-small text-default-500">
                Si desea cambiar su contraseña, ingrese la nueva contraseña a
                continuación. De lo contrario, deje estos campos vacíos.
              </p>

              <Divider />

              <Input
                label="Contraseña Actual (Opcional)"
                placeholder="Ingrese su contraseña actual para confirmar"
                type="password"
                value={currentPassword}
                onValueChange={setCurrentPassword}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nueva Contraseña"
                  placeholder="Ingrese nueva contraseña"
                  type="password"
                  value={newPassword}
                  onValueChange={setNewPassword}
                  description="Mínimo 8 caracteres"
                />
                <Input
                  label="Confirmar Contraseña"
                  placeholder="Confirme nueva contraseña"
                  type="password"
                  value={confirmPassword}
                  onValueChange={setConfirmPassword}
                  isInvalid={!!passwordError}
                  errorMessage={passwordError}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Preferencias</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Notificaciones del Sistema</p>
                  <p className="text-small text-default-500">
                    Recibir notificaciones dentro de la aplicación
                  </p>
                </div>
                <Switch isSelected defaultSelected />
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-end gap-2 sticky bottom-4 bg-background/80 backdrop-blur-md p-4 rounded-large border border-default-200 shadow-lg z-50">
        <Button variant="flat" onPress={() => history.back()}>
          Cancelar
        </Button>
        <Button
          color="primary"
          onPress={handleSaveChanges}
          isLoading={isSaving}
          startContent={<Icon icon="lucide:save" />}
        >
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
};
