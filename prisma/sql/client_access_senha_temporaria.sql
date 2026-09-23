-- Obriga o proprietário a criar uma senha pessoal no primeiro acesso ao portal.
-- Só adiciona uma coluna; acessos já existentes também ficam como temporários (a construtora conhece a senha deles).
ALTER TABLE "ClientAccess" ADD COLUMN IF NOT EXISTS "senhaTemporaria" BOOLEAN NOT NULL DEFAULT true;
