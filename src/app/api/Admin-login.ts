import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { password } = req.body;

  if (password === process.env.ADMIN_KEY) {
    // cria um token JWT temporário para frontend
    const token = jwt.sign({ admin: true }, process.env.ADMIN_KEY!, {
      expiresIn: "1h",
    });
    return res.status(200).json({ token });
  }

  return res.status(401).json({ message: "Senha incorreta" });
}
