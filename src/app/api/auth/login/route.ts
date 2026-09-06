import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  }

  await setSessionCookie({ userId: user.id, name: user.name, username: user.username, role: user.role });
  return NextResponse.json({ name: user.name, role: user.role });
}
