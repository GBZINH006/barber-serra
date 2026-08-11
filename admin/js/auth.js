// ==================== AUTENTICAÇÃO ====================
let supabaseClient = null;

// Inicializar Supabase
function initSupabase() {
    try {
        if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
            if (SUPABASE_CONFIG.url.includes('SEU_PROJETO')) {
                showAlert('Configure suas credenciais do Supabase em js/config.js', 'error');
                return null;
            }
            
            supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            console.log('✅ Supabase inicializado');
            return supabaseClient;
        } else {
            showAlert('Supabase não está configurado', 'error');
            return null;
        }
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
        showAlert('Erro ao conectar com o servidor', 'error');
        return null;
    }
}

// ==================== LOGIN ====================
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Validação básica
    if (!email || !password) {
        showAlert('Preencha todos os campos', 'error');
        return;
    }
    
    // Mostrar loading
    setLoading(true);
    
    try {
        if (!supabaseClient) {
            // Modo demo (sem Supabase)
            console.log('🔓 Login em modo demo');
            await simulateLogin(email, password);
            return;
        }
        
        // Login real com Supabase
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        
        // Verificar se é barbeiro
        const { data: barbeiro, error: barbeiroError } = await supabaseClient
            .from('barbeiros')
            .select('*')
            .eq('email', email)
            .eq('ativo', true)
            .single();
        
        if (barbeiroError || !barbeiro) {
            await supabaseClient.auth.signOut();
            throw new Error('Acesso negado. Apenas barbeiros cadastrados podem acessar.');
        }
        
        // Salvar sessão
        if (rememberMe) {
            localStorage.setItem('barber_session', JSON.stringify({
                user: data.user,
                barbeiro: barbeiro
            }));
        } else {
            sessionStorage.setItem('barber_session', JSON.stringify({
                user: data.user,
                barbeiro: barbeiro
            }));
        }
        
        showAlert('Login realizado com sucesso!', 'success');
        
        // Redirecionar para dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Erro no login:', error);
        showAlert(error.message || 'E-mail ou senha incorretos', 'error');
    } finally {
        setLoading(false);
    }
});

// Simular login para demo
async function simulateLogin(email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Demo: aceitar qualquer e-mail/senha para teste
            if (password.length >= 6) {
                const demoSession = {
                    user: {
                        id: 'demo-' + Date.now(),
                        email: email,
                        role: 'demo'
                    },
                    barbeiro: {
                        id: 1,
                        nome: 'Demo Barbeiro',
                        email: email,
                        ativo: true
                    }
                };
                
                sessionStorage.setItem('barber_session', JSON.stringify(demoSession));
                showAlert('Login demo realizado!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                
                resolve();
            } else {
                showAlert('Senha deve ter no mínimo 6 caracteres', 'error');
                reject();
            }
        }, 1000);
    });
}

// ==================== RECUPERAR SENHA ====================
document.getElementById('forgot-password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    
    if (!supabaseClient) {
        showAlert('Configure o Supabase para recuperação de senha', 'info');
        return;
    }
    
    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/admin/reset-password.html',
        });
        
        if (error) throw error;
        
        showAlert('Instruções enviadas para seu e-mail!', 'success');
        closeForgotPassword();
        
    } catch (error) {
        console.error('Erro ao recuperar senha:', error);
        showAlert('Erro ao enviar e-mail de recuperação', 'error');
    }
});

// ==================== VERIFICAR SESSÃO ====================
function checkSession() {
    const session = localStorage.getItem('barber_session') || sessionStorage.getItem('barber_session');
    
    if (session) {
        try {
            const data = JSON.parse(session);
            return data;
        } catch (error) {
            console.error('Erro ao ler sessão:', error);
            return null;
        }
    }
    
    return null;
}

// Verificar se já está logado
function checkAuth() {
    const session = checkSession();
    
    if (session) {
        // Se está na página de login, redirecionar para dashboard
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'dashboard.html';
        }
        return session;
    } else {
        // Se não está logado e não está na página de login, redirecionar
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
        return null;
    }
}

// Fazer logout
function logout() {
    localStorage.removeItem('barber_session');
    sessionStorage.removeItem('barber_session');
    
    if (supabaseClient) {
        supabaseClient.auth.signOut();
    }
    
    window.location.href = 'login.html';
}

// ==================== UI HELPERS ====================
function setLoading(loading) {
    const btn = document.querySelector('.btn-login');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    
    if (loading) {
        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
    } else {
        btn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}

function showAlert(message, type = 'info') {
    const alertDiv = document.getElementById('alert-message');
    alertDiv.textContent = message;
    alertDiv.className = `alert-message ${type}`;
    alertDiv.style.display = 'flex';
    
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 5000);
}

function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.querySelector('.toggle-password i');
    
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

function showForgotPassword(e) {
    e.preventDefault();
    document.getElementById('forgot-password-modal').classList.add('active');
}

function closeForgotPassword() {
    document.getElementById('forgot-password-modal').classList.remove('active');
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    
    // Se está na página de login, verificar se já está logado
    if (window.location.pathname.includes('login.html')) {
        const session = checkSession();
        if (session) {
            window.location.href = 'dashboard.html';
        }
    }
});

// Fechar modal ao clicar no overlay
document.querySelector('.modal-overlay')?.addEventListener('click', closeForgotPassword);

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeForgotPassword();
    }
});
