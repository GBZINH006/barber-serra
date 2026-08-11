# 🔷 BARBER SERRA - Site Oficial

Site moderno e responsivo para a Barbearia BARBER SERRA, localizada em Bela Vista, Palhoça - SC. Desenvolvido com HTML, CSS e JavaScript puro, com sistema de agendamento online integrado ao Supabase.

## ✨ Características

### 🎨 Design Moderno
- Interface elegante com gradientes dourados
- Animações suaves e transições fluidas
- 100% responsivo (mobile, tablet e desktop)
- Efeitos hover e interações visuais
- Lightbox para galeria de imagens

### 📅 Sistema de Agendamento
- Formulário multi-etapas intuitivo
- Seleção de serviço, barbeiro, data e horário
- Verificação de disponibilidade em tempo real
- Validações de formulário
- Confirmação por WhatsApp

### 🔧 Funcionalidades
- Navegação suave entre seções
- Menu mobile responsivo
- Galeria com filtros por categoria
- Depoimentos de clientes reais
- Mapa do Google integrado
- Links para redes sociais
- Botão de scroll to top

### 🗄️ Integração com Supabase
- Banco de dados PostgreSQL
- Gerenciamento de barbeiros
- Sistema completo de agendamentos
- Políticas de segurança (RLS)
- Funções e triggers automáticos

## 📁 Estrutura do Projeto

```
barber-serra/
├── index.html              # Página principal
├── css/
│   └── style.css          # Estilos CSS
├── js/
│   ├── config.js          # Configurações do site
│   ├── supabase.js        # Integração com Supabase
│   └── script.js          # Funcionalidades JavaScript
├── images/                 # Pasta para imagens
│   ├── hero-bg.jpg        # Background do hero
│   ├── about-placeholder.jpg
│   ├── barber1-placeholder.jpg
│   ├── barber2-placeholder.jpg
│   ├── barber3-placeholder.jpg
│   ├── corte1-placeholder.jpg
│   └── ... (adicione suas fotos)
├── supabase-setup.sql     # Script de configuração do banco
└── README.md              # Este arquivo
```

## 🚀 Configuração Rápida

### 1️⃣ Preparar os Arquivos

1. Faça o download de todos os arquivos do projeto
2. Mantenha a estrutura de pastas conforme indicado acima
3. Adicione suas fotos na pasta `images/`

### 2️⃣ Configurar o Supabase

#### Criar uma conta no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma conta gratuita

#### Criar um novo projeto
1. No dashboard, clique em "New Project"
2. Preencha:
   - **Name**: barber-serra (ou nome de sua preferência)
   - **Database Password**: crie uma senha forte
   - **Region**: escolha South America (São Paulo) para melhor performance
3. Aguarde alguns minutos até o projeto ser criado

#### Executar o script SQL
1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `supabase-setup.sql`
4. Cole no editor e clique em **Run**
5. Aguarde a mensagem de sucesso

#### Obter as credenciais
1. No menu lateral, clique em **Project Settings** (ícone de engrenagem)
2. Clique em **API**
3. Você verá:
   - **Project URL**: copie este valor
   - **anon public**: copie a chave pública (API Key)

### 3️⃣ Configurar o Site

1. Abra o arquivo `js/config.js`
2. Substitua as credenciais:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://seu-projeto.supabase.co',  // Cole sua Project URL
    anonKey: 'sua-chave-anonima-aqui'        // Cole sua anon public key
};
```

### 4️⃣ Personalizar Conteúdo

#### Adicionar fotos dos barbeiros
1. Coloque as fotos na pasta `images/`
2. No Supabase, vá em **Table Editor** > **barbeiros**
3. Edite cada barbeiro e atualize:
   - Nome
   - Especialidade
   - Caminho da foto (ex: `images/barbeiro-carlos.jpg`)

#### Adicionar fotos da galeria
1. Adicione suas fotos de cortes na pasta `images/`
2. Edite o arquivo `index.html`
3. Na seção `<section class="gallery">`, substitua os placeholders:

```html
<div class="gallery-item" data-category="cortes">
    <img src="images/seu-corte-1.jpg" alt="Corte 1">
    <div class="gallery-overlay">
        <i class="fas fa-search-plus"></i>
    </div>
</div>
```

#### Atualizar informações
- **Horários**: edite em `js/config.js` na variável `HORARIOS_FUNCIONAMENTO`
- **Serviços e preços**: edite em `js/config.js` na variável `SERVICOS`
- **Redes sociais**: edite os links no `index.html`

### 5️⃣ Publicar o Site

#### Opção 1: Vercel (Recomendado)
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "Add New" > "Project"
4. Importe seu repositório ou faça upload dos arquivos
5. Clique em "Deploy"
6. Pronto! Seu site estará online em segundos

#### Opção 2: Netlify
1. Acesse [netlify.com](https://netlify.com)
2. Arraste a pasta do projeto para a área de deploy
3. Aguarde o deploy automático
4. Pronto!

#### Opção 3: Hospedagem Tradicional
1. Faça upload de todos os arquivos via FTP
2. Certifique-se de que o `index.html` está na raiz
3. Configure o domínio

## 📸 Adicionando Suas Fotos

### Tamanhos Recomendados

| Tipo | Tamanho Ideal | Proporção |
|------|---------------|-----------|
| Hero Background | 1920x1080px | 16:9 |
| Sobre (about) | 800x1000px | 4:5 |
| Barbeiros | 600x800px | 3:4 |
| Galeria de cortes | 800x800px | 1:1 |
| Avatar depoimentos | 200x200px | 1:1 |

### Otimização
- Use JPG para fotos (melhor compressão)
- Use PNG apenas para logos com transparência
- Comprima as imagens antes de fazer upload
- Ferramentas recomendadas: [TinyPNG](https://tinypng.com), [Squoosh](https://squoosh.app)

## 🎨 Personalização de Cores

Edite as variáveis CSS em `css/style.css`:

```css
:root {
    --primary-color: #d4af37;      /* Dourado principal */
    --primary-dark: #b8962d;       /* Dourado escuro */
    --secondary-color: #1a1a1a;    /* Preto/cinza escuro */
    --text-color: #333;            /* Texto padrão */
    --text-light: #666;            /* Texto claro */
}
```

## 📱 Testando o Site

### Modo Offline (sem Supabase)
- O site funciona mesmo sem configurar o Supabase
- Os agendamentos serão simulados no console
- Útil para testar o layout e funcionalidades

### Modo Online (com Supabase)
- Configure as credenciais conforme instruções
- Teste criar agendamentos reais
- Verifique no Supabase se os dados foram salvos

## 🔒 Segurança

### Configurações do Supabase
- As políticas RLS (Row Level Security) já estão configuradas
- Apenas leitura pública para barbeiros ativos
- Qualquer pessoa pode criar agendamentos
- Apenas usuários autenticados podem editar

### Autenticação (Opcional)
Para adicionar painel administrativo:
1. Configure o Supabase Auth
2. Crie uma página de login
3. Adicione rotas protegidas

## 🛠️ Manutenção

### Visualizar Agendamentos
1. Acesse o Supabase Dashboard
2. Vá em **Table Editor** > **agendamentos**
3. Veja todos os agendamentos em tempo real

### Gerenciar Barbeiros
1. Acesse **Table Editor** > **barbeiros**
2. Adicione, edite ou desative barbeiros
3. As mudanças aparecem automaticamente no site

### Estatísticas
Execute no SQL Editor:
```sql
SELECT * FROM vw_estatisticas_diarias;
```

## 📞 Suporte

### Problemas Comuns

**Site não carrega estilos**
- Verifique se os caminhos dos arquivos CSS estão corretos
- Certifique-se de manter a estrutura de pastas

**Agendamento não funciona**
- Verifique as credenciais do Supabase em `js/config.js`
- Abra o Console do navegador (F12) para ver erros
- Confirme que executou o script SQL

**Imagens não aparecem**
- Verifique os caminhos das imagens no HTML
- Certifique-se de que as imagens estão na pasta `images/`
- Verifique os nomes dos arquivos (case-sensitive)

## 🌟 Melhorias Futuras

### Sugestões de Features
- [ ] Painel administrativo
- [ ] Notificações por e-mail
- [ ] Integração com WhatsApp Business API
- [ ] Sistema de avaliações
- [ ] Programa de fidelidade
- [ ] Agendamentos recorrentes
- [ ] Envio de lembretes automáticos
- [ ] Relatórios e dashboard analítico

## 📄 Licença

Este projeto foi desenvolvido para a BARBER SERRA. Todos os direitos reservados.

## 💻 Desenvolvido com

- HTML5
- CSS3 (Grid, Flexbox, Animations)
- JavaScript (ES6+)
- Supabase (PostgreSQL)
- Font Awesome (ícones)

---

**BARBER SERRA** - Estilo, tradição e hospitalidade desde 2021  
📍 R. Blumenau - Bela Vista, Palhoça - SC, 88132-745  
📞 (48) 98813-9261  
⭐ 5.0 - Avaliação Google
