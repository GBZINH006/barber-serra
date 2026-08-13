-- BARBER SERRA - SUPABASE SCHEMA (Paste in Supabase SQL editor)
-- Creates core tables, indexes, triggers and RLS policies

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

CREATE TRIGGER trg_update_barbeiros BEFORE UPDATE ON barbeiros FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
CREATE TRIGGER trg_update_clientes BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
CREATE TRIGGER trg_update_agendamentos BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

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

-- Políticas públicas/seguras (exemplos)
CREATE POLICY IF NOT EXISTS "barbeiros_public" ON barbeiros FOR SELECT USING (ativo = true);

CREATE POLICY IF NOT EXISTS "agendamentos_public_insert" ON agendamentos FOR INSERT WITH CHECK (true);

-- VIEW ÚTIL
CREATE OR REPLACE VIEW vw_agendamentos_completos AS
SELECT a.id, a.data, a.horario, a.servico, a.cliente_nome, a.cliente_telefone, a.cliente_email, a.status, a.observacoes, a.criado_em,
       b.nome as barbeiro_nome, b.foto as barbeiro_foto, b.especialidade as barbeiro_especialidade
FROM agendamentos a
JOIN barbeiros b ON a.barbeiro_id = b.id
ORDER BY a.data DESC, a.horario DESC;
