import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "sua_chave_secreta_super_segura";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Só proteger a rota /Admin
  if (pathname.startsWith("/Admin")) {
    const token = req.cookies.get("admin-token")?.value;

    if (!token) {
      // Se não tiver token, redireciona para home
      return NextResponse.redirect(new URL("/", req.url));
    }

    try {
      // Verifica token JWT
      jwt.verify(token, SECRET);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

// Configura para rodar no /Admin
export const config = {
  matcher: ["/Admin/:path*"],
};
