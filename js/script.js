// ==================== VARIÁVEIS GLOBAIS ====================
let currentStep = 1;
let agendamentoData = {};
let galleryImages = [];
let currentImageIndex = 0;

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initScrollEffects();
    initModals();
    initGallery();
    initAgendamento();
    
    // Carregar barbeiros
    await carregarBarbeiros();
    renderizarBarbeiros();
});

// ==================== NAVEGAÇÃO ====================
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Toggle menu mobile
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('show');
        });
    }
    
    if (navClose) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('show');
        });
    }
    
    // Fechar menu ao clicar em link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show');
            
            // Atualizar link ativo
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Atualizar link ativo no scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-link[href*="${sectionId}"]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-link[href*="${sectionId}"]`)?.classList.remove('active');
            }
        });
    });
}

// ==================== EFEITOS DE SCROLL ====================
function initScrollEffects() {
    const header = document.getElementById('header');
    const scrollTop = document.getElementById('scroll-top');
    
    window.addEventListener('scroll', () => {
        // Header background no scroll
        if (window.scrollY >= 80) {
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
        } else {
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        }
        
        // Botão scroll to top
        if (window.scrollY >= 400) {
            scrollTop.classList.add('show');
        } else {
            scrollTop.classList.remove('show');
        }
    });
    
    // Scroll to top
    if (scrollTop) {
        scrollTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==================== MODAIS ====================
function initModals() {
    const modal = document.getElementById('modal-agendamento');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const btnsAgendar = [
        document.getElementById('btn-agendar-header'),
        document.getElementById('btn-agendar-hero'),
        document.getElementById('btn-agendar-about')
    ];
    
    // Abrir modal
    btnsAgendar.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                abrirModal();
            });
        }
    });
    
    // Fechar modal
    if (modalClose) {
        modalClose.addEventListener('click', fecharModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', fecharModal);
    }
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            fecharModal();
        }
    });
}

function abrirModal() {
    const modal = document.getElementById('modal-agendamento');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    resetarFormulario();
}

function fecharModal() {
    const modal = document.getElementById('modal-agendamento');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    resetarFormulario();
}

// ==================== GALERIA ====================
function initGallery() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    // Filtros da galeria
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            // Atualizar botão ativo
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filtrar items
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hide');
                    setTimeout(() => {
                        item.style.display = 'block';
                    }, 10);
                } else {
                    item.classList.add('hide');
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Lightbox
    galleryImages = Array.from(galleryItems).map(item => item.querySelector('img').src);
    
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentImageIndex = index;
            openLightbox(galleryImages[index]);
        });
    });
    
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            lightboxImg.src = galleryImages[currentImageIndex];
        });
    }
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            lightboxImg.src = galleryImages[currentImageIndex];
        });
    }
    
    // Fechar lightbox com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
        if (e.key === 'ArrowLeft' && lightbox.classList.contains('active')) {
            lightboxPrev.click();
        }
        if (e.key === 'ArrowRight' && lightbox.classList.contains('active')) {
            lightboxNext.click();
        }
    });
}

function openLightbox(imgSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = imgSrc;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// ==================== AGENDAMENTO ====================
function initAgendamento() {
    const form = document.getElementById('agendamento-form');
    const dataInput = document.getElementById('data');
    
    // Definir data mínima como hoje
    if (dataInput) {
        const hoje = new Date().toISOString().split('T')[0];
        dataInput.min = hoje;
        
        // Quando a data mudar, carregar horários
        dataInput.addEventListener('change', carregarHorarios);
    }
    
    // Submit do formulário
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await finalizarAgendamento();
        });
    }
    
    // Máscara de telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
            e.target.value = value;
        });
    }
}

// Renderizar lista de barbeiros
function renderizarBarbeiros() {
    const container = document.getElementById('barbeiros-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    BARBEIROS.forEach(barbeiro => {
        const div = document.createElement('div');
        div.className = 'barber-select-card';
        div.innerHTML = `
            <input type="radio" name="barbeiro" id="barbeiro-${barbeiro.id}" value="${barbeiro.id}" required>
            <label for="barbeiro-${barbeiro.id}" class="barber-select-label">
                <img src="${barbeiro.foto}" alt="${barbeiro.nome}">
                <div>
                    <h4>${barbeiro.nome}</h4>
                    <span>${barbeiro.especialidade}</span>
                </div>
            </label>
        `;
        container.appendChild(div);
    });
    
    // Adicionar estilos inline para os cards de seleção
    const style = document.createElement('style');
    style.textContent = `
        .barber-select-card {
            margin-bottom: 15px;
        }
        .barber-select-card input[type="radio"] {
            display: none;
        }
        .barber-select-label {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            border: 2px solid var(--border-color);
            border-radius: 12px;
            cursor: pointer;
            transition: var(--transition);
        }
        .barber-select-label:hover {
            border-color: var(--primary-color);
            background: var(--bg-gray);
        }
        .barber-select-card input[type="radio"]:checked + .barber-select-label {
            border-color: var(--primary-color);
            background: rgba(212, 175, 55, 0.1);
        }
        .barber-select-label img {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
        }
        .barber-select-label h4 {
            margin: 0 0 5px 0;
            color: var(--secondary-color);
        }
        .barber-select-label span {
            font-size: 0.9rem;
            color: var(--text-light);
        }
    `;
    document.head.appendChild(style);
}

// Navegação entre etapas do formulário
function nextStep(step) {
    // Validar etapa atual antes de avançar
    if (!validarEtapaAtual(currentStep)) {
        return;
    }
    
    // Salvar dados da etapa atual
    salvarDadosEtapa(currentStep);
    
    // Mudar para próxima etapa
    document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
    currentStep = step;
    
    // Carregar horários se for a etapa 3
    if (step === 3) {
        carregarHorarios();
    }
}

function prevStep(step) {
    document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
    currentStep = step;
}

function validarEtapaAtual(step) {
    if (step === 1) {
        const servico = document.getElementById('servico').value;
        if (!servico) {
            mostrarAlerta('Por favor, selecione um serviço', 'warning');
            return false;
        }
    }
    
    if (step === 2) {
        const barbeiro = document.querySelector('input[name="barbeiro"]:checked');
        if (!barbeiro) {
            mostrarAlerta('Por favor, selecione um barbeiro', 'warning');
            return false;
        }
    }
    
    if (step === 3) {
        const data = document.getElementById('data').value;
        const horario = document.getElementById('horario').value;
        if (!data || !horario) {
            mostrarAlerta('Por favor, selecione data e horário', 'warning');
            return false;
        }
    }
    
    return true;
}

function salvarDadosEtapa(step) {
    if (step === 1) {
        const servicoId = document.getElementById('servico').value;
        const servico = SERVICOS.find(s => s.id === servicoId);
        agendamentoData.servico = servico;
    }
    
    if (step === 2) {
        const barbeiroId = parseInt(document.querySelector('input[name="barbeiro"]:checked').value);
        const barbeiro = BARBEIROS.find(b => b.id === barbeiroId);
        agendamentoData.barbeiro = barbeiro;
    }
    
    if (step === 3) {
        agendamentoData.data = document.getElementById('data').value;
        agendamentoData.horario = document.getElementById('horario').value;
    }
}

// Carregar horários disponíveis
async function carregarHorarios() {
    const dataInput = document.getElementById('data');
    const horarioSelect = document.getElementById('horario');
    const barbeiroInput = document.querySelector('input[name="barbeiro"]:checked');
    
    if (!dataInput.value || !barbeiroInput) {
        return;
    }
    
    mostrarLoading(true);
    
    const barbeiroId = parseInt(barbeiroInput.value);
    const data = dataInput.value;
    
    try {
        const horarios = await carregarHorariosDisponiveis(barbeiroId, data);
        
        horarioSelect.innerHTML = '<option value="">Selecione um horário</option>';
        
        if (horarios.length === 0) {
            horarioSelect.innerHTML = '<option value="">Nenhum horário disponível</option>';
            mostrarAlerta('Não há horários disponíveis para esta data', 'info');
        } else {
            horarios.forEach(horario => {
                const option = document.createElement('option');
                option.value = horario;
                option.textContent = horario;
                horarioSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar horários:', error);
        mostrarAlerta('Erro ao carregar horários disponíveis', 'error');
    } finally {
        mostrarLoading(false);
    }
}

// Finalizar agendamento
async function finalizarAgendamento() {
    // Coletar dados finais
    agendamentoData.nome = document.getElementById('nome').value;
    agendamentoData.telefone = document.getElementById('telefone').value;
    agendamentoData.email = document.getElementById('email').value;
    
    mostrarLoading(true);
    
    try {
        const resultado = await criarAgendamento({
            barbeiroId: agendamentoData.barbeiro.id,
            servico: agendamentoData.servico.nome,
            data: agendamentoData.data,
            horario: agendamentoData.horario,
            nome: agendamentoData.nome,
            telefone: agendamentoData.telefone,
            email: agendamentoData.email
        });
        
        if (resultado.success) {
            mostrarSucesso();
        } else {
            mostrarAlerta('Erro ao criar agendamento: ' + resultado.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao finalizar agendamento:', error);
        mostrarAlerta('Erro ao criar agendamento. Tente novamente.', 'error');
    } finally {
        mostrarLoading(false);
    }
}

function mostrarSucesso() {
    // Formatar data
    const dataFormatada = new Date(agendamentoData.data + 'T12:00:00').toLocaleDateString('pt-BR');
    
    // Preencher detalhes
    const detailsDiv = document.getElementById('agendamento-details');
    detailsDiv.innerHTML = `
        <p><strong>Serviço:</strong> <span>${agendamentoData.servico.nome}</span></p>
        <p><strong>Barbeiro:</strong> <span>${agendamentoData.barbeiro.nome}</span></p>
        <p><strong>Data:</strong> <span>${dataFormatada}</span></p>
        <p><strong>Horário:</strong> <span>${agendamentoData.horario}</span></p>
        <p><strong>Valor:</strong> <span>R$ ${agendamentoData.servico.preco},00</span></p>
    `;
    
    // Ir para tela de sucesso
    document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
    document.querySelector(`[data-step="5"]`).classList.add('active');
    currentStep = 5;
}

function resetarFormulario() {
    currentStep = 1;
    agendamentoData = {};
    
    // Resetar form
    const form = document.getElementById('agendamento-form');
    if (form) form.reset();
    
    // Voltar para primeira etapa
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector('[data-step="1"]')?.classList.add('active');
}

// ==================== UTILITÁRIOS ====================
function mostrarLoading(show) {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        if (show) {
            loading.classList.add('active');
        } else {
            loading.classList.remove('active');
        }
    }
}

function mostrarAlerta(mensagem, tipo = 'info') {
    // Criar alerta customizado
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${tipo === 'error' ? '#f44336' : tipo === 'warning' ? '#ff9800' : tipo === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 100000;
        animation: slideInRight 0.3s ease-out;
        max-width: 350px;
    `;
    alerta.textContent = mensagem;
    
    document.body.appendChild(alerta);
    
    setTimeout(() => {
        alerta.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => alerta.remove(), 300);
    }, 4000);
}

// Adicionar animações para alertas
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(styleSheet);

// ==================== FORMATADORES ====================
function formatarTelefone(telefone) {
    return telefone.replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
}

function formatarData(data) {
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

// ==================== CONSOLE INFO ====================
console.log('%c🔷 BARBER SERRA', 'font-size: 20px; font-weight: bold; color: #d4af37;');
console.log('%c✨ Site desenvolvido com HTML, CSS e JavaScript', 'font-size: 12px; color: #666;');
console.log('%c📦 Integração com Supabase para agendamentos', 'font-size: 12px; color: #666;');
console.log('%c⚙️ Configure suas credenciais em js/config.js', 'font-size: 12px; color: #666;');
