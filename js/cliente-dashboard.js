// ==================== CLIENTE DASHBOARD ====================
let supabaseClient = null;
let currentUser = null;
let bookingData = {};
let currentStep = 1;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initSupabase();
    loadUserData();
    loadServices();
    loadBarbers();
    initDatePicker();
});

function checkAuth() {
    const session = localStorage.getItem('cliente_session') || sessionStorage.getItem('cliente_session');
    if (!session) {
        window.location.href = 'cliente-login.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(session);
        document.getElementById('user-name').textContent = currentUser.cliente.nome.split(' ')[0];
        document.getElementById('user-name-header').textContent = currentUser.cliente.nome.split(' ')[0];
        document.getElementById('profile-name').textContent = currentUser.cliente.nome;
        document.getElementById('profile-email').textContent = currentUser.cliente.email;
        document.getElementById('profile-phone').textContent = currentUser.cliente.telefone || '--';
    } catch (error) {
        console.error('Erro ao ler sessão:', error);
        window.location.href = 'cliente-login.html';
    }
}

function initSupabase() {
    try {
        if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
            if (!SUPABASE_CONFIG.url.includes('SEU_PROJETO')) {
                supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            }
        }
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
    }
}

function loadUserData() {
    // Dados demo
    document.getElementById('proximo-agendamento').textContent = 'Hoje, 14:00';
    document.getElementById('total-atendimentos').textContent = '12';
    document.getElementById('pontos-fidelidade').textContent = '180';
}

function loadServices() {
    const grid = document.getElementById('services-grid');
    grid.innerHTML = SERVICOS.map(servico => `
        <div class="service-card" onclick="selectService('${servico.id}')">
            <h4>${servico.nome}</h4>
            <p class="service-price">R$ ${servico.preco}</p>
            <p class="service-duration">${servico.duracao} minutos</p>
        </div>
    `).join('');
}

function loadBarbers() {
    const grid = document.getElementById('barbers-grid');
    grid.innerHTML = BARBEIROS.map(barbeiro => `
        <div class="barber-card" onclick="selectBarber(${barbeiro.id})">
            <img src="${barbeiro.foto}" alt="${barbeiro.nome}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 12px;">
            <h4>${barbeiro.nome}</h4>
            <p>${barbeiro.especialidade}</p>
        </div>
    `).join('');
}

function selectService(serviceId) {
    document.querySelectorAll('.service-card').forEach(card => card.classList.remove('selected'));
    event.target.closest('.service-card').classList.add('selected');
    bookingData.servico = SERVICOS.find(s => s.id === serviceId);
    document.querySelector('[onclick="nextBookingStep(2)"]').disabled = false;
}

function selectBarber(barberId) {
    document.querySelectorAll('.barber-card').forEach(card => card.classList.remove('selected'));
    event.target.closest('.barber-card').classList.add('selected');
    bookingData.barbeiro = BARBEIROS.find(b => b.id === barberId);
    document.querySelector('[data-step="2"] .btn-next').disabled = false;
}

function initDatePicker() {
    const dateInput = document.getElementById('booking-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    dateInput.addEventListener('change', loadTimeSlots);
}

function loadTimeSlots() {
    const date = document.getElementById('booking-date').value;
    if (!date) return;
    
    const timeSlotsDiv = document.getElementById('time-slots');
    const horarios = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];
    
    timeSlotsDiv.innerHTML = horarios.map(hora => `
        <div class="time-slot" onclick="selectTime('${hora}')">${hora}</div>
    `).join('');
}

function selectTime(time) {
    document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
    event.target.classList.add('selected');
    bookingData.horario = time;
    bookingData.data = document.getElementById('booking-date').value;
    document.querySelector('[data-step="3"] .btn-next').disabled = false;
}

function nextBookingStep(step) {
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
    currentStep = step;
    
    if (step === 4) {
        showBookingSummary();
    }
}

function prevBookingStep(step) {
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    document.querySelector(`[data-step="${step}"]`).classList.add('active'));
    currentStep = step;
}

function showBookingSummary() {
    const summaryDiv = document.getElementById('booking-summary');
    const dataFormatada = new Date(bookingData.data + 'T12:00:00').toLocaleDateString('pt-BR');
    
    summaryDiv.innerHTML = `
        <div style="background: var(--bg); padding: 24px; border-radius: 12px;">
            <h4 style="margin-bottom: 16px; color: var(--secondary);">Resumo do Agendamento</h4>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <p><strong>Serviço:</strong> ${bookingData.servico.nome}</p>
                <p><strong>Barbeiro:</strong> ${bookingData.barbeiro.nome}</p>
                <p><strong>Data:</strong> ${dataFormatada}</p>
                <p><strong>Horário:</strong> ${bookingData.horario}</p>
                <p><strong>Valor:</strong> R$ ${bookingData.servico.preco}</p>
            </div>
        </div>
    `;
}

async function confirmBooking() {
    const agendamento = {
        barbeiroId: bookingData.barbeiro.id,
        servico: bookingData.servico.nome,
        data: bookingData.data,
        horario: bookingData.horario,
        nome: currentUser.cliente.nome,
        telefone: currentUser.cliente.telefone,
        email: currentUser.cliente.email
    };
    
    // Salvar (modo demo ou real)
    console.log('Agendamento:', agendamento);
    
    // Mostrar sucesso
    nextBookingStep(5);
    
    const dataFormatada = new Date(bookingData.data + 'T12:00:00').toLocaleDateString('pt-BR');
    document.getElementById('booking-details-final').innerHTML = `
        <div style="background: var(--bg); padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p><strong>Serviço:</strong> ${bookingData.servico.nome}</p>
            <p><strong>Barbeiro:</strong> ${bookingData.barbeiro.nome}</p>
            <p><strong>Data:</strong> ${dataFormatada}</p>
            <p><strong>Horário:</strong> ${bookingData.horario}</p>
        </div>
    `;
}

function resetBooking() {
    bookingData = {};
    nextBookingStep(1);
    document.querySelectorAll('.service-card, .barber-card, .time-slot').forEach(el => el.classList.remove('selected'));
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function logout() {
    localStorage.removeItem('cliente_session');
    sessionStorage.removeItem('cliente_session');
    window.location.href = 'cliente-login.html';
}
