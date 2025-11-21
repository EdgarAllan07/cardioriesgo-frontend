"use client"
import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardFooter, Input, Button, Divider, Avatar, Tooltip, Switch } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";

interface UserData {
  id_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  tipo_usuario_id: number;
  tipo_usuario_nombre: string;
  foto_perfil?: string;
}

export const UserSettingsPage = () => {
  const history = useRouter();
  
  // Estado para los datos del usuario
  const [userData, setUserData] = React.useState<UserData>({
    id_usuario: "U-001",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "doctor@hospital.com",
    tipo_usuario_id: 1,
    tipo_usuario_nombre: "Doctor",
    foto_perfil: "https://img.heroui.chat/image/avatar?w=200&h=200&u=doctor1"
  });
  
  // Estados para el formulario de cambio de contraseña
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  
  // Estados para el manejo de carga y errores
  const [isSaving, setIsSaving] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState("");
  
  // Estado para la imagen seleccionada
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  
  // Referencia para el input de archivo
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Efecto para crear una URL de vista previa cuando se selecciona una imagen
  React.useEffect(() => {
    if (selectedImage) {
      const objectUrl = URL.createObjectURL(selectedImage);
      setPreviewUrl(objectUrl);
      
      // Limpiar la URL al desmontar
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedImage]);
  
  // Manejador para la selección de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar que sea una imagen
      if (!file.type.match('image.*')) {
        addToast({
          title: "Error",
          description: "Por favor seleccione un archivo de imagen válido",
          color: "danger"
        });
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          title: "Error",
          description: "La imagen no debe exceder 5MB",
          color: "danger"
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
  
  // Manejador para guardar cambios de información general
  const handleSaveChanges = () => {
    setIsSaving(true);
    
    // Simulación de llamada a API
    setTimeout(() => {
      setIsSaving(false);
      
      // Si hay una imagen seleccionada, simular la subida
      if (selectedImage) {
        // En un caso real, aquí se subiría la imagen y se actualizaría la URL
        setUserData({
          ...userData,
          foto_perfil: previewUrl || userData.foto_perfil
        });
        setSelectedImage(null);
        setPreviewUrl(null);
      }
      
      addToast({
        title: "Cambios guardados",
        description: "Tu información ha sido actualizada correctamente",
        color: "success"
      });
    }, 1500);
  };
  
  // Manejador para cambiar contraseña
  const handleChangePassword = () => {
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    
    // Validar longitud mínima
    if (newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    
    setPasswordError("");
    setIsChangingPassword(true);
    
    // Simulación de llamada a API
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      addToast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada correctamente",
        color: "success"
      });
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración de Cuenta</h1>
        <p className="text-default-500">Actualiza tu información personal y preferencias</p>
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
                  <p className="text-small text-success">Nueva imagen seleccionada</p>
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
                <p className="font-medium">{userData.id_usuario}</p>
              </div>
              <div>
                <p className="text-small text-default-500">Rol</p>
                <div className="px-2 py-1 rounded-full bg-primary-100 text-primary text-tiny inline-block">
                  {userData.tipo_usuario_nombre}
                </div>
              </div>
              <div>
                <p className="text-small text-default-500">Fecha de Registro</p>
                <p className="font-medium">15 de julio, 2024</p>
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
                  onValueChange={(value) => setUserData({...userData, nombre: value})}
                />
                <Input
                  label="Apellido"
                  placeholder="Ingrese su apellido"
                  value={userData.apellido}
                  onValueChange={(value) => setUserData({...userData, apellido: value})}
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
            <CardFooter>
              <Button
                color="primary"
                onPress={handleSaveChanges}
                isLoading={isSaving}
              >
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Seguridad</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-small text-default-500">
                Cambia tu contraseña regularmente para mantener tu cuenta segura.
              </p>
              
              <Divider />
              
              <Input
                label="Contraseña Actual"
                placeholder="Ingrese su contraseña actual"
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
            <CardFooter>
              <Button
                color="primary"
                onPress={handleChangePassword}
                isLoading={isChangingPassword}
                isDisabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Actualizar Contraseña
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Preferencias</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Notificaciones por Correo</p>
                  <p className="text-small text-default-500">Recibir alertas de pacientes de alto riesgo</p>
                </div>
                <Switch isSelected defaultSelected />
              </div>
              
              <Divider />
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Notificaciones del Sistema</p>
                  <p className="text-small text-default-500">Recibir notificaciones dentro de la aplicación</p>
                </div>
                <Switch isSelected defaultSelected />
              </div>
              
              <Divider />
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Informes Automáticos</p>
                  <p className="text-small text-default-500">Generar informes semanales de pacientes</p>
                </div>
                <Switch />
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          variant="flat"
          onPress={() => history.back()}
        >
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