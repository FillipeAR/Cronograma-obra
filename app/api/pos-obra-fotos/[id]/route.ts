import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Visualiza a foto de um pedido de pós-obra (id não-adivinhável, como em /api/files)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = await prisma.posObraFoto.findUnique({ where: { id } });
  if (!f) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  return new Response(new Uint8Array(f.data), {
    headers: {
      "Content-Type": f.mime,
      "Content-Length": String(f.size),
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
