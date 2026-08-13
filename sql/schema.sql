-- BARBER SERRA - CLEAN SCHEMA (idempotent)
-- Drops legacy tables (if present) and recreates canonical schema
-- IMPORTANT: this script is safe to re-run. It avoids errors by using IF EXISTS guards.

-- Drop legacy copies that might conflict
DROP TABLE IF EXISTS old_agendamentos CASCADE;
DROP TABLE IF EXISTS old_clientes CASCADE;
DROP TABLE IF EXISTS old_barbeiros CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Remove and recreate canonical tables to ensure schema is clean
DROP TABLE IF EXISTS agendamentos CASCADE;
DROP TABLE IF EXISTS servicos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS barbeiros CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- BARBEIROS (barbers)
CREATE TABLE IF NOT EXISTS barbeiros (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150),
  especialidade VARCHAR(255),
  foto TEXT,
  telefone VARCHAR(30),
  instagram VARCHAR(120),
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENTES (customers)
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  telefone VARCHAR(30),
  pontos_fidelidade INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICOS (services)
CREATE TABLE IF NOT EXISTS servicos (
  id TEXT PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  preco NUMERIC(10,2) NOT NULL,
  duracao INTEGER NOT NULL, -- minutes
  categoria TEXT,
  destaque BOOLEAN DEFAULT false
);

-- AGENDAMENTOS (bookings)
CREATE TABLE IF NOT EXISTS agendamentos (
  id BIGSERIAL PRIMARY KEY,
  barbeiro_id BIGINT NOT NULL REFERENCES barbeiros(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  servico TEXT NOT NULL REFERENCES servicos(id),
  data DATE NOT NULL,
  horario TIME NOT NULL,
  cliente_nome VARCHAR(150) NOT NULL,
  cliente_telefone VARCHAR(30) NOT NULL,
  cliente_email VARCHAR(150),
  status VARCHAR(20) DEFAULT 'confirmado' CHECK (status IN ('confirmado','cancelado','concluido','pendente')),
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barbeiro_id, data, horario)
);

-- ADMINS table linking to Supabase Auth users (create with or without FK depending on auth schema availability)
DO $$
BEGIN
  IF to_regclass('auth.users') IS NOT NULL THEN
    -- auth.users exists; create admins with FK to auth.users
    EXECUTE $$
      CREATE TABLE IF NOT EXISTS admins (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        role TEXT DEFAULT 'admin',
        criado_em TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
        UNIQUE(user_id)
      );
    $$;
  ELSE
    -- auth.users not present (e.g., plain Postgres); create admins without FK, to be linked later
    EXECUTE $$
      CREATE TABLE IF NOT EXISTS admins (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        role TEXT DEFAULT 'admin',
        criado_em TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
      );
    $$;
  END IF;
END
$$;

-- TIMESTAMP helper
CREATE OR REPLACE FUNCTION atualizar_timestamp() RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers idempotently
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_barbeiros' AND tgrelid = 'public.barbeiros'::regclass) THEN
    EXECUTE $create$
      CREATE TRIGGER trg_update_barbeiros BEFORE UPDATE ON barbeiros FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
    $create$;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_clientes' AND tgrelid = 'public.clientes'::regclass) THEN
    EXECUTE $create$
      CREATE TRIGGER trg_update_clientes BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
    $create$;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_agendamentos' AND tgrelid = 'public.agendamentos'::regclass) THEN
    EXECUTE $create$
      CREATE TRIGGER trg_update_agendamentos BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
    $create$;
  END IF;
END
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_barbeiro ON agendamentos(barbeiro_id);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);

-- Enable RLS safely (only if table exists)
DO $$
BEGIN
  IF to_regclass('public.barbeiros') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.barbeiros ENABLE ROW LEVEL SECURITY';
  END IF;
  IF to_regclass('public.clientes') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY';
  END IF;
  IF to_regclass('public.agendamentos') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY';
  END IF;
  IF to_regclass('public.admins') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY';
  END IF;
END
$$;

-- Policies (idempotent)
-- Public can read active barbers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'barbeiros_public' AND polrelid = 'public.barbeiros'::regclass) THEN
    EXECUTE $create$
      CREATE POLICY barbeiros_public ON barbeiros FOR SELECT USING (ativo = true);
    $create$;
  END IF;
END
$$;

-- Anyone can create bookings (insert), but updates/deletes restricted to admins
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'agendamentos_public_insert' AND polrelid = 'public.agendamentos'::regclass) THEN
    EXECUTE $create$
      CREATE POLICY agendamentos_public_insert ON agendamentos FOR INSERT WITH CHECK (true);
    $create$;
  END IF;
END
$$;

-- Admin-only modifications for agendamentos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'agendamentos_admin_update' AND polrelid = 'public.agendamentos'::regclass) THEN
    EXECUTE $create$
      CREATE POLICY agendamentos_admin_update ON agendamentos FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
      );
    $create$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'agendamentos_admin_delete' AND polrelid = 'public.agendamentos'::regclass) THEN
    EXECUTE $create$
      CREATE POLICY agendamentos_admin_delete ON agendamentos FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
      );
    $create$;
  END IF;
END
$$;

-- Admin-only write on barbeiros and servicos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'barbeiros_admin_mod' AND polrelid = 'public.barbeiros'::regclass) THEN
    EXECUTE $create$
      CREATE POLICY barbeiros_admin_mod ON barbeiros FOR INSERT, UPDATE, DELETE USING (
        EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
      );
    $create$;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'servicos_admin_mod' AND polrelid = 'public.servicos'::regclass) THEN
    EXECUTE $create$
      CREATE POLICY servicos_admin_mod ON servicos FOR INSERT, UPDATE, DELETE USING (
        EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
      );
    $create$;
  END IF;
END
$$;

-- View for convenience
CREATE OR REPLACE VIEW vw_agendamentos_completos AS
SELECT a.id, a.data, a.horario, a.servico, a.cliente_nome, a.cliente_telefone, a.cliente_email, a.status, a.observacoes, a.criado_em,
       b.nome as barbeiro_nome, b.foto as barbeiro_foto, b.especialidade as barbeiro_especialidade
FROM agendamentos a
JOIN barbeiros b ON a.barbeiro_id = b.id
ORDER BY a.data DESC, a.horario DESC;

-- Helper functions
CREATE OR REPLACE FUNCTION verificar_disponibilidade(p_barbeiro_id BIGINT, p_data DATE, p_horario TIME) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM agendamentos WHERE barbeiro_id = p_barbeiro_id AND data = p_data AND horario = p_horario AND status != 'cancelado'
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION listar_horarios_disponiveis(p_barbeiro_id BIGINT, p_data DATE) RETURNS TABLE(horario TIME) AS $$
BEGIN
  RETURN QUERY
  SELECT h.horario
  FROM generate_series('09:00'::TIME,'20:30'::TIME,'30 minutes'::interval) AS h(horario)
  WHERE NOT EXISTS (
    SELECT 1 FROM agendamentos a WHERE a.barbeiro_id = p_barbeiro_id AND a.data = p_data AND a.horario = h.horario AND a.status != 'cancelado'
  )
  ORDER BY h.horario;
END;
$$ LANGUAGE plpgsql;

-- Validation trigger for agendamentos (idempotent create)
CREATE OR REPLACE FUNCTION validar_agendamento() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.data < CURRENT_DATE THEN
    RAISE EXCEPTION 'Não é possível agendar para datas passadas';
  END IF;
  IF NEW.horario < '09:00'::TIME OR NEW.horario > '21:00'::TIME THEN
    RAISE EXCEPTION 'Horário fora do expediente (09:00 - 21:00)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM barbeiros WHERE id = NEW.barbeiro_id AND ativo = true) THEN
    RAISE EXCEPTION 'Barbeiro não encontrado ou inativo';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_validar_agendamento' AND tgrelid = 'public.agendamentos'::regclass) THEN
    EXECUTE $create$
      CREATE TRIGGER trigger_validar_agendamento BEFORE INSERT OR UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION validar_agendamento();
    $create$;
  END IF;
END
$$;

-- End of schema

