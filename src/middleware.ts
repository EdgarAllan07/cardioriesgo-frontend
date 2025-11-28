import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserByToken } from "./lib/user";
// 1. Define las rutas que quieres proteger
// Estas son las rutas que antes tenías en <PrivateRoute>
const protectedRoutes = [
  "/dashboard",
  "/patient-evaluation",
  "/risk-report",
  "/patient-history",
  "/admin",
  "/alerts",
  "/user-settings",
  "/appointments",
];

export async function middleware(request: NextRequest) {
  // 2. Obtiene el token de autenticación (guardado en una cookie)
  // Lo llamaremos 'auth-token' como ejemplo
  const token = request.cookies.get("auth-token")?.value;
  const userId = request.cookies.get("userId")?.value;
  const pathname = request.nextUrl.pathname;
  let user;
  // 3. Comprueba si la ruta actual es una de las protegidas
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 4. LÓGICA DE REDIRECCIÓN (Reemplaza <PrivateRoute>)
  if (isProtectedRoute && !token) {
    // Si el usuario NO tiene token y quiere entrar a una ruta protegida,
    // redirígelo al login.
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 5. LÓGICA DE REDIRECCIÓN (Reemplaza <Route path="/login">)
  if (pathname === "/login" && token) {
    // Si el usuario SÍ tiene token y va a la página de login,
    // redirígelo al dashboard.
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (token && userId) {
    try {
      user = await getUserByToken(userId, token!);
      if (
        user &&
        user[0] &&
        user[0].tipo_usuario_id !== "Administrador" &&
        pathname === "/admin"
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      console.error("Error fetching user in middleware:", error);
      // Optionally clear cookies or redirect to login if token is invalid
    }
  }

  // 6. Si todo está bien, deja que el usuario continúe
  return NextResponse.next();
}

// 7. Configuración del Matcher:
// Esto le dice al middleware en QUÉ RUTAS debe ejecutarse.
// Es más eficiente que ejecutarlo en cada request.
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto las que empiezan por:
     * - api (Rutas de API)
     * - _next/static (Archivos estáticos)
     * - _next/image (Optimización de imágenes)
     * - favicon.ico (Icono)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const isAuthenticated = request.cookies.get("auth")?.value === "true";

//   const protectedRoutes = [
//     "/dashboard",
//     "/patient-evaluation",
//     "/risk-report",
//     "/patient-history",
//     "/admin",
//     "/alerts",
//     "/user-settings",
//     "/appointments",
//   ];

//   if (protectedRoutes.some(r => request.nextUrl.pathname.startsWith(r))) {
//     if (!isAuthenticated) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//   }

//   return NextResponse.next();
// }
