"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link as HeroLink,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Badge,
} from "@heroui/react";

import { Icon } from "@iconify/react";
import { useAlerts } from "@/hooks/use-alerts";

interface User {
  id_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  tipo_usuario_id: string | number;
  contrasena: string;
  foto_perfil?: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export const MainLayout = ({ children, onLogout }: MainLayoutProps) => {
  const pathname = usePathname();
  const { alertsCount } = useAlerts();
  const [user, setUser] = useState<User | null>(null);

  const isActive = (path: string) => pathname === path;

  const getUserId = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )userId=([^;]+)"));
    return match ? match[2] : null;
  };
  const getToken = () => {
    const match = document.cookie.match(new RegExp("(^| )auth-token=([^;]+)"));
    return match ? match[2] : null;
  };

  const fetchUser = React.useCallback(async () => {
    const userId = getUserId();
    const token = getToken();
    if (userId) {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/usuarios/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        if (data) {
          setUser({
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
        console.log(error);
      }
    } else {
      console.log("No se encontro el usuario ", userId);
    }
  }, []);

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Listen for profile update events from user settings page
  React.useEffect(() => {
    const handleProfileUpdate = () => {
      console.log("Profile updated event received, refreshing user data...");
      fetchUser();
    };

    window.addEventListener("userProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
    };
  }, [fetchUser]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar maxWidth="2xl" className="border-b border-divider">
        <NavbarBrand>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Icon icon="lucide:heart-pulse" className="text-primary text-2xl" />
            <p className="font-semibold text-inherit">CardioRiesgo IA</p>
          </Link>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={isActive("/dashboard")}>
            <HeroLink
              as={Link}
              href="/dashboard"
              color={isActive("/dashboard") ? "primary" : "foreground"}
            >
              Panel Principal
            </HeroLink>
          </NavbarItem>

          <NavbarItem isActive={isActive("/patient-evaluation")}>
            <HeroLink
              as={Link}
              href="/patient-evaluation"
              color={isActive("/patient-evaluation") ? "primary" : "foreground"}
            >
              Nueva Evaluación
            </HeroLink>
          </NavbarItem>

          <NavbarItem isActive={isActive("/patient-history")}>
            <HeroLink
              as={Link}
              href="/patient-history"
              color={isActive("/patient-history") ? "primary" : "foreground"}
            >
              Historial de Pacientes
            </HeroLink>
          </NavbarItem>

          <NavbarItem isActive={isActive("/appointments")}>
            <HeroLink
              as={Link}
              href="/appointments"
              color={isActive("/appointments") ? "primary" : "foreground"}
            >
              Citas Médicas
            </HeroLink>
          </NavbarItem>

          {user?.tipo_usuario_id === "Administrador" && (
            <NavbarItem isActive={isActive("/admin")}>
              <HeroLink
                as={Link}
                href="/admin"
                color={isActive("/admin") ? "primary" : "foreground"}
              >
                Administración
              </HeroLink>
            </NavbarItem>
          )}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Button
              as={Link}
              href="/alerts"
              variant="flat"
              isIconOnly
              color={alertsCount > 0 ? "danger" : "default"}
              aria-label="Alerts"
            >
              <Badge
                content={alertsCount}
                color="danger"
                isInvisible={alertsCount === 0}
              >
                <Icon icon="lucide:bell" className="text-xl" />
              </Badge>
            </Button>
          </NavbarItem>

          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name="Dr. Smith"
                size="sm"
                src={user?.foto_perfil}
              />
            </DropdownTrigger>

            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Bienvenido</p>
                <p className="font-semibold">
                  {user?.nombre + " " + user?.apellido}{" "}
                </p>
              </DropdownItem>

              <DropdownItem key="settings" as={Link} href="/user-settings">
                Mi Configuración
              </DropdownItem>

              <DropdownItem key="logout" color="danger" onClick={onLogout}>
                Cerrar Sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <footer className="py-4 px-6 border-t border-divider">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-small text-default-500">
            © 2024 Sistema de Evaluación de Riesgo Cardiovascular con IA
          </p>

          <div className="flex gap-4 mt-2 sm:mt-0">
            <HeroLink href="#" size="sm" color="foreground">
              Política de Privacidad
            </HeroLink>
            <HeroLink href="#" size="sm" color="foreground">
              Términos de Servicio
            </HeroLink>
            <HeroLink href="#" size="sm" color="foreground">
              Contacto
            </HeroLink>
          </div>
        </div>
      </footer>
    </div>
  );
};
