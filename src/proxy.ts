import { NextRequest, NextResponse } from "next/server";

type Role = "ADMIN" | "COORDENADOR";

const permissions: Record<Role, string[]> = {
  ADMIN: ["/administrador"],
  COORDENADOR: ["/coordenador"],
};

const publicPaths = ["/", "/login", "/403"];

function isPublicRoute(pathname: string): boolean {
  return publicPaths.includes(pathname);
}

function hasPermission(pathname: string, role: Role): boolean {
  const allowedRoutes = permissions[role];

  return allowedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function proxy(request: NextRequest) {
  // remover quando a autenticação estiver implementada
  const authEnabled = false;

  if (!authEnabled) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Permite rotas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Obtém o papel do usuário (obs: remover após a criação de um getSession afins de segurança)
  const role = request.cookies.get("role")?.value;

  // Verifica se o role é válido
  if (!role || !(role in permissions)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = role as Role;

  // Verifica permissão para acessar a rota
  if (!hasPermission(pathname, userRole)) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  // Permite acesso
  return NextResponse.next();
}

export const config = {
  matcher: ["/administrador/:path*", "/coordenador/:path*"],
};
