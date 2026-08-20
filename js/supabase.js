// ==========================================================================
// BARBER SERRA — CAMADA DE DADOS (SUPABASE + OFFLINE REPOSITORY RESILIENTE)
// ==========================================================================

let supabaseClient = null;

// Inicialização do cliente Supabase
function initSupabase() {
    try {
        if (typeof supabase !== 'undefined' && SUPABASE_CONFIG?.url && SUPABASE_CONFIG?.anonKey) {
            if (!SUPABASE_CONFIG.url.includes('SEU_PROJETO')) {
                supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
                console.log('✅ Supabase conectado');
                return supabaseClient;
            }
        }
    } catch (error) {
        console.warn('⚠️ Supabase offline ou em modo simulação local:', error);
    }
    return null;
}

// Repositório LocalStorage para funcionamento 100% autônomo e offline
const LocalRepo = {
    getStorageKey(table) {
        return `barber_serra_${table}`;
    },

    getData(table, defaultData = []) {
        const raw = localStorage.getItem(this.getStorageKey(table));
        if (!raw) {
            this.setData(table, defaultData);
            return defaultData;
        }
        try {
            return JSON.parse(raw);
        } catch {
            return defaultData;
        }
    },

    setData(table, data) {
        localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
    },

    initSeeds() {
        // Seed inicial de agendamentos se não existirem
        const agendamentos = this.getData('agendamentos', null);
        if (!agendamentos) {
            const hoje = new Date().toISOString().split('T')[0];
            const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            
            const seed = [
                {
                    id: 101,
                    barbeiro_id: 1,
                    barbeiro_nome: 'Mateus Rabelo',
                    servico_id: 'corte-degrade',
                    servico_nome: 'Corte Degradê / Fade',
                    preco: 40,
                    duracao: 45,
                    data: hoje,
                    horario: '10:00',
                    cliente_nome: 'Gabriel Santos',
                    cliente_telefone: '(48) 98813-9261',
                    cliente_email: 'gabriel@exemplo.com',
                    status: 'confirmado',
                    criado_em: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: 102,
                    barbeiro_id: 2,
                    barbeiro_nome: 'Caio Martins',
                    servico_id: 'barba-ozonio',
                    servico_nome: 'Barboterapia com Vapor de Ozônio',
                    preco: 50,
                    duracao: 40,
                    data: hoje,
                    horario: '14:30',
                    cliente_nome: 'Lucas Mendes',
                    cliente_telefone: '(48) 99123-4567',
                    cliente_email: 'lucas@exemplo.com',
                    status: 'confirmado',
                    criado_em: new Date(Date.now() - 7200000).toISOString()
                },
                {
                    id: 103,
                    barbeiro_id: 1,
                    barbeiro_nome: 'Mateus Rabelo',
                    servico_id: 'combo-premium',
                    servico_nome: 'Combo Vip (Navalhado + Barboterapia Ozônio)',
                    preco: 95,
                    duracao: 90,
                    data: hoje,
                    horario: '16:00',
                    cliente_nome: 'Rodrigo Alves',
                    cliente_telefone: '(48) 98456-7890',
                    cliente_email: 'rodrigo@exemplo.com',
                    status: 'concluido',
                    criado_em: new Date(Date.now() - 14400000).toISOString()
                },
                {
                    id: 104,
                    barbeiro_id: 3,
                    barbeiro_nome: 'Bruno Costa',
                    servico_id: 'navalhado-tesoura',
                    servico_nome: 'Corte Tesoura ou Navalhado',
                    preco: 45,
                    duracao: 50,
                    data: amanha,
                    horario: '11:00',
                    cliente_nome: 'Fernando Silveira',
                    cliente_telefone: '(48) 99876-5432',
                    cliente_email: 'fernando@exemplo.com',
                    status: 'confirmado',
                    criado_em: new Date().toISOString()
                }
            ];
            this.setData('agendamentos', seed);
        }

        // Seed de clientes
        const clientes = this.getData('clientes', null);
        if (!clientes) {
            const seedClientes = [
                {
                    id: 'cli-1',
                    nome: 'Gabriel Santos',
                    email: 'gabriel@exemplo.com',
                    telefone: '(48) 98813-9261',
                    pontos: 180,
                    total_visitas: 12,
                    total_gasto: 520.00,
                    ultima_visita: 'Hoje',
                    status: 'ativo'
                },
                {
                    id: 'cli-2',
                    nome: 'Lucas Mendes',
                    email: 'lucas@exemplo.com',
                    telefone: '(48) 99123-4567',
                    pontos: 95,
                    total_visitas: 6,
                    total_gasto: 275.00,
                    ultima_visita: 'Hoje',
                    status: 'ativo'
                },
                {
                    id: 'cli-3',
                    nome: 'Rodrigo Alves',
                    email: 'rodrigo@exemplo.com',
                    telefone: '(48) 98456-7890',
                    pontos: 320,
                    total_visitas: 18,
                    total_gasto: 1140.00,
                    ultima_visita: 'Hoje',
                    status: 'ativo'
                },
                {
                    id: 'cli-4',
                    nome: 'Fernando Silveira',
                    email: 'fernando@exemplo.com',
                    telefone: '(48) 99876-5432',
                    pontos: 45,
                    total_visitas: 3,
                    total_gasto: 135.00,
                    ultima_visita: '15/08/2026',
                    status: 'ativo'
                }
            ];
            this.setData('clientes', seedClientes);
        }
    }
};

// Inicializa seeds
LocalRepo.initSeeds();

// ==================== OPERAÇÕES DE DADOS ====================

// Carregar Barbeiros
async function carregarBarbeiros() {
    if (!supabaseClient) {
        return BARBEIROS;
    }
    try {
        const { data, error } = await supabaseClient
            .from('barbeiros')
            .select('*')
            .eq('ativo', true)
            .order('ordem');

        if (error) throw error;
        if (data && data.length > 0) {
            BARBEIROS = data;
        }
        return BARBEIROS;
    } catch (error) {
        console.warn('Usando barbeiros locais:', error.message);
        return BARBEIROS;
    }
}

// Carregar Serviços
async function carregarServicos() {
    if (!supabaseClient) {
        return SERVICOS;
    }
    try {
        const { data, error } = await supabaseClient
            .from('servicos')
            .select('*');

        if (error) throw error;
        if (data && data.length > 0) {
            return data;
        }
        return SERVICOS;
    } catch (error) {
        return SERVICOS;
    }
}

// Gerar Horários Padrão baseado no dia da semana
function gerarHorariosPadrao(dataString) {
    if (!dataString) return [];
    const data = new Date(dataString + 'T12:00:00');
    const diaSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][data.getDay()];
    
    const config = HORARIOS_FUNCIONAMENTO[diaSemana];
    if (!config || config.fechado) {
        return [];
    }

    const horarios = [];
    const [horaInicio, minutoInicio] = config.inicio.split(':').map(Number);
    const [horaFim, minutoFim] = config.fim.split(':').map(Number);
    
    let horaAtual = horaInicio * 60 + minutoInicio;
    const horaFimMinutos = horaFim * 60 + minutoFim;
    
    while (horaAtual < horaFimMinutos) {
        const horas = Math.floor(horaAtual / 60);
        const minutos = horaAtual % 60;
        horarios.push(`${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`);
        horaAtual += config.intervalo;
    }
    
    return horarios;
}

// Carregar horários disponíveis
async function carregarHorariosDisponiveis(barbeiroId, data) {
    const todosHorarios = gerarHorariosPadrao(data);
    if (!todosHorarios.length) return [];

    let horariosOcupados = [];

    if (supabaseClient) {
        try {
            const { data: agendamentos, error } = await supabaseClient
                .from('agendamentos')
                .select('horario')
                .eq('barbeiro_id', barbeiroId)
                .eq('data', data)
                .in('status', ['confirmado', 'pendente']);

            if (!error && agendamentos) {
                horariosOcupados = agendamentos.map(a => a.horario.substring(0, 5));
            }
        } catch (e) {
            console.warn('Erro ao consultar Supabase, checando repositório local:', e);
        }
    }

    // Mesclar com agendamentos locais
    const agendamentosLocais = LocalRepo.getData('agendamentos', []);
    const ocupadosLocais = agendamentosLocais
        .filter(a => String(a.barbeiro_id) === String(barbeiroId) && a.data === data && a.status !== 'cancelado')
        .map(a => a.horario.substring(0, 5));

    horariosOcupados = Array.from(new Set([...horariosOcupados, ...ocupadosLocais]));

    return todosHorarios.filter(h => !horariosOcupados.includes(h));
}

// Criar novo agendamento
async function criarAgendamento(dados) {
    const novoAgendamento = {
        id: Date.now(),
        barbeiro_id: dados.barbeiroId || dados.barbeiro?.id,
        barbeiro_nome: dados.barbeiro?.nome || 'Barbeiro Especialista',
        servico_id: dados.servico?.id || 'corte-degrade',
        servico_nome: dados.servico?.nome || 'Serviço Barbearia',
        preco: Number(dados.servico?.preco) || 40,
        duracao: Number(dados.servico?.duracao) || 45,
        data: dados.data,
        horario: dados.horario,
        cliente_nome: dados.nome,
        cliente_telefone: dados.telefone,
        cliente_email: dados.email || '',
        status: 'confirmado',
        criado_em: new Date().toISOString()
    };

    // Salvar localmente garantindo persistência imediata
    const agendamentos = LocalRepo.getData('agendamentos', []);
    agendamentos.unshift(novoAgendamento);
    LocalRepo.setData('agendamentos', agendamentos);

    // Atualizar lista de clientes locais
    const clientes = LocalRepo.getData('clientes', []);
    const clienteExistente = clientes.find(c => c.telefone === dados.telefone || (dados.email && c.email === dados.email));
    if (clienteExistente) {
        clienteExistente.total_visitas = (clienteExistente.total_visitas || 0) + 1;
        clienteExistente.total_gasto = (clienteExistente.total_gasto || 0) + novoAgendamento.preco;
        clienteExistente.ultima_visita = 'Hoje';
        clienteExistente.pontos = (clienteExistente.pontos || 0) + Math.floor(novoAgendamento.preco / 2);
    } else {
        clientes.push({
            id: 'cli-' + Date.now(),
            nome: dados.nome,
            telefone: dados.telefone,
            email: dados.email || '',
            pontos: Math.floor(novoAgendamento.preco / 2),
            total_visitas: 1,
            total_gasto: novoAgendamento.preco,
            ultima_visita: 'Hoje',
            status: 'ativo'
        });
    }
    LocalRepo.setData('clientes', clientes);

    // Se o Supabase estiver conectado, salvar no banco
    if (supabaseClient) {
        try {
            await supabaseClient.from('agendamentos').insert([{
                barbeiro_id: novoAgendamento.barbeiro_id,
                servico: novoAgendamento.servico_id,
                data: novoAgendamento.data,
                horario: novoAgendamento.horario,
                cliente_nome: novoAgendamento.cliente_nome,
                cliente_telefone: novoAgendamento.cliente_telefone,
                cliente_email: novoAgendamento.cliente_email,
                status: 'confirmado'
            }]);
        } catch (err) {
            console.warn('Erro ao sincronizar com Supabase:', err);
        }
    }

    return { success: true, data: novoAgendamento, message: 'Agendamento confirmado com sucesso!' };
}

// Buscar agendamentos do cliente
async function buscarAgendamentosCliente(telefone) {
    const cleanPhone = (telefone || '').replace(/\D/g, '');
    const todos = LocalRepo.getData('agendamentos', []);
    
    const filtrados = todos.filter(a => {
        const phone = (a.cliente_telefone || '').replace(/\D/g, '');
        return phone === cleanPhone || phone.includes(cleanPhone) || cleanPhone.includes(phone);
    });

    return { success: true, data: filtrados };
}

// Cancelar agendamento
async function cancelarAgendamento(agendamentoId) {
    const agendamentos = LocalRepo.getData('agendamentos', []);
    const index = agendamentos.findIndex(a => String(a.id) === String(agendamentoId));
    if (index !== -1) {
        agendamentos[index].status = 'cancelado';
        LocalRepo.setData('agendamentos', agendamentos);
    }

    if (supabaseClient) {
        try {
            await supabaseClient
                .from('agendamentos')
                .update({ status: 'cancelado' })
                .eq('id', agendamentoId);
        } catch (e) {
            console.warn('Erro ao cancelar no Supabase:', e);
        }
    }

    return { success: true, message: 'Agendamento cancelado com sucesso.' };
}

// Buscar todos os agendamentos (para o Admin)
async function obterTodosAgendamentos() {
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('vw_agendamentos_completos')
                .select('*');
            if (!error && data && data.length > 0) {
                return data;
            }
        } catch (e) {
            console.warn('Erro ao carregar do Supabase:', e);
        }
    }
    return LocalRepo.getData('agendamentos', []);
}

// Atualizar status no Admin
async function atualizarStatusAgendamento(id, novoStatus) {
    const agendamentos = LocalRepo.getData('agendamentos', []);
    const item = agendamentos.find(a => String(a.id) === String(id));
    if (item) {
        item.status = novoStatus;
        LocalRepo.setData('agendamentos', agendamentos);
    }

    if (supabaseClient) {
        try {
            await supabaseClient
                .from('agendamentos')
                .update({ status: novoStatus })
                .eq('id', id);
        } catch (e) {
            console.warn('Erro ao atualizar status no Supabase:', e);
        }
    }

    return { success: true, message: 'Status atualizado!' };
}

// Inicializar ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
});
