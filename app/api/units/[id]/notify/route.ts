import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePosObra } from "@/lib/posObra";
import { enviarEmail } from "@/lib/mailer";

const PORTAL_URL = process.env.PORTAL_URL ?? "https://portal-pos-obra.vercel.app";

// Título, descrição e resposta podem vir digitados pelo cliente: nunca entram crus no HTML
const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { requestId } = await req.json();

  const unit = await prisma.unit.findUnique({
    where: { id },
    select: { number: true, tower: true, floor: true, responsavel: true, email: true, posObra: true },
  });
  if (!unit) return NextResponse.json({ error: "Unidade não encontrada" }, { status: 404 });
  if (!unit.email) return NextResponse.json({ error: "Unidade sem e-mail cadastrado" }, { status: 400 });

  const items = parsePosObra(unit.posObra);
  const item = items.find((i) => i.id === requestId);
  if (!item) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  if (!item.resposta?.trim()) return NextResponse.json({ error: "Sem resposta para enviar" }, { status: 400 });

  const statusLabel: Record<string, string> = {
    aberto: "Aberto",
    em_andamento: "Em andamento",
    respondido: "Respondido",
    concluido: "Concluído",
  };

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">

        <!-- Header -->
        <tr><td style="background:#0B1929;padding:28px 32px;text-align:center">
          <p style="margin:0;color:#2AB9B0;font-size:20px;font-weight:700;letter-spacing:.5px">SEPENG</p>
          <p style="margin:6px 0 0;color:#94a3b8;font-size:12px">Portal do Proprietário</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;color:#0f172a;font-size:15px;font-weight:600">
            Olá${unit.responsavel ? `, ${esc(unit.responsavel)}` : ""}!
          </p>
          <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6">
            Há uma atualização no seu pedido de manutenção do apartamento
            <strong style="color:#0f172a">${esc(unit.number)}</strong>
            — ${unit.floor}º andar, ${esc(unit.tower)}.
          </p>

          <!-- Pedido -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:20px">
            <tr><td style="padding:16px 20px">
              <p style="margin:0 0 4px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px">Pedido</p>
              <p style="margin:0;color:#0f172a;font-size:14px;font-weight:600">${esc(item.titulo)}</p>
              ${item.descricao ? `<p style="margin:6px 0 0;color:#475569;font-size:13px">${esc(item.descricao)}</p>` : ""}
            </td></tr>
          </table>

          <!-- Status -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:20px">
            <tr><td style="background:#dcfce7;border:1px solid #86efac;border-radius:999px;padding:4px 14px">
              <p style="margin:0;color:#15803d;font-size:12px;font-weight:700">
                Status: ${statusLabel[item.status] ?? item.status}
              </p>
            </td></tr>
          </table>

          <!-- Resposta -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;border-left:3px solid #2AB9B0;border-radius:0 8px 8px 0;margin-bottom:28px">
            <tr><td style="padding:16px 20px">
              <p style="margin:0 0 6px;color:#0f766e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px">Resposta da SEPENG</p>
              <p style="margin:0;color:#134e4a;font-size:14px;line-height:1.6">${esc(item.resposta).replace(/\n/g, "<br>")}</p>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <tr><td align="center">
              <p style="margin:0 0 14px;color:#475569;font-size:13px;line-height:1.6">
                ${item.status === "respondido"
                  ? "A construtora respondeu ao seu pedido. Se o serviço já foi realizado, acesse o portal para confirmar:"
                  : item.status === "concluido" && !item.concluidoPor
                  ? "A construtora respondeu e encerrou o seu pedido. Acesse o portal para ver os detalhes:"
                  : "Acompanhe seus pedidos e as respostas da construtora no portal:"}
              </p>
              <a href="${PORTAL_URL}" style="display:inline-block;background:#2AB9B0;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px">Acessar o portal</a>
              <p style="margin:14px 0 0;color:#64748b;font-size:12px;line-height:1.6">
                Entre com o número do apartamento (<strong>${esc(unit.number)}</strong>) e a senha que a construtora te enviou.<br>
                <a href="${PORTAL_URL}" style="color:#0f766e">${PORTAL_URL}</a>
              </p>
            </td></tr>
          </table>

          <p style="margin:0;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0;padding-top:20px">
            Dúvidas? Entre em contato com a equipe SEPENG.<br>
            Este e-mail é automático — não responda diretamente.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:16px 32px;text-align:center">
          <p style="margin:0;color:#94a3b8;font-size:11px">SEPENG Engenharia · Amihan Jaguaribe</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { error } = await enviarEmail({
    to: unit.email,
    subject: `Atualização no seu pedido — Apto ${unit.number}`,
    html,
  });

  if (error) {
    console.error("[notify]", error);
    return NextResponse.json({ error: "Falha ao enviar e-mail", detail: error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
