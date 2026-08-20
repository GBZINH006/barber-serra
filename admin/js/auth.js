/**
 * BARBER SERRA — ADMIN AUTHENTICATION
 */

async function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const remember = document.getElementById('admin-remember-me')?.checked;
    const btn = document.getElementById('btn-submit-admin-login');

    if (!email || !password) {
        UICore.toast('Atenção', 'Informe seu e-mail e senha de administrador.', 'warning');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Autenticando...';
    }

    try {
        if (!supabaseClient) {
            // Sessão Admin Demo
            const session = {
                user: { id: 'admin-1', email, role: 'barbeiro' },
                barbeiro: {
                    id: 1,
                    nome: 'Mateus Rabelo',
                    email: email,
                    especialidade: 'Master Barber • Fade & Degradê',
                    foto: 'images/barber-1.svg',
                    role: 'admin'
                }
            };
            salvarSessaoAdmin(session, remember);
            UICore.toast('Bem-vindo!', 'Acesso administrativo autorizado.', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 700);
            return;
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Verificar registro de barbeiro
        const { data: barbeiro } = await supabaseClient
            .from('barbeiros')
            .select('*')
            .eq('email', email)
            .single();

        const session = {
            user: data.user,
            barbeiro: barbeiro || {
                id: 1,
                nome: email.split('@')[0],
                email: email,
                foto: 'images/barber-1.svg'
            }
        };

        salvarSessaoAdmin(session, remember);
        UICore.toast('Autenticado', 'Bem-vindo ao painel!', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 700);

    } catch (err) {
        UICore.toast('Erro', err.message || 'Credenciais inválidas.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Acessar Painel Executivo';
        }
    }
}

function acessarAdminComoDemo() {
    const session = {
        user: { id: 'admin-1', email: 'mateus@barberserra.com', role: 'barbeiro' },
        barbeiro: {
            id: 1,
            nome: 'Mateus Rabelo',
            email: 'mateus@barberserra.com',
            especialidade: 'Master Barber • Fade & Degradê',
            foto: 'images/barber-1.svg',
            role: 'admin'
        }
    };
    salvarSessaoAdmin(session, true);
    UICore.toast('Modo Demo', 'Acessando como Mateus Rabelo...', 'info');
    setTimeout(() => window.location.href = 'dashboard.html', 500);
}

function openAdminResetModal(e) {
    e.preventDefault();
    UICore.toast('Recuperação de Senha', 'Entre em contato com o suporte ou use o acesso de demonstração.', 'info');
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const icon = input.parentElement.querySelector('.btn-toggle-password i');
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    } else {
        input.type = 'password';
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

function salvarSessaoAdmin(session, persistir) {
    const str = JSON.stringify(session);
    if (persistir) {
        localStorage.setItem('barber_session', str);
    } else {
        sessionStorage.setItem('barber_session', str);
    }
}
