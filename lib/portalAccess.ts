import { NextRequest } from "next/server";
import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const MAX_DONOS = 4;

export async function isAdmin(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.role === "admin";
}

// Sem 0/O, 1/I/l para a senha ser fácil de ditar por telefone
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const gerar = (tam = 8) => Array.from({ length: tam }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");

// Senha nova que não coincide com a de outro dono da mesma unidade (o login é apto + senha)
export async function senhaUnica(unitId: string, ignorarId?: string) {
  const outros = await prisma.clientAccess.findMany({ where: { unitId, ...(ignorarId ? { id: { not: ignorarId } } : {}) } });
  for (;;) {
    const senha = gerar();
    const conflito = await Promise.all(outros.map((o) => bcrypt.compare(senha, o.passwordHash)));
    if (!conflito.some(Boolean)) return { senha, hash: await bcrypt.hash(senha, 10) };
  }
}
