// ==================== CLIENTE AUTHENTICATION ====================
let supabaseClient = null;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    initTabs();
    initForms();
    checkIfLoggedIn();
});

function initSupabase() {
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

// ==================== TABS ====================
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Atualizar tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Atualizar forms
            forms.forEach(form => {
                if (form.id === `${targetTab}-form`) {
                    form.classList.add('active');
                } else {
                    form.classList.remove('active');
                }
            });
        });
    });
}

// ==================== FORMS ====================
function initForms() {
    // Login
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Cadastro
    document.getElementById('cadastro-form').addEventListener('submit', handleCadastro);
    
    // Reset Password
    document.getElementById('reset-form').addEventListener('submit', handleResetPassword);
    
    // Máscara de telefone
    document.getElementById('cadastro-telefone').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        e.target.value = value;
    });
}

// ==================== LOGIN ====================
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember').checked;
    
    if (!supabaseClient) {
        // Modo demo
        const demoSession = {
            user: { id: 'demo-' + Date.now(), email },
            cliente: { nome: 'Cliente Demo', email, telefone: '(48) 99999-9999' }
        };
        
        if (remember) {
            localStorage.setItem('cliente_session', JSON.stringify(demoSession));
        } else {
            sessionStorage.setItem('cliente_session', JSON.stringify(demoSession));
        }
        
        showAlert('login', 'Login demo realizado!', 'success');
        setTimeout(() => window.location.href = 'cliente-dashboard.html', 1000);
        return;
    }
    
    try {
        // Login com Supabase
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        // Buscar dados do cliente
        const { data: cliente, error: clienteError } = await supabaseClient
            .from('clientes')
            .select('*')
            .eq('email', email)
            .single();
        
        if (clienteError || !cliente) {
            throw new Error('Cliente não encontrado');
        }
        
        const session = { user: data.user, cliente };
        
        if (remember) {
            localStorage.setItem('cliente_session', JSON.stringify(session));
        } else {
            sessionStorage.setItem('cliente_session', JSON.stringify(session));
        }
        
        showAlert('login', 'Login realizado com sucesso!', 'success');
        setTimeout(() => window.location.href = 'cliente-dashboard.html', 1000);
        
    } catch (error) {
        console.error('Erro no login:', error);
        showAlert('login', error.message || 'E-mail ou senha incorretos', 'error');
    }
}

// ==================== CADASTRO ====================
async function handleCadastro(e) {
    e.preventDefault();
    
    const nome = document.getElementById('cadastro-nome').value;
    const telefone = document.getElementById('cadastro-telefone').value;
    const email = document.getElementById('cadastro-email').value;
    const password = document.getElementById('cadastro-password').value;
    const passwordConfirm = document.getElementById('cadastro-password-confirm').value;
    
    // Validações
    if (password !== passwordConfirm) {
        showAlert('cadastro', 'As senhas não coincidem', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('cadastro', 'A senha deve ter no mínimo 6 caracteres', 'error');
        return;
    }
    
    if (!supabaseClient) {
        // Modo demo
        const demoSession = {
            user: { id: 'demo-' + Date.now(), email },
            cliente: { nome, email, telefone }
        };
        
        sessionStorage.setItem('cliente_session', JSON.stringify(demoSession));
        showAlert('cadastro', 'Cadastro demo realizado!', 'success');
        setTimeout(() => window.location.href = 'cliente-dashboard.html', 1000);
        return;
    }
    
    try {
        // Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nome,
                    telefone
                }
            }
        });
        
        if (authError) throw authError;
        
        // Criar registro na tabela clientes
        const { data: cliente, error: clienteError } = await supabaseClient
            .from('clientes')
            .insert([{
                id: authData.user.id,
                nome,
                email,
                telefone,
                criado_em: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (clienteError) throw clienteError;
        
        const session = { user: authData.user, cliente };
        sessionStorage.setItem('cliente_session', JSON.stringify(session));
        
        showAlert('cadastro', 'Cadastro realizado! Verifique seu e-mail.', 'success');
        setTimeout(() => window.location.href = 'cliente-dashboard.html', 2000);
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
        showAlert('cadastro', error.message || 'Erro ao criar conta', 'error');
    }
}

// ==================== RESET PASSWORD ====================
async function handleResetPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    
    if (!supabaseClient) {
        showAlert('login', 'Configure o Supabase para recuperação de senha', 'info');
        closeResetModal();
        return;
    }
    
    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        });
        
        if (error) throw error;
        
        showAlert('login', 'Instruções enviadas para seu e-mail!', 'success');
        closeResetModal();
        
    } catch (error) {
        console.error('Erro ao recuperar senha:', error);
        showAlert('login', 'Erro ao enviar e-mail de recuperação', 'error');
    }
}

// ==================== SOCIAL LOGIN ====================
async function loginSocial(provider) {
    if (!supabaseClient) {
        showAlert('login', 'Configure o Supabase para login social', 'info');
        return;
    }
    
    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin + '/cliente-dashboard.html'
            }
        });
        
        if (error) throw error;
        
    } catch (error) {
        console.error('Erro no login social:', error);
        showAlert('login', 'Erro ao fazer login com ' + provider, 'error');
    }
}

// ==================== HELPERS ====================
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function showResetPassword(e) {
    e.preventDefault();
    document.getElementById('reset-modal').classList.add('active');
}

function closeResetModal() {
    document.getElementById('reset-modal').classList.remove('active');
}

function showAlert(formId, message, type) {
    const alert = document.getElementById(`alert-${formId}`);
    alert.textContent = message;
    alert.className = `alert ${type}`;
    alert.style.display = 'flex';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

function checkIfLoggedIn() {
    const session = localStorage.getItem('cliente_session') || sessionStorage.getItem('cliente_session');
    if (session) {
        window.location.href = 'cliente-dashboard.html';
    }
}

// Fechar modal ao clicar fora
document.addEventListener('click', (e) => {
    const modal = document.getElementById('reset-modal');
    if (e.target === modal) {
        closeResetModal();
    }
});
