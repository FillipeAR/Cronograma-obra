-- Fotos anexadas pelo proprietário aos pedidos de pós-obra (no máximo 2 por pedido, limite aplicado no portal).
-- Só cria uma tabela nova; não altera nem apaga nada existente.
CREATE TABLE IF NOT EXISTS "PosObraFoto" (
  "id"        TEXT PRIMARY KEY,
  "unitId"    TEXT NOT NULL REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "pedidoId"  TEXT NOT NULL,
  "mime"      TEXT NOT NULL,
  "size"      INTEGER NOT NULL,
  "data"      BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "PosObraFoto_unitId_pedidoId_idx" ON "PosObraFoto"("unitId", "pedidoId");
