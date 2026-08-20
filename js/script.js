/**
 * BARBER SERRA — LANDING PAGE & BOOKING WIZARD LOGIC
 */

let wizardState = {
    step: 1,
    servico: null,
    barbeiro: null,
    data: new Date().toISOString().split('T')[0],
    horario: null,
    cliente: {
        nome: '',
        telefone: '',
        email: ''
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    initHeaderAndDrawer();
    initScrollSpy();
    renderServicesCatalog('todos');
    initCategoryTabs();
    await renderTeam();
    initBookingWizard();
});

/* ==========================================================================
   HEADER & MOBILE DRAWER
   ========================================================================== */

function initHeaderAndDrawer() {
    const header = document.getElementById('site-header');
    const toggleBtn = document.getElementById('mobile-toggle');
    const closeBtn = document.getElementById('drawer-close');
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');

    // Header scroll background
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Drawer Open
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            drawer.classList.add('active');
            backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Drawer Close
    const closeDrawer = () => {
        drawer.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    document.querySelectorAll('.drawer-link').forEach(link => {
        link.addEventListener('click', closeDrawer);
    });
}

function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.desktop-nav .nav-item');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.pageYOffset + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   SERVIÇOS & CATÁLOGO
   ========================================================================== */

function renderServicesCatalog(categoria = 'todos') {
    const grid = document.getElementById('landing-services-grid');
    if (!grid) return;

    const filtered = categoria === 'todos' 
        ? SERVICOS 
        : SERVICOS.filter(s => s.categoria === categoria);

    grid.innerHTML = filtered.map(servico => `
        <div class="service-item-card ${servico.destaque ? 'destaque' : ''}">
            <div>
                <div class="service-card-top">
                    <div class="service-icon-wrap">
                        <i class="fas ${servico.icone || 'fa-cut'}"></i>
                    </div>
                    ${servico.destaque ? '<span class="badge badge-gold"><i class="fas fa-crown"></i> Destaque</span>' : ''}
                </div>
                <h3 class="service-card-title">${servico.nome}</h3>
                <p class="service-card-desc">${servico.descricao || ''}</p>
            </div>
            
            <div>
                <div class="service-card-meta">
                    <div class="service-price-box">
                        <span class="price-label">Investimento</span>
                        <span class="price-val">R$ ${servico.preco},00</span>
                    </div>
                    <div class="service-duration-badge">
                        <i class="fas fa-clock text-accent"></i>
                        <span>${servico.duracao} min</span>
                    </div>
                </div>
                <button type="button" class="btn btn-primary" style="width: 100%; margin-top: 1.25rem;" onclick="selecionarServicoDireto('${servico.id}')">
                    <i class="fas fa-calendar-check"></i> Agendar este serviço
                </button>
            </div>
        </div>
    `).join('');
}

function initCategoryTabs() {
    const tabs = document.querySelectorAll('.tab-pill');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderServicesCatalog(tab.dataset.category);
        });
    });
}

/* ==========================================================================
   EQUIPE / BARBEIROS
   ========================================================================== */

async function renderTeam() {
    const grid = document.getElementById('landing-team-grid');
    if (!grid) return;

    const barbeiros = await carregarBarbeiros();

    grid.innerHTML = barbeiros.map(b => `
        <div class="barber-team-card card-hover">
            <div class="barber-photo-box">
                <img src="${b.foto}" alt="${b.nome}">
                <div class="barber-rating-badge">
                    ★ ${b.avaliacao || '5.0'} (${b.atendimentos || '300+'}+)
                </div>
            </div>
            <div class="barber-info-box">
                <div>
                    <h3 class="barber-name">${b.nome}</h3>
                    <p class="barber-specialty">${b.especialidade}</p>
                    <p class="barber-bio">${b.bio || 'Profissional dedicado ao visagismo e à técnica apurada de barbearia.'}</p>
                </div>
                <button type="button" class="btn btn-outline btn-sm" onclick="selecionarBarbeiroDireto(${b.id})">
                    <i class="fas fa-calendar-alt"></i> Agendar com ${b.nome.split(' ')[0]}
                </button>
            </div>
        </div>
    `).join('');
}

/* ==========================================================================
   SISTEMA DE AGENDAMENTO (WIZARD 5 PASSOS)
   ========================================================================== */

function initBookingWizard() {
    renderWizardServices();
    renderWizardBarbers();
    initWizardDatePicker();
    
    const phoneInput = document.getElementById('wizard-telefone');
    if (phoneInput && typeof UICore !== 'undefined') {
        UICore.applyPhoneMask(phoneInput);
    }
}

function renderWizardServices() {
    const container = document.getElementById('wizard-services-grid');
    if (!container) return;

    container.innerHTML = SERVICOS.map(s => `
        <div class="wizard-choice-card ${wizardState.servico?.id === s.id ? 'selected' : ''}" onclick="wizardEscolherServico('${s.id}')">
            <div>
                <strong style="display: block; font-size: 1.05rem; margin-bottom: 0.25rem;">${s.nome}</strong>
                <small style="color: var(--text-secondary);">${s.descricao || ''}</small>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid var(--border-subtle);">
                <span style="font-weight: 800; color: var(--accent); font-size: 1.15rem;">R$ ${s.preco},00</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);"><i class="fas fa-clock"></i> ${s.duracao} min</span>
            </div>
        </div>
    `).join('');
}

function wizardEscolherServico(serviceId) {
    const servico = SERVICOS.find(s => s.id === serviceId);
    if (!servico) return;
    wizardState.servico = servico;
    renderWizardServices();
    document.getElementById('btn-step1-next').disabled = false;
}

function renderWizardBarbers() {
    const container = document.getElementById('wizard-barbers-grid');
    if (!container) return;

    container.innerHTML = BARBEIROS.map(b => `
        <div class="wizard-choice-card ${wizardState.barbeiro?.id === b.id ? 'selected' : ''}" onclick="wizardEscolherBarbeiro(${b.id})">
            <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 0.5rem;">
                <img src="${b.foto}" alt="${b.nome}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-accent);">
                <div>
                    <strong style="display: block; font-size: 1.05rem;">${b.nome}</strong>
                    <small style="color: var(--accent); font-weight: 600;">${b.especialidade}</small>
                </div>
            </div>
            <p style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.4;">${b.bio || ''}</p>
        </div>
    `).join('');
}

function wizardEscolherBarbeiro(barberId) {
    const barbeiro = BARBEIROS.find(b => b.id === barberId);
    if (!barbeiro) return;
    wizardState.barbeiro = barbeiro;
    renderWizardBarbers();
    document.getElementById('btn-step2-next').disabled = false;
}

function initWizardDatePicker() {
    const dateInput = document.getElementById('wizard-date-input');
    if (!dateInput) return;

    const todayStr = new Date().toISOString().split('T')[0];
    dateInput.min = todayStr;
    dateInput.value = todayStr;
    wizardState.data = todayStr;

    dateInput.addEventListener('change', (e) => {
        wizardState.data = e.target.value;
        atualizarChipsData(e.target.value);
        carregarSlotsWizard();
    });

    // Quick chips
    const chipHoje = document.getElementById('chip-hoje');
    const chipAmanha = document.getElementById('chip-amanha');
    const chipDepois = document.getElementById('chip-depois');

    if (chipHoje) {
        chipHoje.addEventListener('click', () => {
            const d = new Date().toISOString().split('T')[0];
            dateInput.value = d;
            wizardState.data = d;
            atualizarChipsData(d);
            carregarSlotsWizard();
        });
    }

    if (chipAmanha) {
        chipAmanha.addEventListener('click', () => {
            const d = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            dateInput.value = d;
            wizardState.data = d;
            atualizarChipsData(d);
            carregarSlotsWizard();
        });
    }

    if (chipDepois) {
        chipDepois.addEventListener('click', () => {
            const d = new Date(Date.now() + 172800000).toISOString().split('T')[0];
            dateInput.value = d;
            wizardState.data = d;
            atualizarChipsData(d);
            carregarSlotsWizard();
        });
    }
}

function atualizarChipsData(selectedDate) {
    const today = new Date().toISOString().split('T')[0];
    const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const depois = new Date(Date.now() + 172800000).toISOString().split('T')[0];

    document.querySelectorAll('.chip-date').forEach(c => c.classList.remove('active'));
    if (selectedDate === today) document.getElementById('chip-hoje')?.classList.add('active');
    else if (selectedDate === amanha) document.getElementById('chip-amanha')?.classList.add('active');
    else if (selectedDate === depois) document.getElementById('chip-depois')?.classList.add('active');
}

async function carregarSlotsWizard() {
    const container = document.getElementById('wizard-slots-grid');
    if (!container) return;

    if (!wizardState.barbeiro) {
        container.innerHTML = '<p class="text-secondary" style="grid-column: 1/-1;">Por favor, selecione um barbeiro na etapa anterior.</p>';
        return;
    }

    container.innerHTML = '<div class="slots-loading" style="grid-column: 1/-1;"><i class="fas fa-spinner fa-spin"></i> Verificando disponibilidade...</div>';

    const slots = await carregarHorariosDisponiveis(wizardState.barbeiro.id, wizardState.data);

    if (!slots || slots.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 1.5rem 0;">
                <i class="fas fa-calendar-times" style="font-size: 2rem; color: var(--warning); margin-bottom: 0.5rem; display: block;"></i>
                <strong style="color: var(--text-primary); display: block;">Nenhum horário disponível para esta data</strong>
                <small style="color: var(--text-secondary);">Barbearia fechada ou agenda cheia. Selecione outra data.</small>
            </div>
        `;
        document.getElementById('btn-step3-next').disabled = true;
        return;
    }

    container.innerHTML = slots.map(slot => `
        <button type="button" class="time-slot-btn ${wizardState.horario === slot ? 'selected' : ''}" onclick="wizardEscolherHorario('${slot}')">
            ${slot}
        </button>
    `).join('');
}

function wizardEscolherHorario(slot) {
    wizardState.horario = slot;
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.textContent.trim() === slot);
    });
    document.getElementById('btn-step3-next').disabled = false;
}

function wizardAvancar(step) {
    if (step === 3) {
        carregarSlotsWizard();
    }
    if (step === 4) {
        renderizarResumoPasso4();
    }
    mudarAbaWizard(step);
}

function wizardVoltar(step) {
    mudarAbaWizard(step);
}

function mudarAbaWizard(step) {
    wizardState.step = step;
    document.querySelectorAll('.wizard-pane').forEach((p, idx) => {
        p.classList.toggle('active', idx + 1 === step);
    });

    document.querySelectorAll('.step-dot').forEach((dot, idx) => {
        dot.classList.remove('active', 'completed');
        if (idx + 1 === step) dot.classList.add('active');
        else if (idx + 1 < step) dot.classList.add('completed');
    });
}

function renderizarResumoPasso4() {
    const invoiceItems = document.getElementById('wizard-invoice-items');
    const totalPrice = document.getElementById('wizard-total-price');
    if (!invoiceItems || !totalPrice) return;

    const dataBR = new Date(wizardState.data + 'T12:00:00').toLocaleDateString('pt-BR');

    invoiceItems.innerHTML = `
        <div class="invoice-row"><span>Serviço:</span><strong>${wizardState.servico?.nome}</strong></div>
        <div class="invoice-row"><span>Barbeiro:</span><strong>${wizardState.barbeiro?.nome}</strong></div>
        <div class="invoice-row"><span>Data:</span><strong>${dataBR}</strong></div>
        <div class="invoice-row"><span>Horário:</span><strong>${wizardState.horario}</strong></div>
        <div class="invoice-row"><span>Duração Estimada:</span><strong>${wizardState.servico?.duracao} minutos</strong></div>
    `;

    totalPrice.textContent = `R$ ${wizardState.servico?.preco || 0},00`;
}

async function confirmarAgendamentoWizard() {
    const nome = document.getElementById('wizard-nome').value.trim();
    const telefone = document.getElementById('wizard-telefone').value.trim();
    const email = document.getElementById('wizard-email').value.trim();

    if (!nome || !telefone) {
        if (typeof UICore !== 'undefined') {
            UICore.toast('Campos Obrigatórios', 'Por favor, informe seu nome e WhatsApp para confirmar.', 'warning');
        } else {
            alert('Por favor, informe seu nome e WhatsApp.');
        }
        return;
    }

    const btnConfirmar = document.getElementById('btn-final-confirm');
    if (btnConfirmar) {
        btnConfirmar.disabled = true;
        btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirmando...';
    }

    const dados = {
        servico: wizardState.servico,
        barbeiro: wizardState.barbeiro,
        data: wizardState.data,
        horario: wizardState.horario,
        nome: nome,
        telefone: telefone,
        email: email
    };

    const resultado = await criarAgendamento(dados);

    if (btnConfirmar) {
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = '<i class="fas fa-check-circle"></i> Confirmar Agendamento';
    }

    if (resultado.success) {
        renderizarSucessoWizard(resultado.data);
        mudarAbaWizard(5);
        if (typeof UICore !== 'undefined') {
            UICore.toast('Sucesso!', 'Agendamento registrado com sucesso!', 'success');
        }
    } else {
        if (typeof UICore !== 'undefined') {
            UICore.toast('Erro', resultado.error || 'Erro ao registrar agendamento. Tente novamente.', 'error');
        } else {
            alert('Erro ao registrar agendamento.');
        }
    }
}

function renderizarSucessoWizard(agendamento) {
    const ticket = document.getElementById('wizard-success-ticket');
    const dataBR = new Date(agendamento.data + 'T12:00:00').toLocaleDateString('pt-BR');
    
    if (ticket) {
        ticket.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
                <strong style="color: var(--accent); font-size: 1rem;"><i class="fas fa-ticket-alt"></i> TICKET #${agendamento.id}</strong>
                <span class="badge badge-success">Confirmado</span>
            </div>
            <p><strong>Cliente:</strong> ${agendamento.cliente_nome}</p>
            <p><strong>Serviço:</strong> ${agendamento.servico_nome}</p>
            <p><strong>Barbeiro:</strong> ${agendamento.barbeiro_nome}</p>
            <p><strong>Data e Hora:</strong> ${dataBR} às ${agendamento.horario}</p>
            <p><strong>Valor:</strong> R$ ${agendamento.preco},00</p>
            <p style="margin-top: 0.5rem; font-size: 0.8125rem; color: var(--text-muted);"><i class="fas fa-map-pin"></i> Rua José Cosme da Silva, 1021 - Bela Vista, Palhoça</p>
        `;
    }

    const btnZap = document.getElementById('btn-whatsapp-confirmation');
    if (btnZap) {
        const msg = `Olá! Confirmei meu agendamento na Barber Serra.\n*Código:* #${agendamento.id}\n*Serviço:* ${agendamento.servico_nome}\n*Barbeiro:* ${agendamento.barbeiro_nome}\n*Data:* ${dataBR} às ${agendamento.horario}\n*Nome:* ${agendamento.cliente_nome}`;
        btnZap.href = `https://wa.me/5548988139261?text=${encodeURIComponent(msg)}`;
    }
}

function reiniciarWizard() {
    wizardState = {
        step: 1,
        servico: null,
        barbeiro: null,
        data: new Date().toISOString().split('T')[0],
        horario: null,
        cliente: { nome: '', telefone: '', email: '' }
    };
    renderWizardServices();
    renderWizardBarbers();
    document.getElementById('btn-step1-next').disabled = true;
    document.getElementById('btn-step2-next').disabled = true;
    document.getElementById('btn-step3-next').disabled = true;
    mudarAbaWizard(1);
}

function abrirModalAgendamentoSite() {
    if (typeof reiniciarWizard === 'function') reiniciarWizard();
    if (typeof UICore !== 'undefined') {
        UICore.openModal('modal-agendamento-site');
    }
}

function abrirWizardAgendamento() {
    abrirModalAgendamentoSite();
}

function selecionarServicoDireto(serviceId) {
    wizardEscolherServico(serviceId);
    abrirModalAgendamentoSite();
    wizardAvancar(2);
}

function selecionarBarbeiroDireto(barberId) {
    if (!wizardState.servico) {
        wizardEscolherServico('corte-degrade');
    }
    wizardEscolherBarbeiro(barberId);
    abrirModalAgendamentoSite();
    wizardAvancar(3);
}
