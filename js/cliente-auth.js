/**
 * BARBER SERRA — CLIENT AUTHENTICATION LOGIC
 */

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initForms();
    checkIfAlreadyLoggedIn();
});

function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            forms.forEach(f => {
                f.classList.toggle('active', f.id === `${target}-form`);
            });
        });
    });
}

function initForms() {
    // Login submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    // Cadastro submit
    const cadastroForm = document.getElementById('cadastro-form');
    if (cadastroForm) cadastroForm.addEventListener('submit', handleCadastro);

    // Phone mask
    const phoneInput = document.getElementById('cadastro-telefone');
    if (phoneInput && typeof UICore !== 'undefined') {
        UICore.applyPhoneMask(phoneInput);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember-me')?.checked;
    const btn = document.getElementById('btn-submit-login');

    if (!email || !password) {
        UICore.toast('Atenção', 'Preencha seu e-mail e senha.', 'warning');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Autenticando...';
    }

    try {
        if (!supabaseClient) {
            // Sessão local simulada
            const session = {
                user: { id: 'usr-1', email },
                cliente: {
                    id: 'cli-1',
                    nome: 'Gabriel Santos',
                    email: email,
                    telefone: '(48) 98813-9261',
                    pontos: 180,
                    foto: 'images/avatar-felipe.svg'
                }
            };
            salvarSessao(session, remember);
            UICore.toast('Bem-vindo!', 'Login realizado com sucesso.', 'success');
            setTimeout(() => window.location.href = 'cliente-dashboard.html', 800);
            return;
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Buscar dados do cliente
        const { data: cliente } = await supabaseClient
            .from('clientes')
            .select('*')
            .eq('email', email)
            .single();

        const session = {
            user: data.user,
            cliente: cliente || { nome: email.split('@')[0], email, telefone: '' }
        };

        salvarSessao(session, remember);
        UICore.toast('Sucesso!', 'Login efetuado com sucesso.', 'success');
        setTimeout(() => window.location.href = 'cliente-dashboard.html', 800);

    } catch (err) {
        UICore.toast('Erro no Login', err.message || 'E-mail ou senha incorretos.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar na Conta';
        }
    }
}

async function handleCadastro(e) {
    e.preventDefault();
    const nome = document.getElementById('cadastro-nome').value.trim();
    const telefone = document.getElementById('cadastro-telefone').value.trim();
    const email = document.getElementById('cadastro-email').value.trim();
    const password = document.getElementById('cadastro-password').value;
    const btn = document.getElementById('btn-submit-cadastro');

    if (!nome || !telefone || !email || !password) {
        UICore.toast('Campos Obrigatórios', 'Por favor, preencha todos os campos.', 'warning');
        return;
    }

    if (password.length < 6) {
        UICore.toast('Senha Curta', 'A senha deve ter no mínimo 6 caracteres.', 'warning');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando Conta...';
    }

    try {
        const session = {
            user: { id: 'usr-' + Date.now(), email },
            cliente: {
                id: 'cli-' + Date.now(),
                nome,
                email,
                telefone,
                pontos: 50, // Bônus de boas-vindas
                foto: 'images/avatar-felipe.svg'
            }
        };

        if (supabaseClient) {
            try {
                const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: { data: { nome, telefone } }
                });
                if (!authError && authData.user) {
                    session.user = authData.user;
                    await supabaseClient.from('clientes').insert([{
                        id: authData.user.id,
                        nome,
                        email,
                        telefone,
                        pontos_fidelidade: 50
                    }]);
                }
            } catch (supaErr) {
                console.warn('Erro ao salvar no Supabase, mantendo sessão local:', supaErr);
            }
        }

        salvarSessao(session, true);
        UICore.toast('Conta Criada!', 'Seja bem-vindo ao Barber Serra Clube VIP! Ganhou +50 pontos de boas-vindas.', 'success');
        setTimeout(() => window.location.href = 'cliente-dashboard.html', 1200);

    } catch (err) {
        UICore.toast('Erro', err.message || 'Não foi possível concluir o cadastro.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-user-plus"></i> Concluir Cadastro';
        }
    }
}

function acessarComoDemo() {
    const demoSession = {
        user: { id: 'demo-client-1', email: 'gabriel@exemplo.com' },
        cliente: {
            id: 'cli-1',
            nome: 'Gabriel Santos',
            email: 'gabriel@exemplo.com',
            telefone: '(48) 98813-9261',
            pontos: 180,
            foto: 'images/avatar-felipe.svg'
        }
    };
    salvarSessao(demoSession, true);
    UICore.toast('Modo Demonstração', 'Acessando como Gabriel Santos...', 'info');
    setTimeout(() => window.location.href = 'cliente-dashboard.html', 600);
}

function openResetPasswordModal(e) {
    e.preventDefault();
    if (typeof UICore !== 'undefined') {
        UICore.openModal('modal-reset-password');
    }
}

async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('reset-email').value.trim();
    if (!email) return;

    UICore.closeModal('modal-reset-password');
    UICore.toast('Instruções Enviadas', `Se houver uma conta associada a ${email}, as instruções foram enviadas.`, 'success');
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

function salvarSessao(session, persistir) {
    const str = JSON.stringify(session);
    if (persistir) {
        localStorage.setItem('cliente_session', str);
    } else {
        sessionStorage.setItem('cliente_session', str);
    }
}

function checkIfAlreadyLoggedIn() {
    const session = localStorage.getItem('cliente_session') || sessionStorage.getItem('cliente_session');
    if (session) {
        try {
            JSON.parse(session);
            window.location.href = 'cliente-dashboard.html';
        } catch {
            localStorage.removeItem('cliente_session');
        }
    }
}
