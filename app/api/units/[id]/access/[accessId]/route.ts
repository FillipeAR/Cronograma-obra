import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, senhaUnica } from "@/lib/portalAccess";

// Nova senha temporária para um dono (a anterior deixa de funcionar, o bloqueio é zerado
// e ele volta a ter que criar uma senha pessoal no próximo acesso)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; accessId: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id, accessId } = await params;
  const a = await prisma.clientAccess.findFirst({ where: { id: accessId, unitId: id } });
  if (!a) return NextResponse.json({ error: "Acesso não encontrado" }, { status: 404 });
  const { senha, hash } = await senhaUnica(id, accessId);
  await prisma.clientAccess.update({ where: { id: accessId }, data: { passwordHash: hash, failedAttempts: 0, lockedUntil: null, senhaTemporaria: true } });
  return NextResponse.json({ senha });
}

// Revoga o acesso de um dono
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; accessId: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id, accessId } = await params;
  await prisma.clientAccess.deleteMany({ where: { id: accessId, unitId: id } });
  return NextResponse.json({ ok: true });
}
