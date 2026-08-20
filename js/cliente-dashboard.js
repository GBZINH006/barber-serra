/**
 * BARBER SERRA — CLIENT DASHBOARD, APPOINTMENTS & PROFILE CONTROLLER
 */

let currentClientSession = null;
let clientAppointments = [];
let appointmentToCancelId = null;

document.addEventListener('DOMContentLoaded', async () => {
    checkClientAuth();
    initProfileDropdownEvents();
    
    // Check which page we are on
    if (document.getElementById('next-appointment-box')) {
        await carregarDadosClienteDashboard();
    }
    if (document.getElementById('client-all-appointments-body')) {
        await carregarPaginaAgendamentos();
    }
    if (document.getElementById('client-profile-form')) {
        carregarDadosPerfil();
    }
});

/* ==========================================================================
   AUTH & SESSION
   ========================================================================== */

function checkClientAuth() {
    const raw = localStorage.getItem('cliente_session') || sessionStorage.getItem('cliente_session');
    if (!raw) {
        window.location.href = 'cliente-login.html';
        return;
    }

    try {
        currentClientSession = JSON.parse(raw);
        atualizarCabecalhoUsuario();
    } catch {
        localStorage.removeItem('cliente_session');
        window.location.href = 'cliente-login.html';
    }
}

function atualizarCabecalhoUsuario() {
    if (!currentClientSession || !currentClientSession.cliente) return;
    const cli = currentClientSession.cliente;
    const firstName = cli.nome.split(' ')[0];

    const topName = document.getElementById('client-name-top');
    if (topName) topName.textContent = firstName;

    const topAvatar = document.getElementById('client-avatar-top');
    if (topAvatar && cli.foto) topAvatar.src = cli.foto;

    const greetingName = document.getElementById('client-first-name');
    if (greetingName) greetingName.textContent = firstName;
}

function logoutCliente() {
    localStorage.removeItem('cliente_session');
    sessionStorage.removeItem('cliente_session');
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        supabaseClient.auth.signOut();
    }
    if (typeof UICore !== 'undefined') {
        UICore.toast('Sessão Encerrada', 'Até logo!', 'info');
    }
    setTimeout(() => window.location.href = 'cliente-login.html', 500);
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

function initProfileDropdownEvents() {
    document.addEventListener('click', (e) => {
        const btn = document.getElementById('btn-profile-menu');
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

/* ==========================================================================
   DASHBOARD OVERVIEW
   ========================================================================== */

async function carregarDadosClienteDashboard() {
    const cli = currentClientSession.cliente;
    const phone = cli.telefone || '';

    const res = await buscarAgendamentosCliente(phone);
    clientAppointments = res.data || [];

    const hojeStr = new Date().toISOString().split('T')[0];

    // Próximo agendamento ativo
    const proximos = clientAppointments
        .filter(a => a.status === 'confirmado' && a.data >= hojeStr)
        .sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));

    const proximo = proximos[0];
    const nextBox = document.getElementById('next-appointment-box');

    if (proximo) {
        const dataObj = new Date(proximo.data + 'T12:00:00');
        const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        
        document.getElementById('next-appt-day').textContent = String(dataObj.getDate()).padStart(2, '0');
        document.getElementById('next-appt-month').textContent = meses[dataObj.getMonth()];
        document.getElementById('next-appt-service-title').textContent = proximo.servico_nome;
        document.getElementById('next-appt-barber').textContent = proximo.barbeiro_nome;
        document.getElementById('next-appt-time').textContent = proximo.horario;
        document.getElementById('next-appt-price').textContent = `R$ ${proximo.preco},00`;

        appointmentToCancelId = proximo.id;
    } else {
        if (nextBox) {
            nextBox.innerHTML = `
                <div style="text-align: center; width: 100%; padding: 1.5rem 0;">
                    <i class="fas fa-calendar-check" style="font-size: 2.5rem; color: var(--accent); margin-bottom: 0.75rem; display: block;"></i>
                    <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">Nenhum horário agendado no momento</h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Que tal renovar seu estilo com nossos barbeiros especialistas?</p>
                    <button type="button" class="btn btn-primary" onclick="abrirNovoAgendamento()"><i class="fas fa-plus"></i> Agendar Agora</button>
                </div>
            `;
        }
    }

    // Stats
    const totalCortes = clientAppointments.filter(a => a.status === 'concluido' || a.status === 'confirmado').length;
    const statCortes = document.getElementById('stat-total-cortes');
    if (statCortes) statCortes.textContent = totalCortes || 4;

    const statPontos = document.getElementById('stat-pontos-vip');
    if (statPontos) statPontos.textContent = `${cli.pontos || (totalCortes * 15 + 50)} pts`;

    // Render recent table (max 5)
    const recentTbody = document.getElementById('client-recent-table-body');
    if (recentTbody) {
        if (clientAppointments.length === 0) {
            recentTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Nenhum agendamento encontrado.</td></tr>`;
        } else {
            recentTbody.innerHTML = clientAppointments.slice(0, 5).map(a => renderLinhaTabelaAgendamento(a)).join('');
        }
    }
}

function renderLinhaTabelaAgendamento(a) {
    const dataBR = new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR');
    let badgeClass = 'badge-gold';
    let statusText = 'Confirmado';

    if (a.status === 'concluido') {
        badgeClass = 'badge-success';
        statusText = 'Concluído';
    } else if (a.status === 'cancelado') {
        badgeClass = 'badge-danger';
        statusText = 'Cancelado';
    }

    return `
        <tr>
            <td><strong>${dataBR} às ${a.horario}</strong></td>
            <td>${a.servico_nome}</td>
            <td><i class="fas fa-user-tie text-accent"></i> ${a.barbeiro_nome}</td>
            <td><strong>R$ ${a.preco},00</strong></td>
            <td><span class="badge ${badgeClass}">${statusText}</span></td>
            <td style="text-align: right;">
                <button type="button" class="btn btn-ghost btn-sm" title="Ver Detalhes" onclick="verDetalhesAgendamento(${a.id})">
                    <i class="fas fa-eye"></i>
                </button>
                ${a.status === 'confirmado' ? `
                    <button type="button" class="btn btn-ghost btn-sm" style="color: var(--danger);" title="Cancelar" onclick="abrirModalCancelar(${a.id})">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `;
}

function abrirModalAgendamentoCliente() {
    if (typeof reiniciarWizard === 'function') reiniciarWizard();
    if (typeof UICore !== 'undefined') {
        UICore.openModal('modal-booking-wizard');
    }
}

function abrirNovoAgendamento() {
    abrirModalAgendamentoCliente();
}

async function confirmarAgendamentoCliente() {
    const cli = currentClientSession.cliente;
    const btn = document.getElementById('btn-final-confirm');

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirmando...';
    }

    const dados = {
        servico: wizardState.servico,
        barbeiro: wizardState.barbeiro,
        data: wizardState.data,
        horario: wizardState.horario,
        nome: cli.nome,
        telefone: cli.telefone,
        email: cli.email
    };

    const res = await criarAgendamento(dados);

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Confirmar Horário';
    }

    if (res.success) {
        renderizarSucessoWizard(res.data);
        mudarAbaWizard(5);
        UICore.toast('Horário Confirmado!', 'Agendamento cadastrado no seu painel.', 'success');
    } else {
        UICore.toast('Erro', res.error || 'Não foi possível agendar.', 'error');
    }
}

/* ==========================================================================
   PÁGINA: MEUS AGENDAMENTOS (FULL LIST)
   ========================================================================== */

async function carregarPaginaAgendamentos() {
    const cli = currentClientSession.cliente;
    const res = await buscarAgendamentosCliente(cli.telefone);
    clientAppointments = res.data || [];
    renderizarListaCompletaAgendamentos(clientAppointments);
    initFilterTabsAgendamentos();
}

function renderizarListaCompletaAgendamentos(lista) {
    const tbody = document.getElementById('client-all-appointments-body');
    if (!tbody) return;

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem 1rem;">
                    <i class="fas fa-calendar-times" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 0.5rem; display: block;"></i>
                    <strong style="color: var(--text-primary); display: block;">Nenhum agendamento encontrado</strong>
                    <small style="color: var(--text-secondary);">Tente outro filtro ou faça um novo agendamento.</small>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(a => `
        <tr>
            <td><span class="badge badge-gold">#${a.id}</span></td>
            <td><strong>${new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR')} às ${a.horario}</strong></td>
            <td>${a.servico_nome}</td>
            <td><i class="fas fa-user-tie text-accent"></i> ${a.barbeiro_nome}</td>
            <td><strong>R$ ${a.preco},00</strong></td>
            <td>
                <span class="badge ${a.status === 'concluido' ? 'badge-success' : a.status === 'cancelado' ? 'badge-danger' : 'badge-gold'}">
                    ${a.status.toUpperCase()}
                </span>
            </td>
            <td style="text-align: right;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="verDetalhesAgendamento(${a.id})">
                    <i class="fas fa-eye"></i> Detalhes
                </button>
                ${a.status === 'confirmado' ? `
                    <button type="button" class="btn btn-ghost btn-sm" style="color: var(--danger);" onclick="abrirModalCancelar(${a.id})">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

function initFilterTabsAgendamentos() {
    const pills = document.querySelectorAll('#appointments-filter-pills .tab-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            filtrarAgendamentosCliente();
        });
    });
}

function filtrarAgendamentosCliente() {
    const activeTab = document.querySelector('#appointments-filter-pills .tab-pill.active')?.dataset.filter || 'todos';
    const query = document.getElementById('input-search-appointments')?.value.toLowerCase().trim() || '';

    let filtrados = clientAppointments;

    if (activeTab !== 'todos') {
        filtrados = filtrados.filter(a => a.status === activeTab);
    }

    if (query) {
        filtrados = filtrados.filter(a => 
            a.servico_nome.toLowerCase().includes(query) || 
            a.barbeiro_nome.toLowerCase().includes(query) ||
            String(a.id).includes(query)
        );
    }

    renderizarListaCompletaAgendamentos(filtrados);
}

function verDetalhesAgendamento(id) {
    const agendamento = clientAppointments.find(a => String(a.id) === String(id));
    if (!agendamento) return;

    const dataBR = new Date(agendamento.data + 'T12:00:00').toLocaleDateString('pt-BR');
    const corpo = document.getElementById('modal-detalhes-corpo');

    corpo.innerHTML = `
        <div style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">
                <strong style="color: var(--accent); font-size: 1.1rem;">TICKET #${agendamento.id}</strong>
                <span class="badge ${agendamento.status === 'concluido' ? 'badge-success' : agendamento.status === 'cancelado' ? 'badge-danger' : 'badge-gold'}">${agendamento.status.toUpperCase()}</span>
            </div>
            <p><strong>Serviço:</strong> ${agendamento.servico_nome}</p>
            <p><strong>Barbeiro:</strong> ${agendamento.barbeiro_nome}</p>
            <p><strong>Data & Horário:</strong> ${dataBR} às ${agendamento.horario}</p>
            <p><strong>Duração:</strong> ${agendamento.duracao || 45} minutos</p>
            <p><strong>Investimento:</strong> R$ ${agendamento.preco},00</p>
            <p><strong>Local:</strong> Rua José Cosme da Silva, 1021 - Bela Vista, Palhoça/SC</p>
        </div>
    `;

    UICore.openModal('modal-detalhes-agendamento');
}

function verDetalhesProximo() {
    if (appointmentToCancelId) {
        verDetalhesAgendamento(appointmentToCancelId);
    }
}

function abrirModalCancelar(id) {
    appointmentToCancelId = id;
    UICore.openModal('modal-cancelar-agendamento');
}

function cancelarProximoModal() {
    if (appointmentToCancelId) {
        abrirModalCancelar(appointmentToCancelId);
    }
}

async function executarCancelamento() {
    if (!appointmentToCancelId) return;

    const btn = document.getElementById('btn-confirmar-cancelamento');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Cancelando...';
    }

    await cancelarAgendamento(appointmentToCancelId);

    if (btn) {
        btn.disabled = false;
        btn.textContent = 'Confirmar Cancelamento';
    }

    UICore.closeModal('modal-cancelar-agendamento');
    UICore.toast('Cancelado', 'Seu agendamento foi cancelado.', 'info');

    // Recarregar dados
    if (document.getElementById('next-appointment-box')) {
        await carregarDadosClienteDashboard();
    }
    if (document.getElementById('client-all-appointments-body')) {
        await carregarPaginaAgendamentos();
    }
}

/* ==========================================================================
   PÁGINA: PERFIL DO CLIENTE
   ========================================================================== */

function carregarDadosPerfil() {
    const cli = currentClientSession.cliente;
    if (!cli) return;

    document.getElementById('profile-name').value = cli.nome || '';
    document.getElementById('profile-phone').value = cli.telefone || '';
    document.getElementById('profile-email').value = cli.email || '';

    document.getElementById('profile-display-name').textContent = cli.nome || 'Cliente';
    document.getElementById('profile-display-email').textContent = cli.email || '';
    
    if (cli.foto) {
        document.getElementById('profile-display-avatar').src = cli.foto;
    }

    const phoneInput = document.getElementById('profile-phone');
    if (phoneInput && typeof UICore !== 'undefined') {
        UICore.applyPhoneMask(phoneInput);
    }
}

function selecionarAvatar(src) {
    document.querySelectorAll('.avatar-option-thumb').forEach(thumb => {
        thumb.classList.toggle('selected', thumb.src.includes(src));
    });
    document.getElementById('profile-display-avatar').src = src;
    currentClientSession.cliente.foto = src;
}

async function salvarPerfilCliente(e) {
    e.preventDefault();
    const nome = document.getElementById('profile-name').value.trim();
    const telefone = document.getElementById('profile-phone').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    const btn = document.getElementById('btn-save-profile');

    if (!nome || !telefone || !email) {
        UICore.toast('Atenção', 'Preencha todos os campos obrigatórios.', 'warning');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    }

    currentClientSession.cliente.nome = nome;
    currentClientSession.cliente.telefone = telefone;
    currentClientSession.cliente.email = email;

    localStorage.setItem('cliente_session', JSON.stringify(currentClientSession));
    atualizarCabecalhoUsuario();

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
    }

    UICore.toast('Perfil Atualizado', 'Suas informações foram salvas com sucesso!', 'success');
}
