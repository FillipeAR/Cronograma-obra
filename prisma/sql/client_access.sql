-- Acessos dos proprietários ao portal de pós-obra. Só cria uma tabela nova; não altera nem apaga nada existente.
CREATE TABLE IF NOT EXISTS "ClientAccess" (
  "id"             TEXT PRIMARY KEY,
  "unitId"         TEXT NOT NULL REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "nome"           TEXT NOT NULL,
  "passwordHash"   TEXT NOT NULL,
  "failedAttempts" INTEGER NOT NULL DEFAULT 0,
  "lockedUntil"    TIMESTAMP(3),
  "lastLoginAt"    TIMESTAMP(3),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ClientAccess_unitId_idx" ON "ClientAccess"("unitId");
