import { NextRequest, NextResponse } from "next/server";

type Role = "ADMIN" | "ADMINISTRADOR" | "COORDENADOR";

const permissions: Record<string, string[]> = {
  ADMIN: ["/administrador", "/adminstrador"],
  ADMINISTRADOR: ["/administrador", "/adminstrador"],
  COORDENADOR: ["/coordenador"],
};

const publicPaths = ["/", "/login", "/403"];

function isPublicRoute(pathname: string): boolean {
  return publicPaths.includes(pathname);
}

function hasPermission(pathname: string, role: string): boolean {
  const allowedRoutes = permissions[role] || [];

  return allowedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permite rotas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Obtém o papel do usuário
  const role = request.cookies.get("role")?.value;

  // Verifica se o role é válido
  if (!role || !(role in permissions)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verifica permissão para acessar a rota
  if (!hasPermission(pathname, role)) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  // Permite acesso
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
    "/administrador/:path*",
    "/adminstrador/:path*",
    "/coordenador/:path*",
  ],
};
