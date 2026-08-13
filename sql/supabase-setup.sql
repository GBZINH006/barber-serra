-- SUPABASE SETUP SQL: schema + seeds for BARBER SERRA
-- Paste into Supabase SQL editor

-- -------- SCHEMA (tables, triggers, views) --------

-- Enable uuid-ossp extension if not present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- BARBEIROS
CREATE TABLE IF NOT EXISTS barbeiros (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  especialidade VARCHAR(200),
  foto TEXT,
  telefone VARCHAR(20),
  instagram VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  telefone VARCHAR(20),
  pontos_fidelidade INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SERVICOS
CREATE TABLE IF NOT EXISTS servicos (
  id TEXT PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  preco NUMERIC(10,2) NOT NULL,
  duracao INTEGER NOT NULL, -- minutos
  categoria TEXT,
  destaque BOOLEAN DEFAULT false
);

-- AGENDAMENTOS
CREATE TABLE IF NOT EXISTS agendamentos (
  id BIGSERIAL PRIMARY KEY,
  barbeiro_id BIGINT NOT NULL REFERENCES barbeiros(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  servico TEXT NOT NULL REFERENCES servicos(id),
  data DATE NOT NULL,
  horario TIME NOT NULL,
  cliente_nome VARCHAR(100) NOT NULL,
  cliente_telefone VARCHAR(20) NOT NULL,
  cliente_email VARCHAR(100),
  status VARCHAR(20) DEFAULT 'confirmado' CHECK (status IN ('confirmado','cancelado','concluido','pendente')),
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(barbeiro_id, data, horario)
);

-- TRIGGERS PARA ATUALIZAR TIMESTAMPS
CREATE OR REPLACE FUNCTION atualizar_timestamp() RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_update_barbeiros'
      AND tgrelid = 'public.barbeiros'::regclass
  ) THEN
    EXECUTE $create$
      CREATE TRIGGER trg_update_barbeiros BEFORE UPDATE ON barbeiros FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
    $create$;
  END IF;
END
$$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_update_clientes'
      AND tgrelid = 'public.clientes'::regclass
  ) THEN
    EXECUTE $create$
      CREATE TRIGGER trg_update_clientes BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
    $create$;
  END IF;
END
$$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_update_agendamentos'
      AND tgrelid = 'public.agendamentos'::regclass
  ) THEN
    EXECUTE $create$
      CREATE TRIGGER trg_update_agendamentos BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
    $create$;
  END IF;
END
$$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_barbeiro ON agendamentos(barbeiro_id);

-- Habilitar RLS e políticas básicas (ajuste conforme necessidades)
DO $$
BEGIN
  IF to_regclass('public.barbeiros') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.barbeiros ENABLE ROW LEVEL SECURITY';
  END IF;
END
$$;
DO $$
BEGIN
  IF to_regclass('public.clientes') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY';
  END IF;
END
$$;
DO $$
BEGIN
  IF to_regclass('public.agendamentos') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY';
  END IF;
END
$$;

-- Políticas públicas/seguras (exemplos) - idempotent
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'barbeiros_public' AND polrelid = 'public.barbeiros'::regclass) THEN
    EXECUTE $create$
      CREATE POLICY barbeiros_public ON barbeiros FOR SELECT USING (ativo = true);
    $create$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'agendamentos_public_insert' AND polrelid = 'public.agendamentos'::regclass) THEN
    EXECUTE $create$
      CREATE POLICY agendamentos_public_insert ON agendamentos FOR INSERT WITH CHECK (true);
    $create$;
  END IF;
END
$$;

-- VIEW ÚTIL
CREATE OR REPLACE VIEW vw_agendamentos_completos AS
SELECT a.id, a.data, a.horario, a.servico, a.cliente_nome, a.cliente_telefone, a.cliente_email, a.status, a.observacoes, a.criado_em,
       b.nome as barbeiro_nome, b.foto as barbeiro_foto, b.especialidade as barbeiro_especialidade
FROM agendamentos a
JOIN barbeiros b ON a.barbeiro_id = b.id
ORDER BY a.data DESC, a.horario DESC;

-- -------- SEEDS --------

INSERT INTO barbeiros (nome, email, especialidade, foto, telefone, instagram, ordem)
VALUES
  ('Felipe Costa', 'felipe@barberserra.com', 'Cortes clássicos e degradê', '/images/barber-1.svg', '+55 11 99999-0001', '@felipebarber', 1),
  ('Claudinha Silva', 'claudia@barberserra.com', 'Barba e design de sobrancelhas', '/images/barber-2.svg', '+55 11 99999-0002', '@claudiabarber', 2),
  ('Marcelo Ramos', 'marcelo@barberserra.com', 'Cortes modernos e descolados', '/images/barber-3.svg', '+55 11 99999-0003', '@marcelobarber', 3)
ON CONFLICT DO NOTHING;

INSERT INTO servicos (id, nome, preco, duracao, categoria, destaque) VALUES
  ('corte-classico', 'Corte Clássico', 45.00, 30, 'Cabelo', true),
  ('degrade', 'Degradê', 60.00, 45, 'Cabelo', true),
  ('barba', 'Barba', 30.00, 25, 'Barba', false)
ON CONFLICT DO NOTHING;

-- Exemplo de cliente seed
INSERT INTO clientes (id, nome, email, telefone, pontos_fidelidade)
VALUES
  (gen_random_uuid(), 'João Silva', 'joao@example.com', '+55 11 98888-1111', 10),
  (gen_random_uuid(), 'Mariana Souza', 'mariana@example.com', '+55 11 97777-2222', 5)
ON CONFLICT DO NOTHING;

-- Exemplo de agendamento seed
INSERT INTO agendamentos (barbeiro_id, cliente_id, servico, data, horario, cliente_nome, cliente_telefone, cliente_email, status)
SELECT b.id, c.id, 'corte-classico', (CURRENT_DATE + INTERVAL '7 days')::date, '10:00'::time, c.nome, c.telefone, c.email, 'confirmado'
FROM barbeiros b, clientes c
WHERE b.ordem = 1
LIMIT 1;

-- Recomendações: após rodar os seeds, configure RLS e policies de acordo com as regras de negócio.
