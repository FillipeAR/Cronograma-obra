export type UnitStatus =
  | "disponivel"    // verde   — vistoria com cliente concluída / aguardando quitação
  | "agendada"      // marrom  — vistoria marcada
  | "revistoria"    // ciano   — 2ª vistoria agendada
  | "concluida"     // roxo    — escritura
  | "pendencia"     // amarelo — tem pendências
  | "indisponivel"; // vermelho — sem acesso

export type PendenciaItem = {
  id: string;
  text: string;
  done: boolean;
};

export type VistoriaSummary = { id: string; unitId: string; tipo: string; status: string; checklist: string | null };

export type PosObraItem = {
  id: string;
  titulo: string;
  descricao: string;
  status: "aberto" | "em_andamento" | "atendido" | "aceito";
  resposta: string;
  aceito: boolean;
  createdAt: string;
  origem?: "admin" | "portal";   // quem abriu o pedido
  assinaturaImg?: string;        // assinatura da aceitação (dataURL)
  assinaturaData?: string;       // quando foi aceito/assinado
};

export type EntregaChaves = {
  docs: PendenciaItem[];
  dataEntrega: string;
  documentoAssinado: boolean;
  dataAssinatura: string;
};

export type Unit = {
  id: string;
  number: string;
  floor: number;
  position: number;
  tower: string;
  status: UnitStatus;
  notes: string | null;
  responsavel: string | null;
  pendencias: string | null; // JSON: PendenciaItem[]

  // Proprietário
  email: string | null;
  telefone: string | null;
  cpf: string | null;

  // Financiamento
  situacao: string | null;
  valorPago: number | null;
  saldoDevedor: number | null;

  // Contrato
  contratoUrl: string | null;
  contratoNotes: string | null;

  // Checklists detalhados (JSON: PendenciaItem[])
  previstoria: string | null;
  vistoriaCheck: string | null;

  // Entrega de chaves (JSON: EntregaChaves)
  entregaChaves: string | null;

  // Pós-obra (JSON: PosObraItem[])
  posObra: string | null;

  // Portal do proprietário (token do link único)
  portalToken: string | null;
};

export type UnitPatch = Partial<{
  status: UnitStatus;
  notes: string;
  responsavel: string;
  pendencias: string;
  email: string;
  telefone: string;
  cpf: string;
  situacao: string;
  valorPago: number | string;
  saldoDevedor: number | string;
  contratoUrl: string;
  contratoNotes: string;
  previstoria: string;
  vistoriaCheck: string;
  entregaChaves: string;
  posObra: string;
}>;

export const STATUS_COLOR: Record<UnitStatus, string> = {
  disponivel:   "#22C55E",  // verde
  agendada:     "#92400E",  // marrom
  revistoria:   "#06B6D4",  // ciano
  concluida:    "#7C3AED",  // roxo
  pendencia:    "#EAB308",  // amarelo
  indisponivel: "#EF4444",  // vermelho
};

export const STATUS_LABEL: Record<UnitStatus, string> = {
  disponivel:   "Vistoria concluída / Aguardando quitação",
  agendada:     "Agendada",
  revistoria:   "Revistoria",
  concluida:    "Escritura",
  pendencia:    "Pendência",
  indisponivel: "Indisponível",
};

export const STATUS_EMOJI: Record<UnitStatus, string> = {
  disponivel:   "🟢",
  agendada:     "🟤",
  revistoria:   "🔄",
  concluida:    "🟣",
  pendencia:    "⚠️",
  indisponivel: "🚫",
};

export const ALL_STATUSES: UnitStatus[] = [
  "disponivel",
  "agendada",
  "revistoria",
  "concluida",
  "pendencia",
  "indisponivel",
];

/** Cor do bloco (3D e card) quando as chaves já foram entregues — sobrepõe a cor de status. */
export const KEYS_DELIVERED_COLOR = "#F5F5F0";

export function keysDelivered(entregaChaves: string | null): boolean {
  if (!entregaChaves) return false;
  try { return !!(JSON.parse(entregaChaves) as EntregaChaves).documentoAssinado; } catch { return false; }
}

/** Cor do bloco da unidade: branco se chaves entregues, senão a cor do status. */
export function unitBlockColor(u: { status: UnitStatus; entregaChaves: string | null }): string {
  return keysDelivered(u.entregaChaves) ? KEYS_DELIVERED_COLOR : STATUS_COLOR[u.status];
}

/* ── Estrutura do prédio ────────────────────────────────────────────
   Pavimentos de apartamento: 1 a 16 (posições 1-6 = apartamentos,
   posição 7 = área comum do pavimento — hall, escada, área técnica).
   Níveis especiais: -2=G2, -1=G1, 0=Térreo, 17=Rooftop, 18=Cobertura Verde. */
export const APT_FLOOR_MIN = 1;
export const APT_FLOOR_MAX = 16;
export const COMMON_POSITION = 7;

export function isSpecialLevel(floor: number): boolean {
  return floor < APT_FLOOR_MIN || floor > APT_FLOOR_MAX;
}
export function isCommonArea(u: { floor: number; position: number }): boolean {
  return !isSpecialLevel(u.floor) && u.position >= COMMON_POSITION;
}
export function isApartment(u: { floor: number; position: number }): boolean {
  return !isSpecialLevel(u.floor) && u.position < COMMON_POSITION;
}

export function floorName(floor: number): string {
  if (floor === 18) return "Cobertura Verde";
  if (floor === 17) return "Rooftop";
  if (floor === 0) return "Térreo";
  if (floor === -1) return "G1";
  if (floor === -2) return "G2";
  return `${floor}º andar`;
}

/** Rótulo curto para o strip vertical do 3D. */
export function floorShort(floor: number): string {
  if (floor === 18) return "CV";
  if (floor === 17) return "RT";
  if (floor === 0) return "T";
  if (floor === -1) return "G1";
  if (floor === -2) return "G2";
  return String(floor);
}
