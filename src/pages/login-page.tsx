"use client"
import React from "react";
import { Card, CardBody, CardHeader, Input, Button, Checkbox, Link, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isSignUp, setIsSignUp] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
          <CardHeader className="flex flex-col items-center gap-3 pb-0">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100">
              <Icon icon="lucide:heart-pulse" className="text-primary text-3xl" />
            </div>
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-bold text-foreground">CardioRiesgo IA</h1>
              <p className="text-small text-default-500">
                Sistema de Evaluación de Riesgo Cardiovascular con IA
              </p>
            </div>
          </CardHeader>
          <CardBody className="py-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Correo Electrónico"
                placeholder="Ingrese su correo electrónico"
                type="email"
                value={email}
                onValueChange={setEmail}
                variant="bordered"
                isRequired
                startContent={
                  <Icon icon="lucide:mail" className="text-default-400 text-medium" />
                }
              />
              <Input
                label="Contraseña"
                placeholder="Ingrese su contraseña"
                type="password"
                value={password}
                onValueChange={setPassword}
                variant="bordered"
                isRequired
                startContent={
                  <Icon icon="lucide:lock" className="text-default-400 text-medium" />
                }
              />
              
              <div className="flex items-center justify-between">
                <Checkbox isSelected={rememberMe} onValueChange={setRememberMe} size="sm">
                  Recordarme
                </Checkbox>
                <Link href="#" size="sm">¿Olvidó su contraseña?</Link>
              </div>
              
              <Button 
                type="submit" 
                color="primary" 
                fullWidth 
                isLoading={isLoading}
              >
                {isSignUp ? "Registrarse" : "Iniciar Sesión"}
              </Button>
              
              <Divider className="my-4" />
              
              <div className="text-center text-small">
                {isSignUp ? (
                  <p>
                    ¿Ya tiene una cuenta?{" "}
                    <Link href="#" onPress={toggleMode}>Iniciar Sesión</Link>
                  </p>
                ) : (
                  <p>
                    ¿No tiene una cuenta?{" "}
                    <Link href="#" onPress={toggleMode}>Registrarse</Link>
                  </p>
                )}
              </div>
            </form>
          </CardBody>
        </Card>
        
        <div className="mt-6 text-center text-small text-default-500">
          <p>© 2024 Sistema de Evaluación de Riesgo Cardiovascular con IA. Todos los derechos reservados.</p>
        </div>
      </motion.div>
    </div>
  );
};