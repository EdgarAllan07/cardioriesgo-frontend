"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { 
  Navbar, NavbarBrand, NavbarContent, NavbarItem, 
  Link as HeroLink, Button, Dropdown, DropdownTrigger, 
  DropdownMenu, DropdownItem, Avatar, Badge 
} from "@heroui/react";

import { Icon } from "@iconify/react";
import { useAlerts } from "@/hooks/use-alerts";

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export const MainLayout = ({ children, onLogout }: MainLayoutProps) => {
  const pathname = usePathname();
  const { alertsCount } = useAlerts();

  const isActive = (path: string) => pathname === path;

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

          <NavbarItem isActive={isActive("/admin")}>
            <HeroLink 
              as={Link} 
              href="/admin"
              color={isActive("/admin") ? "primary" : "foreground"}
            >
              Administración
            </HeroLink>
          </NavbarItem>
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
                src="https://img.heroui.chat/image/avatar?w=40&h=40&u=doctor1"
              />
            </DropdownTrigger>

            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Conectado como</p>
                <p className="font-semibold">doctor@hospital.com</p>
              </DropdownItem>

              <DropdownItem key="settings" as={Link} href="/user-settings">
                Mi Configuración
              </DropdownItem>


              <DropdownItem 
                key="logout" 
                color="danger" 
                onClick={onLogout}
              >
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
            <HeroLink href="#" size="sm" color="foreground">Política de Privacidad</HeroLink>
            <HeroLink href="#" size="sm" color="foreground">Términos de Servicio</HeroLink>
            <HeroLink href="#" size="sm" color="foreground">Contacto</HeroLink>
          </div>
        </div>
      </footer>
    </div>
  );
};
