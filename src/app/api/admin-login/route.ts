import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "CHAVE_SUPER_SECRETA";

export async function POST(req: Request) {
  const { uid, email } = await req.json();

  const token = jwt.sign(
    { uid, email },
    SECRET,
    { expiresIn: "2h" }
  );

  return NextResponse.json(
    { success: true },
    {
      headers: {
        "Set-Cookie": `admin_token=${token}; HttpOnly; Path=/; Max-Age=7200; SameSite=Lax`
      }
    }
  );
}
