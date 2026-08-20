// ==========================================================================
// BARBER SERRA — CONFIGURAÇÃO CENTRAL DO SISTEMA
// ==========================================================================

const SUPABASE_CONFIG = {
    url: 'https://jfgupdmcsenvlgvpckxo.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZ3VwZG1jc2VudmxndnBja3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0Njc2NTQsImV4cCI6MjEwMjA0MzY1NH0.Cf1S3WOHgp1RQ1_CrwhyA_6O1w84Rn5p_mhylEw6MyM'
};

// Dados da Barbearia
const BARBEARIA_CONFIG = {
    nome: 'BARBER SERRA',
    slogan: 'Seu próximo corte começa aqui.',
    descricao: 'A precisão do corte clássico unida à tecnologia de agendamento em tempo real. Experiência premium em Bela Vista, Palhoça.',
    telefone: '(48) 98813-9261',
    whatsapp: '5548988139261',
    endereco: 'Rua José Cosme da Silva, 1021 - Bela Vista, Palhoça - SC, 88132-700',
    googleMapsUrl: 'https://maps.google.com/?q=Barber+Serra+Palhoca',
    instagram: '@barberserra',
    instagramUrl: 'https://instagram.com',
    avaliacaoGoogle: 5.0,
    totalAvaliacoes: 48
};

// Configuração de horários de funcionamento
const HORARIOS_FUNCIONAMENTO = {
    segunda: { inicio: '09:00', fim: '21:00', intervalo: 30, fechado: false },
    terca: { inicio: '09:00', fim: '21:00', intervalo: 30, fechado: false },
    quarta: { inicio: '09:00', fim: '21:00', intervalo: 30, fechado: false },
    quinta: { inicio: '09:00', fim: '21:00', intervalo: 30, fechado: false },
    sexta: { inicio: '09:00', fim: '21:00', intervalo: 30, fechado: false },
    sabado: { inicio: '09:00', fim: '20:00', intervalo: 30, fechado: false },
    domingo: { fechado: true }
};

// Catálogo de Serviços - PREÇOS REAIS BARBER SERRA
const SERVICOS = [
    // CORTES
    { 
        id: 'corte-degrade', 
        nome: 'Corte Degradê / Fade', 
        preco: 40, 
        duracao: 45, 
        categoria: 'cortes',
        descricao: 'Degradê na navalha ou máquina com acabamento milimétrico, lavagem e finalização com pomada premium.',
        icone: 'fa-scissors',
        destaque: true
    },
    { 
        id: 'navalhado-tesoura', 
        nome: 'Corte Tesoura ou Navalhado', 
        preco: 45, 
        duracao: 50, 
        categoria: 'cortes',
        descricao: 'Técnica clássica na tesoura ou navalha completa com divisão de mechas e texturização personalizada.',
        icone: 'fa-cut',
        destaque: false
    },
    
    // BARBA E TRATAMENTO
    { 
        id: 'barba-simples', 
        nome: 'Barba Tradicional', 
        preco: 35, 
        duracao: 30, 
        categoria: 'barba',
        descricao: 'Alinhamento de barba com lâmina descartável, loção pré e pós-barba e óleo hidratante.',
        icone: 'fa-user-ninja',
        destaque: false
    },
    { 
        id: 'barba-ozonio', 
        nome: 'Barboterapia com Vapor de Ozônio', 
        preco: 50, 
        duracao: 40, 
        categoria: 'barba',
        descricao: 'Vapor de ozônio para abrir os poros, toalha quente aromática, esfoliação facial e massagem relaxante.',
        icone: 'fa-spa',
        destaque: true
    },
    
    // COMBOS
    { 
        id: 'combo-degrade-barba', 
        nome: 'Combo Degradê + Barba Tradicional', 
        preco: 75, 
        duracao: 75, 
        categoria: 'combos',
        descricao: 'O pacote clássico: corte moderno degradê aliado ao alinhamento e desenho de barba completo.',
        icone: 'fa-crown',
        destaque: true
    },
    { 
        id: 'combo-premium', 
        nome: 'Combo Vip (Navalhado + Barboterapia Ozônio)', 
        preco: 95, 
        duracao: 90, 
        categoria: 'combos',
        descricao: 'Experiência VIP completa com corte navalhado, toalha quente, vapor de ozônio, hidratação e bebida cortesia.',
        icone: 'fa-gem',
        destaque: true
    }
];

// Barbeiros da equipe
let BARBEIROS = [
    { 
        id: 1, 
        nome: 'Mateus Rabelo', 
        especialidade: 'Master Barber • Fade & Degradê', 
        foto: 'images/barber-1.svg',
        avaliacao: 5.0,
        atendimentos: 420,
        ativo: true,
        bio: 'Especialista em fades de alta precisão, visagismo e cortes modernos.'
    },
    { 
        id: 2, 
        nome: 'Caio Martins', 
        especialidade: 'Barboterapia & Design de Barba', 
        foto: 'images/barber-2.svg',
        avaliacao: 4.9,
        atendimentos: 380,
        ativo: true,
        bio: 'Referência em tratamentos faciais masculinos, toalha quente e alinhamento de barba.'
    },
    { 
        id: 3, 
        nome: 'Bruno Costa', 
        especialidade: 'Cortes Clássicos & Tesoura', 
        foto: 'images/barber-3.svg',
        avaliacao: 5.0,
        atendimentos: 310,
        ativo: true,
        bio: 'Técnicas tradicionais de alfaiataria capilar, corte estruturado e navalha afiada.'
    }
];
