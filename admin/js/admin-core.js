/**
 * BARBER SERRA — ADMIN CORE CONTROLLER
 * Sidebar, Session, Navigation & Shared Data Handlers
 */

let currentBarberSession = null;

document.addEventListener('DOMContentLoaded', () => {
    // Check if on login page
    if (window.location.pathname.includes('login.html')) {
        checkIfAlreadyLoggedAdmin();
    } else {
        checkAdminAuth();
        initSidebarToggle();
        setActiveSidebarLink();
    }
});

function checkAdminAuth() {
    const raw = localStorage.getItem('barber_session') || sessionStorage.getItem('barber_session');
    if (!raw) {
        window.location.href = 'login.html';
        return;
    }

    try {
        currentBarberSession = JSON.parse(raw);
        atualizarAdminHeader();
    } catch {
        localStorage.removeItem('barber_session');
        window.location.href = 'login.html';
    }
}

function atualizarAdminHeader() {
    if (!currentBarberSession) return;
    const b = currentBarberSession.barbeiro || { nome: 'Administrador', foto: '../images/barber-1.svg' };

    const nameEl = document.getElementById('admin-user-name');
    if (nameEl) nameEl.textContent = b.nome;

    const avatarEl = document.getElementById('admin-user-avatar');
    if (avatarEl && b.foto) {
        avatarEl.src = b.foto.startsWith('http') || b.foto.startsWith('data:') ? b.foto : `../${b.foto}`;
    }
}

function logoutAdmin() {
    localStorage.removeItem('barber_session');
    sessionStorage.removeItem('barber_session');
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        supabaseClient.auth.signOut();
    }
    if (typeof UICore !== 'undefined') {
        UICore.toast('Sessão Encerrada', 'Até breve!', 'info');
    }
    setTimeout(() => window.location.href = 'login.html', 500);
}

function checkIfAlreadyLoggedAdmin() {
    const raw = localStorage.getItem('barber_session') || sessionStorage.getItem('barber_session');
    if (raw) {
        try {
            JSON.parse(raw);
            window.location.href = 'dashboard.html';
        } catch {}
    }
}

function initSidebarToggle() {
    const toggleBtn = document.getElementById('sidebar-mobile-toggle');
    const sidebar = document.getElementById('admin-sidebar');
    const backdrop = document.getElementById('admin-sidebar-backdrop');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (backdrop) backdrop.classList.toggle('active');
        });
    }

    if (backdrop && sidebar) {
        backdrop.addEventListener('click', () => {
            sidebar.classList.remove('open');
            backdrop.classList.remove('active');
        });
    }
}

function setActiveSidebarLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.sidebar-item').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ==================== SHARED ADMIN DATA API ====================

function getLocalData(key, fallback = []) {
    const raw = localStorage.getItem(`barber_serra_${key}`);
    if (!raw) return fallback;
    try {
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function setLocalData(key, data) {
    localStorage.setItem(`barber_serra_${key}`, JSON.stringify(data));
}

async function obterListaAgendamentosAdmin() {
    if (typeof obterTodosAgendamentos === 'function') {
        return await obterTodosAgendamentos();
    }
    return getLocalData('agendamentos', []);
}

async function obterListaClientesAdmin() {
    return getLocalData('clientes', [
        { id: 'cli-1', nome: 'Gabriel Santos', email: 'gabriel@exemplo.com', telefone: '(48) 98813-9261', pontos: 180, total_visitas: 12, total_gasto: 520.00, ultima_visita: 'Hoje', status: 'ativo' },
        { id: 'cli-2', nome: 'Lucas Mendes', email: 'lucas@exemplo.com', telefone: '(48) 99123-4567', pontos: 95, total_visitas: 6, total_gasto: 275.00, ultima_visita: 'Hoje', status: 'ativo' },
        { id: 'cli-3', nome: 'Rodrigo Alves', email: 'rodrigo@exemplo.com', telefone: '(48) 98456-7890', pontos: 320, total_visitas: 18, total_gasto: 1140.00, ultima_visita: 'Hoje', status: 'ativo' },
        { id: 'cli-4', nome: 'Fernando Silveira', email: 'fernando@exemplo.com', telefone: '(48) 99876-5432', pontos: 45, total_visitas: 3, total_gasto: 135.00, ultima_visita: '15/08/2026', status: 'ativo' }
    ]);
}

async function obterListaBarbeirosAdmin() {
    if (typeof carregarBarbeiros === 'function') {
        return await carregarBarbeiros();
    }
    return BARBEIROS;
}

async function obterListaServicosAdmin() {
    if (typeof carregarServicos === 'function') {
        return await carregarServicos();
    }
    return SERVICOS;
}
