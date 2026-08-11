# ⚡ Guia Rápido de Instalação - BARBER SERRA

## 🎯 Começar em 5 Minutos

### Passo 1: Criar Conta Supabase (2 min)
1. Vá em https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub ou e-mail
4. Clique em "New Project"
5. Preencha:
   - Nome: `barber-serra`
   - Senha: (crie uma senha forte)
   - Região: `South America (São Paulo)`
6. Clique em "Create new project"

### Passo 2: Configurar Banco de Dados (1 min)
1. No Supabase, clique em **SQL Editor** (menu lateral)
2. Clique em **New Query**
3. Abra o arquivo `supabase-setup.sql` deste projeto
4. Copie TUDO e cole no editor
5. Clique em **Run** (ou aperte F5)
6. Aguarde aparecer "Success. No rows returned"

### Passo 3: Pegar Credenciais (30 seg)
1. Clique em **Settings** (ícone de engrenagem no menu)
2. Clique em **API**
3. Copie:
   - **URL** (algo como `https://abc123.supabase.co`)
   - **anon public** (chave longa começando com `eyJ...`)

### Passo 4: Configurar Site (30 seg)
1. Abra o arquivo `js/config.js`
2. Substitua na linha 3 e 4:

```javascript
url: 'COLE_SUA_URL_AQUI',
anonKey: 'COLE_SUA_CHAVE_AQUI'
```

### Passo 5: Adicionar Suas Fotos (1 min)
1. Coloque suas fotos na pasta `images/`
2. Renomeie ou atualize os caminhos no `index.html`
3. No Supabase, vá em **Table Editor** > **barbeiros**
4. Clique em cada barbeiro e edite nome e foto

### Passo 6: Publicar (30 seg)
1. Vá em https://vercel.com
2. Faça login com GitHub
3. Arraste a pasta do projeto
4. Pronto! Site no ar! 🚀

---

## 🧪 Testar Localmente

### Opção 1: Live Server (VS Code)
1. Instale a extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

### Opção 2: Python
```bash
# Python 3
python -m http.server 8000
```
Depois abra: http://localhost:8000

### Opção 3: Node.js
```bash
npx serve
```

---

## ✅ Checklist de Configuração

- [ ] Conta Supabase criada
- [ ] Script SQL executado com sucesso
- [ ] Credenciais copiadas e coladas em `config.js`
- [ ] Fotos dos barbeiros adicionadas
- [ ] Fotos da galeria adicionadas
- [ ] Telefone do WhatsApp atualizado
- [ ] Links de redes sociais atualizados
- [ ] Horários de funcionamento configurados
- [ ] Preços dos serviços atualizados
- [ ] Site testado localmente
- [ ] Site publicado online

---

## 🆘 Solução de Problemas

### ❌ "Supabase não configurado"
**Solução**: Verifique se copiou corretamente a URL e a chave em `js/config.js`

### ❌ Erro ao executar SQL
**Solução**: 
- Certifique-se de copiar TODO o conteúdo de `supabase-setup.sql`
- Execute novamente, mesmo que apareça erro de "já existe"

### ❌ Agendamento não salva
**Solução**:
1. Abra Console do navegador (F12)
2. Veja se há erros em vermelho
3. Verifique se as credenciais estão corretas
4. Confirme que o SQL foi executado

### ❌ Imagens não aparecem
**Solução**:
- Verifique se as fotos estão na pasta `images/`
- Confirme que os nomes no HTML batem com os nomes dos arquivos
- Linux/Mac são case-sensitive: `foto.jpg` ≠ `Foto.JPG`

---

## 📞 Contatos Rápidos

**Supabase Dashboard**: https://app.supabase.com  
**Vercel Dashboard**: https://vercel.com/dashboard  
**Documentação Supabase**: https://supabase.com/docs

---

## 🎨 Personalização Rápida

### Mudar Cores
Edite em `css/style.css` (linha 2-10):
```css
--primary-color: #d4af37;  /* Mude para sua cor */
```

### Mudar Horários
Edite em `js/config.js` (linha 8-16)

### Mudar Preços
Edite em `js/config.js` (linha 19-26)

### Mudar Telefone
Busque por `98813-9261` e substitua em:
- `index.html` (várias ocorrências)

---

## 🚀 Próximos Passos

Depois de configurado:

1. **Teste criar um agendamento** no site
2. **Verifique no Supabase** se salvou (Table Editor > agendamentos)
3. **Compartilhe o link** com seus clientes
4. **Configure um domínio próprio** (ex: barberserra.com.br)

---

**Dúvidas?** Abra o arquivo `README.md` para documentação completa! 📚
