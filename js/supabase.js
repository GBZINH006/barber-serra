// Inicialização do cliente Supabase
let supabaseClient = null;

// Inicializar Supabase
function initSupabase() {
    try {
        if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
            // Verifica se não são as credenciais de exemplo
            if (SUPABASE_CONFIG.url.includes('SEU_PROJETO')) {
                console.warn('⚠️ Configure suas credenciais do Supabase em js/config.js');
                return null;
            }
            
            supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            console.log('✅ Supabase inicializado com sucesso');
            return supabaseClient;
        } else {
            console.warn('⚠️ Supabase não está configurado');
            return null;
        }
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
        return null;
    }
}

// Carregar barbeiros do banco de dados
async function carregarBarbeiros() {
    if (!supabaseClient) {
        console.log('Usando barbeiros padrão (Supabase não configurado)');
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
            console.log('✅ Barbeiros carregados do banco:', data.length);
        }
        
        return BARBEIROS;
    } catch (error) {
        console.error('Erro ao carregar barbeiros:', error);
        return BARBEIROS;
    }
}

// Carregar horários disponíveis
async function carregarHorariosDisponiveis(barbeiroId, data) {
    if (!supabaseClient) {
        // Modo offline: gera horários fictícios
        return gerarHorariosPadrao(data);
    }

    try {
        const { data: agendamentos, error } = await supabaseClient
            .from('agendamentos')
            .select('horario')
            .eq('barbeiro_id', barbeiroId)
            .eq('data', data)
            .eq('status', 'confirmado');

        if (error) throw error;

        const horariosOcupados = agendamentos.map(a => a.horario);
        const todosHorarios = gerarHorariosPadrao(data);
        
        return todosHorarios.filter(h => !horariosOcupados.includes(h));
    } catch (error) {
        console.error('Erro ao carregar horários:', error);
        return gerarHorariosPadrao(data);
    }
}

// Gerar horários padrão baseado no dia da semana
function gerarHorariosPadrao(dataString) {
    const data = new Date(dataString + 'T12:00:00');
    const diaSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][data.getDay()];
    
    const config = HORARIOS_FUNCIONAMENTO[diaSemana];
    
    if (config.fechado) {
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

// Criar novo agendamento
async function criarAgendamento(dadosAgendamento) {
    if (!supabaseClient) {
        // Modo offline: simula sucesso
        console.log('📅 Agendamento simulado (modo offline):', dadosAgendamento);
        return { 
            success: true, 
            data: { id: Date.now(), ...dadosAgendamento },
            message: 'Agendamento criado (modo offline)'
        };
    }

    try {
        const agendamento = {
            barbeiro_id: dadosAgendamento.barbeiroId,
            servico: dadosAgendamento.servico,
            data: dadosAgendamento.data,
            horario: dadosAgendamento.horario,
            cliente_nome: dadosAgendamento.nome,
            cliente_telefone: dadosAgendamento.telefone,
            cliente_email: dadosAgendamento.email || null,
            status: 'confirmado',
            criado_em: new Date().toISOString()
        };

        const { data, error } = await supabaseClient
            .from('agendamentos')
            .insert([agendamento])
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Agendamento criado com sucesso:', data);
        
        // Tentar enviar notificação via WhatsApp (se configurado)
        await enviarNotificacaoWhatsApp(dadosAgendamento);
        
        return { success: true, data, message: 'Agendamento criado com sucesso!' };
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        return { success: false, error: error.message };
    }
}

// Enviar notificação via WhatsApp (integração futura)
async function enviarNotificacaoWhatsApp(dados) {
    // Esta função pode ser expandida para integrar com API do WhatsApp Business
    console.log('📱 Notificação WhatsApp preparada para:', dados.telefone);
    return true;
}

// Buscar agendamentos por telefone (para cliente verificar seus agendamentos)
async function buscarAgendamentosCliente(telefone) {
    if (!supabaseClient) {
        return { success: false, message: 'Supabase não configurado' };
    }

    try {
        const { data, error } = await supabaseClient
            .from('agendamentos')
            .select(`
                *,
                barbeiros (nome, foto)
            `)
            .eq('cliente_telefone', telefone)
            .gte('data', new Date().toISOString().split('T')[0])
            .order('data', { ascending: true })
            .order('horario', { ascending: true });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return { success: false, error: error.message };
    }
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
});
