# 🧪 Como Testar o Site BARBER SERRA

## 🎯 Testes Essenciais

### 1. Teste Visual Básico ✅

#### Desktop
1. Abra o `index.html` no navegador
2. Verifique se todas as seções aparecem:
   - ✅ Header com logo e menu
   - ✅ Hero com título e botões
   - ✅ Seção "Sobre"
   - ✅ Serviços em cards
   - ✅ Barbeiros
   - ✅ Galeria de fotos
   - ✅ Depoimentos
   - ✅ Contato e mapa
   - ✅ Footer

#### Mobile (Responsivo)
1. Pressione `F12` no navegador
2. Clique no ícone de celular (ou Ctrl+Shift+M)
3. Teste diferentes tamanhos:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
4. Verifique:
   - ✅ Menu hamburguer funciona
   - ✅ Textos legíveis
   - ✅ Botões clicáveis
   - ✅ Imagens se ajustam

### 2. Teste de Navegação 🧭

1. **Menu de Navegação**
   - [ ] Clique em cada link do menu
   - [ ] Verifica se rola suavemente para a seção
   - [ ] Link ativo muda de cor

2. **Botões de Agendamento**
   - [ ] Clique em "Agendar" no header
   - [ ] Clique em "Agendar Horário" no hero
   - [ ] Clique em "Agendar Agora" na seção sobre
   - [ ] Todos devem abrir o modal

3. **Scroll to Top**
   - [ ] Role a página para baixo
   - [ ] Botão aparece no canto inferior direito
   - [ ] Clique e volte ao topo suavemente

### 3. Teste de Galeria 🖼️

1. **Filtros**
   - [ ] Clique em "Todos" - mostra todas as fotos
   - [ ] Clique em "Cortes" - mostra só cortes
   - [ ] Clique em "Barba" - mostra só barbas
   - [ ] Clique em "Infantil" - mostra só infantis

2. **Lightbox**
   - [ ] Clique em qualquer foto
   - [ ] Abre em tela cheia
   - [ ] Setas navegam entre fotos
   - [ ] ESC fecha o lightbox
   - [ ] X fecha o lightbox

### 4. Teste de Agendamento 📅

#### Sem Supabase (Modo Offline)
1. Clique em qualquer botão "Agendar"
2. Modal abre

**Etapa 1 - Serviço**
- [ ] Selecione um serviço
- [ ] Clique em "Próximo"
- [ ] Avança para etapa 2

**Etapa 2 - Barbeiro**
- [ ] Veja os 3 barbeiros
- [ ] Selecione um barbeiro
- [ ] Clique em "Próximo"

**Etapa 3 - Data e Horário**
- [ ] Calendário não permite datas passadas
- [ ] Selecione uma data futura
- [ ] Horários aparecem no select
- [ ] Selecione um horário
- [ ] Clique em "Próximo"

**Etapa 4 - Dados Pessoais**
- [ ] Digite nome completo
- [ ] Digite telefone (formata automaticamente)
- [ ] E-mail é opcional
- [ ] Clique em "Confirmar Agendamento"

**Etapa 5 - Sucesso**
- [ ] Mensagem de confirmação aparece
- [ ] Detalhes do agendamento corretos
- [ ] Botão "Fechar" fecha o modal

#### Com Supabase (Modo Online)
Faça os mesmos testes acima, mas também:
- [ ] Abra o Console (F12) > guia Console
- [ ] Veja mensagem "✅ Supabase inicializado"
- [ ] Complete o agendamento
- [ ] Veja mensagem "✅ Agendamento criado"
- [ ] Abra Supabase Dashboard
- [ ] Verifique em Table Editor > agendamentos
- [ ] Seu agendamento deve estar lá!

### 5. Teste de Links 🔗

1. **Redes Sociais**
   - [ ] Instagram (placeholder #)
   - [ ] Facebook (placeholder #)
   - [ ] WhatsApp abre conversa

2. **Mapa**
   - [ ] Mapa do Google carrega
   - [ ] Localização está correta
   - [ ] Clique abre no Google Maps

3. **Telefone**
   - [ ] Link do telefone funciona (abre discador no mobile)

### 6. Teste de Performance ⚡

1. **Velocidade de Carregamento**
   - [ ] Página carrega em menos de 3 segundos
   - [ ] Imagens carregam progressivamente
   - [ ] Sem delay visível

2. **Suavidade**
   - [ ] Animações são suaves (60 FPS)
   - [ ] Scroll não trava
   - [ ] Hover effects são instantâneos

### 7. Teste de Console do Navegador 🐛

1. Pressione `F12` > Console
2. Verifique:
   - [ ] Sem erros em vermelho (exceto se não configurou Supabase)
   - [ ] Mensagem "🔷 BARBER SERRA" aparece
   - [ ] Se configurado: "✅ Supabase inicializado"
   - [ ] Se não: "⚠️ Configure suas credenciais"

### 8. Teste Cross-Browser 🌐

Teste em diferentes navegadores:
- [ ] Google Chrome
- [ ] Mozilla Firefox
- [ ] Microsoft Edge
- [ ] Safari (Mac/iOS)
- [ ] Opera

## 🔍 Problemas Comuns e Soluções

### ❌ Imagens não aparecem
**Causa**: Caminho errado ou arquivos faltando  
**Solução**: 
1. Verifique se a pasta `images/` existe
2. Confirme que os nomes no HTML batem com os arquivos
3. Use F12 > Network para ver quais arquivos falharam

### ❌ CSS não carrega
**Causa**: Caminho errado do arquivo CSS  
**Solução**:
1. Confirme que `css/style.css` existe
2. Verifique o caminho no HTML: `<link rel="stylesheet" href="css/style.css">`

### ❌ JavaScript não funciona
**Causa**: Ordem de carregamento ou erros no código  
**Solução**:
1. Abra Console (F12)
2. Veja erros em vermelho
3. Confirme que os scripts estão na ordem:
   - supabase CDN
   - config.js
   - supabase.js
   - script.js

### ❌ Modal não abre
**Causa**: IDs dos elementos não batem  
**Solução**:
1. Verifique Console por erros
2. Confirme que todos os IDs existem no HTML:
   - `modal-agendamento`
   - `btn-agendar-header`
   - `btn-agendar-hero`
   - `btn-agendar-about`

### ❌ Agendamento não salva
**Causa**: Supabase não configurado ou credenciais erradas  
**Solução**:
1. Abra `js/config.js`
2. Confirme que substituiu as credenciais
3. URL deve começar com `https://`
4. Chave deve começar com `eyJ`
5. Abra Console e veja mensagens de erro

## 📝 Checklist Final

Antes de publicar:

### Conteúdo
- [ ] Todas as fotos foram trocadas
- [ ] Nomes dos barbeiros atualizados
- [ ] Especialidades corretas
- [ ] Preços atualizados
- [ ] Horários de funcionamento corretos
- [ ] Telefone/WhatsApp atualizado
- [ ] Links de redes sociais corretos
- [ ] Endereço no mapa correto

### Funcionalidade
- [ ] Menu funciona em desktop
- [ ] Menu mobile funciona
- [ ] Todos os botões de agendamento abrem o modal
- [ ] Formulário valida campos obrigatórios
- [ ] Máscara de telefone funciona
- [ ] Calendário bloqueia datas passadas
- [ ] Galeria filtra categorias
- [ ] Lightbox abre e navega entre fotos
- [ ] Links externos abrem em nova aba

### Supabase
- [ ] Projeto criado
- [ ] SQL executado com sucesso
- [ ] Credenciais configuradas em `config.js`
- [ ] Teste de agendamento salva no banco
- [ ] Barbeiros aparecem dinamicamente

### Responsividade
- [ ] Desktop (1920px+) OK
- [ ] Laptop (1366px) OK
- [ ] Tablet (768px) OK
- [ ] Mobile (375px) OK
- [ ] Menu mobile funciona
- [ ] Todas as seções legíveis

### Performance
- [ ] Imagens otimizadas (< 500KB cada)
- [ ] Página carrega rápido
- [ ] Sem erros no Console
- [ ] Funciona offline (sem Supabase para teste)
- [ ] Funciona online (com Supabase)

### SEO/Meta Tags
- [ ] Título da página OK
- [ ] Meta description OK
- [ ] Favicon adicionado (opcional)
- [ ] Open Graph tags (opcional)

## 🎉 Teste Completo Realizado?

Se todos os itens acima estão OK:
1. ✅ Site está pronto para publicação
2. 🚀 Pode fazer deploy
3. 📣 Compartilhe com os clientes!

---

**Dica**: Salve esta página e use como checklist sempre que atualizar o site!
