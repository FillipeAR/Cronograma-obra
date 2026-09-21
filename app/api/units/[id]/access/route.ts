import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MAX_DONOS, isAdmin, senhaUnica } from "@/lib/portalAccess";

// Donos com acesso ao portal nesta unidade
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const acessos = await prisma.clientAccess.findMany({
    where: { unitId: id }, orderBy: { createdAt: "asc" },
    select: { id: true, nome: true, lastLoginAt: true, createdAt: true },
  });
  return NextResponse.json(acessos);
}

// Cadastra um dono e gera a senha dele. A senha em texto só é devolvida aqui, uma vez.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const { nome } = await req.json().catch(() => ({}));
  const nomeLimpo = String(nome ?? "").trim().slice(0, 80);
  if (!nomeLimpo) return NextResponse.json({ error: "Informe o nome do proprietário" }, { status: 400 });

  const unit = await prisma.unit.findUnique({ where: { id }, select: { id: true } });
  if (!unit) return NextResponse.json({ error: "Unidade não encontrada" }, { status: 404 });
  if ((await prisma.clientAccess.count({ where: { unitId: id } })) >= MAX_DONOS) {
    return NextResponse.json({ error: `Máximo de ${MAX_DONOS} proprietários por unidade` }, { status: 400 });
  }

  const { senha, hash } = await senhaUnica(id);
  const a = await prisma.clientAccess.create({ data: { unitId: id, nome: nomeLimpo, passwordHash: hash } });
  return NextResponse.json({ id: a.id, nome: a.nome, senha }, { status: 201 });
}
