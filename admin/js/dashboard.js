// ==================== DASHBOARD ====================
let supabaseClient = null;
let currentUser = null;
let chartInstance = null;

// Verificar autenticação ao carregar
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se está autenticado
    currentUser = checkAuth();
    
    if (!currentUser) {
        return;
    }
    
    // Exibir nome do usuário
    document.getElementById('user-name').textContent = currentUser.barbeiro.nome;
    document.getElementById('welcome-name').textContent = currentUser.barbeiro.nome.split(' ')[0];
    
    // Inicializar Supabase
    initSupabaseDashboard();
    
    // Carregar dados do dashboard
    await carregarDadosDashboard();
    
    // Inicializar sidebar toggle
    initSidebar();
});

function initSupabaseDashboard() {
    try {
        if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
            if (!SUPABASE_CONFIG.url.includes('SEU_PROJETO')) {
                supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
                console.log('✅ Supabase conectado');
            }
        }
    } catch (error) {
        console.error('Erro ao conectar Supabase:', error);
    }
}

// ==================== CARREGAR DADOS ====================
async function carregarDadosDashboard() {
    try {
        // Carregar estatísticas
        await carregarEstatisticas();
        
        // Carregar agendamentos de hoje
        await carregarAgendamentosHoje();
        
        // Carregar serviços populares
        await carregarServicosPopulares();
        
        // Carregar atividade recente
        await carregarAtividadeRecente();
        
        // Inicializar gráfico
        inicializarGrafico();
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

// Carregar estatísticas
async function carregarEstatisticas() {
    const hoje = new Date().toISOString().split('T')[0];
    const inicioSemana = getInicioSemana();
    const inicioMes = getInicioMes();
    
    if (!supabaseClient) {
        // Dados de exemplo
        document.getElementById('stat-hoje').textContent = '8';
        document.getElementById('stat-semana').textContent = '45';
        document.getElementById('stat-faturamento').textContent = 'R$ 4.250';
        document.getElementById('stat-clientes').textContent = '23';
        return;
    }
    
    try {
        // Agendamentos de hoje
        const { count: hojeCount } = await supabaseClient
            .from('agendamentos')
            .select('*', { count: 'exact', head: true })
            .eq('data', hoje)
            .eq('status', 'confirmado');
        
        document.getElementById('stat-hoje').textContent = hojeCount || 0;
        
        // Agendamentos da semana
        const { count: semanaCount } = await supabaseClient
            .from('agendamentos')
            .select('*', { count: 'exact', head: true })
            .gte('data', inicioSemana)
            .eq('status', 'confirmado');
        
        document.getElementById('stat-semana').textContent = semanaCount || 0;
        
        // Faturamento do mês (cálculo simples)
        const { data: agendamentosMes } = await supabaseClient
            .from('agendamentos')
            .select('servico')
            .gte('data', inicioMes)
            .eq('status', 'concluido');
        
        let faturamento = 0;
        agendamentosMes?.forEach(ag => {
            // Preços médios (pode ser melhorado buscando da tabela de serviços)
            const precos = {
                'Corte com Tesoura': 40,
                'Corte Masculino': 45,
                'Barba': 30,
                'Combo Completo': 70,
                'Corte Infantil': 35,
                'Pigmentação': 50
            };
            faturamento += precos[ag.servico] || 40;
        });
        
        document.getElementById('stat-faturamento').textContent = 
            `R$ ${faturamento.toLocaleString('pt-BR')}`;
        
        // Novos clientes (clientes únicos do mês)
        const { data: clientesMes } = await supabaseClient
            .from('agendamentos')
            .select('cliente_telefone')
            .gte('data', inicioMes);
        
        const clientesUnicos = new Set(clientesMes?.map(c => c.cliente_telefone)).size;
        document.getElementById('stat-clientes').textContent = clientesUnicos || 0;
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Carregar agendamentos de hoje
async function carregarAgendamentosHoje() {
    const hoje = new Date().toISOString().split('T')[0];
    const container = document.getElementById('agendamentos-hoje');
    
    if (!supabaseClient) {
        // Dados de exemplo
        container.innerHTML = `
            <div class="timeline-item">
                <div class="timeline-time">
                    <span class="time">09:00</span>
                </div>
                <div class="timeline-content">
                    <h4>João Silva</h4>
                    <p>Corte Masculino</p>
                </div>
                <span class="timeline-status confirmed">Confirmado</span>
            </div>
            <div class="timeline-item">
                <div class="timeline-time">
                    <span class="time">10:30</span>
                </div>
                <div class="timeline-content">
                    <h4>Pedro Santos</h4>
                    <p>Barba + Corte</p>
                </div>
                <span class="timeline-status confirmed">Confirmado</span>
            </div>
            <div class="timeline-item">
                <div class="timeline-time">
                    <span class="time">14:00</span>
                </div>
                <div class="timeline-content">
                    <h4>Carlos Oliveira</h4>
                    <p>Corte com Tesoura</p>
                </div>
                <span class="timeline-status pending">Pendente</span>
            </div>
        `;
        return;
    }
    
    try {
        const { data: agendamentos } = await supabaseClient
            .from('agendamentos')
            .select(`
                *,
                barbeiros (nome)
            `)
            .eq('data', hoje)
            .order('horario', { ascending: true })
            .limit(5);
        
        if (!agendamentos || agendamentos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <p>Nenhum agendamento para hoje</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = agendamentos.map(ag => `
            <div class="timeline-item">
                <div class="timeline-time">
                    <span class="time">${ag.horario.substring(0, 5)}</span>
                </div>
                <div class="timeline-content">
                    <h4>${ag.cliente_nome}</h4>
                    <p>${ag.servico} • ${ag.barbeiros?.nome || 'N/A'}</p>
                </div>
                <span class="timeline-status ${ag.status}">${getStatusLabel(ag.status)}</span>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
    }
}

// Carregar serviços populares
async function carregarServicosPopulares() {
    const container = document.getElementById('servicos-populares');
    
    if (!supabaseClient) {
        // Dados de exemplo
        container.innerHTML = `
            <div class="service-item">
                <div class="service-info">
                    <div class="service-icon">
                        <i class="fas fa-cut"></i>
                    </div>
                    <div class="service-details">
                        <h4>Corte Masculino</h4>
                        <p>Serviço mais popular</p>
                    </div>
                </div>
                <div class="service-stats">
                    <span class="service-count">127</span>
                    <span class="service-label">este mês</span>
                </div>
            </div>
            <div class="service-item">
                <div class="service-info">
                    <div class="service-icon">
                        <i class="fas fa-scissors"></i>
                    </div>
                    <div class="service-details">
                        <h4>Combo Completo</h4>
                        <p>Alto faturamento</p>
                    </div>
                </div>
                <div class="service-stats">
                    <span class="service-count">89</span>
                    <span class="service-label">este mês</span>
                </div>
            </div>
            <div class="service-item">
                <div class="service-info">
                    <div class="service-icon">
                        <i class="fas fa-razor"></i>
                    </div>
                    <div class="service-details">
                        <h4>Barba</h4>
                        <p>Crescimento de 15%</p>
                    </div>
                </div>
                <div class="service-stats">
                    <span class="service-count">64</span>
                    <span class="service-label">este mês</span>
                </div>
            </div>
        `;
        return;
    }
    
    try {
        const inicioMes = getInicioMes();
        
        const { data: servicos } = await supabaseClient
            .from('agendamentos')
            .select('servico')
            .gte('data', inicioMes);
        
        // Contar serviços
        const contador = {};
        servicos?.forEach(ag => {
            contador[ag.servico] = (contador[ag.servico] || 0) + 1;
        });
        
        // Ordenar por popularidade
        const servicosOrdenados = Object.entries(contador)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        if (servicosOrdenados.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-cut"></i>
                    <p>Nenhum serviço registrado este mês</p>
                </div>
            `;
            return;
        }
        
        const icons = {
            'Corte Masculino': 'fa-cut',
            'Combo Completo': 'fa-scissors',
            'Barba': 'fa-razor',
            'Corte com Tesoura': 'fa-cut',
            'Corte Infantil': 'fa-child',
            'Pigmentação': 'fa-paint-brush'
        };
        
        container.innerHTML = servicosOrdenados.map(([nome, count]) => `
            <div class="service-item">
                <div class="service-info">
                    <div class="service-icon">
                        <i class="fas ${icons[nome] || 'fa-cut'}"></i>
                    </div>
                    <div class="service-details">
                        <h4>${nome}</h4>
                        <p>${count > 50 ? 'Muito popular' : 'Popular'}</p>
                    </div>
                </div>
                <div class="service-stats">
                    <span class="service-count">${count}</span>
                    <span class="service-label">este mês</span>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
    }
}

// Carregar atividade recente
async function carregarAtividadeRecente() {
    const container = document.getElementById('atividade-recente');
    
    // Dados de exemplo (sempre mostrar algo)
    container.innerHTML = `
        <div class="activity-item">
            <div class="activity-icon new">
                <i class="fas fa-plus"></i>
            </div>
            <div class="activity-content">
                <p><strong>Novo agendamento</strong> de João Silva</p>
                <span class="activity-time">Há 5 minutos</span>
            </div>
        </div>
        <div class="activity-item">
            <div class="activity-icon update">
                <i class="fas fa-check"></i>
            </div>
            <div class="activity-content">
                <p><strong>Serviço concluído</strong> para Pedro Santos</p>
                <span class="activity-time">Há 1 hora</span>
            </div>
        </div>
        <div class="activity-item">
            <div class="activity-icon new">
                <i class="fas fa-user-plus"></i>
            </div>
            <div class="activity-content">
                <p><strong>Novo cliente</strong> Carlos Oliveira</p>
                <span class="activity-time">Há 2 horas</span>
            </div>
        </div>
    `;
}

// Inicializar gráfico
function inicializarGrafico() {
    const ctx = document.getElementById('agendamentos-chart');
    if (!ctx) return;
    
    const data = {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        datasets: [{
            label: 'Agendamentos',
            data: [12, 19, 15, 25, 22, 30, 8],
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            borderColor: 'rgba(255, 107, 53, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#fff',
            pointBorderColor: 'rgba(255, 107, 53, 1)',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    };
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// ==================== SIDEBAR ====================
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
    
    // Fechar sidebar ao clicar fora (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 968) {
            if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// ==================== HELPERS ====================
function getStatusLabel(status) {
    const labels = {
        'confirmado': 'Confirmado',
        'pendente': 'Pendente',
        'concluido': 'Concluído',
        'cancelado': 'Cancelado'
    };
    return labels[status] || status;
}

function getInicioSemana() {
    const hoje = new Date();
    const dia = hoje.getDay();
    const diff = hoje.getDate() - dia + (dia === 0 ? -6 : 1);
    const segunda = new Date(hoje.setDate(diff));
    return segunda.toISOString().split('T')[0];
}

function getInicioMes() {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
}
