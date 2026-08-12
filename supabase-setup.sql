-- ==================== BARBER SERRA - CONFIGURAÇÃO DO BANCO DE DADOS ====================
-- Execute este script no SQL Editor do Supabase para criar as tabelas necessárias

-- ==================== TABELA DE BARBEIROS ====================
CREATE TABLE IF NOT EXISTS barbeiros (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    especialidade VARCHAR(200),
    foto TEXT,
    telefone VARCHAR(20),
    instagram VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários na tabela
COMMENT ON TABLE barbeiros IS 'Cadastro dos barbeiros da barbearia';
COMMENT ON COLUMN barbeiros.ordem IS 'Ordem de exibição no site (menor valor aparece primeiro)';

-- ==================== TABELA DE CLIENTES ====================
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    pontos_fidelidade INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE clientes IS 'Cadastro de clientes da barbearia';

-- Índice para busca rápida
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_telefone ON clientes(telefone);

-- ==================== TABELA DE AGENDAMENTOS ====================
CREATE TABLE IF NOT EXISTS agendamentos (
    id BIGSERIAL PRIMARY KEY,
    barbeiro_id BIGINT NOT NULL REFERENCES barbeiros(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    servico VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    cliente_nome VARCHAR(100) NOT NULL,
    cliente_telefone VARCHAR(20) NOT NULL,
    cliente_email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'cancelado', 'concluido', 'pendente')),
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar agendamentos duplicados no mesmo horário
    UNIQUE(barbeiro_id, data, horario)
);

-- Comentários na tabela
COMMENT ON TABLE agendamentos IS 'Registro de todos os agendamentos realizados';
COMMENT ON COLUMN agendamentos.status IS 'Status do agendamento: confirmado, cancelado, concluido ou pendente';

-- Índices para melhor performance
CREATE INDEX idx_agendamentos_barbeiro ON agendamentos(barbeiro_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data);
CREATE INDEX idx_agendamentos_telefone ON agendamentos(cliente_telefone);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);

-- ==================== FUNÇÃO PARA ATUALIZAR TIMESTAMP ====================
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar automaticamente
CREATE TRIGGER trigger_atualizar_barbeiros
    BEFORE UPDATE ON barbeiros
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_agendamentos
    BEFORE UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

-- ==================== DADOS INICIAIS ====================
-- Inserir barbeiros de exemplo
INSERT INTO barbeiros (nome, especialidade, foto, ordem, ativo) VALUES
('Mateus Rabelo', 'Especialista em Cortes Modernos', 'images/barber-1.svg', 1, true),
('Caio Martins', 'Design de Barba e Estilo', 'images/barber-2.svg', 2, true),
('Bruno Costa', 'Cortes Clássicos e Tradicionais', 'images/barber-3.svg', 3, true)
ON CONFLICT DO NOTHING;

-- ==================== POLÍTICAS RLS (Row Level Security) ====================
-- Habilitar RLS nas tabelas
ALTER TABLE barbeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública dos barbeiros
CREATE POLICY "Barbeiros visíveis publicamente"
    ON barbeiros FOR SELECT
    USING (ativo = true);

-- Política para leitura de agendamentos (apenas autenticados podem ver todos)
CREATE POLICY "Agendamentos visíveis publicamente"
    ON agendamentos FOR SELECT
    USING (true);

-- Política para inserção de agendamentos (público pode criar)
CREATE POLICY "Qualquer um pode criar agendamentos"
    ON agendamentos FOR INSERT
    WITH CHECK (true);

-- Política para atualização de agendamentos (apenas autenticados)
CREATE POLICY "Apenas autenticados podem atualizar agendamentos"
    ON agendamentos FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ==================== VIEWS ÚTEIS ====================
-- View para agendamentos com informações do barbeiro
CREATE OR REPLACE VIEW vw_agendamentos_completos AS
SELECT 
    a.id,
    a.data,
    a.horario,
    a.servico,
    a.cliente_nome,
    a.cliente_telefone,
    a.cliente_email,
    a.status,
    a.observacoes,
    a.criado_em,
    b.nome as barbeiro_nome,
    b.foto as barbeiro_foto,
    b.especialidade as barbeiro_especialidade
FROM agendamentos a
INNER JOIN barbeiros b ON a.barbeiro_id = b.id
ORDER BY a.data DESC, a.horario DESC;

-- View para estatísticas diárias
CREATE OR REPLACE VIEW vw_estatisticas_diarias AS
SELECT 
    data,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN status = 'confirmado' THEN 1 END) as confirmados,
    COUNT(CASE WHEN status = 'concluido' THEN 1 END) as concluidos,
    COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelados
FROM agendamentos
GROUP BY data
ORDER BY data DESC;

-- ==================== FUNÇÃO PARA VERIFICAR DISPONIBILIDADE ====================
CREATE OR REPLACE FUNCTION verificar_disponibilidade(
    p_barbeiro_id BIGINT,
    p_data DATE,
    p_horario TIME
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 
        FROM agendamentos 
        WHERE barbeiro_id = p_barbeiro_id 
        AND data = p_data 
        AND horario = p_horario
        AND status != 'cancelado'
    );
END;
$$ LANGUAGE plpgsql;

-- ==================== FUNÇÃO PARA LISTAR HORÁRIOS DISPONÍVEIS ====================
CREATE OR REPLACE FUNCTION listar_horarios_disponiveis(
    p_barbeiro_id BIGINT,
    p_data DATE
)
RETURNS TABLE(horario TIME) AS $$
BEGIN
    RETURN QUERY
    SELECT h.horario
    FROM generate_series(
        '09:00'::TIME,
        '20:30'::TIME,
        '30 minutes'::INTERVAL
    ) AS h(horario)
    WHERE NOT EXISTS (
        SELECT 1
        FROM agendamentos a
        WHERE a.barbeiro_id = p_barbeiro_id
        AND a.data = p_data
        AND a.horario = h.horario
        AND a.status != 'cancelado'
    )
    ORDER BY h.horario;
END;
$$ LANGUAGE plpgsql;

-- ==================== TRIGGER PARA VALIDAÇÃO DE AGENDAMENTO ====================
CREATE OR REPLACE FUNCTION validar_agendamento()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se a data não é no passado
    IF NEW.data < CURRENT_DATE THEN
        RAISE EXCEPTION 'Não é possível agendar para datas passadas';
    END IF;
    
    -- Verificar se o horário está dentro do funcionamento
    IF NEW.horario < '09:00'::TIME OR NEW.horario > '21:00'::TIME THEN
        RAISE EXCEPTION 'Horário fora do expediente (09:00 - 21:00)';
    END IF;
    
    -- Verificar se o barbeiro existe e está ativo
    IF NOT EXISTS (SELECT 1 FROM barbeiros WHERE id = NEW.barbeiro_id AND ativo = true) THEN
        RAISE EXCEPTION 'Barbeiro não encontrado ou inativo';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_agendamento
    BEFORE INSERT OR UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION validar_agendamento();

-- ==================== CONFIGURAÇÃO CONCLUÍDA ====================
-- Para verificar se tudo foi criado corretamente, execute:
-- SELECT * FROM barbeiros;
-- SELECT * FROM agendamentos;
