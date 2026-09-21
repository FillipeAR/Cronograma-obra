import nodemailer from "nodemailer";
import { Resend } from "resend";

type Mail = { to: string; subject: string; html: string };

// Com GMAIL_USER + GMAIL_APP_PASSWORD o envio sai pela conta do Gmail (SMTP, senha de app).
// Sem elas, cai no Resend (só entrega para o dono da conta enquanto não houver domínio verificado).
export async function enviarEmail({ to, subject, html }: Mail): Promise<{ error?: string }> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME ?? "Atendimento Pós-obra"}" <${user}>`,
        to, subject, html,
      });
      return {};
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Falha no envio pelo Gmail" };
    }
  }

  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: "SEPENG <onboarding@resend.dev>",
    to, subject, html,
  });
  return error ? { error: error.message } : {};
}
