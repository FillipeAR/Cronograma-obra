import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function isAdmin(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.role === "admin";
}

// Lista as fotos dos pedidos de pós-obra da unidade (só metadados, sem os bytes)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fotos = await prisma.posObraFoto.findMany({
    where: { unitId: id },
    select: { id: true, pedidoId: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(fotos);
}

// Remove as fotos de um pedido (usado quando o pedido é excluído)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const pedidoId = req.nextUrl.searchParams.get("pedidoId");
  if (!pedidoId) return NextResponse.json({ error: "pedidoId obrigatório" }, { status: 400 });
  await prisma.posObraFoto.deleteMany({ where: { unitId: id, pedidoId } });
  return NextResponse.json({ ok: true });
}
