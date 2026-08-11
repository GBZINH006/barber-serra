// Configuração do Supabase
// IMPORTANTE: Substitua estas credenciais pelas suas próprias do painel Supabase
const SUPABASE_CONFIG = {
    url: 'https://jfgupdmcsenvlgvpckxo.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZ3VwZG1jc2VudmxndnBja3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0Njc2NTQsImV4cCI6MjEwMjA0MzY1NH0.Cf1S3WOHgp1RQ1_CrwhyA_6O1w84Rn5p_mhylEw6MyM'
};

// Configuração de horários de funcionamento
const HORARIOS_FUNCIONAMENTO = {
    segunda: { inicio: '09:00', fim: '21:00', intervalo: 30 },
    terca: { inicio: '09:00', fim: '21:00', intervalo: 30 },
    quarta: { inicio: '09:00', fim: '21:00', intervalo: 30 },
    quinta: { inicio: '09:00', fim: '21:00', intervalo: 30 },
    sexta: { inicio: '09:00', fim: '21:00', intervalo: 30 },
    sabado: { inicio: '09:00', fim: '21:00', intervalo: 30 },
    domingo: { fechado: true }
};

// Lista de serviços
const SERVICOS = [
    { id: 'corte-tesoura', nome: 'Corte com Tesoura', preco: 40, duracao: 45 },
    { id: 'corte-masculino', nome: 'Corte Masculino', preco: 45, duracao: 45 },
    { id: 'barba', nome: 'Barba', preco: 30, duracao: 30 },
    { id: 'combo-completo', nome: 'Combo Completo', preco: 70, duracao: 75 },
    { id: 'corte-infantil', nome: 'Corte Infantil', preco: 35, duracao: 30 },
    { id: 'pigmentacao', nome: 'Pigmentação', preco: 50, duracao: 60 }
];

// Dados dos barbeiros (serão carregados do Supabase)
let BARBEIROS = [
    { id: 1, nome: 'Barbeiro 1', especialidade: 'Cortes Modernos', foto: 'images/barber1-placeholder.jpg' },
    { id: 2, nome: 'Barbeiro 2', especialidade: 'Especialista em Barba', foto: 'images/barber2-placeholder.jpg' },
    { id: 3, nome: 'Barbeiro 3', especialidade: 'Cortes Clássicos', foto: 'images/barber3-placeholder.jpg' }
];
