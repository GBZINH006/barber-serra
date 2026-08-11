# 🔐 Como Adicionar um Administrador (Barbeiro)

## Método 1: Usando o Supabase Dashboard (Recomendado)

### Passo 1: Acesse o Supabase
1. Vá para https://supabase.com
2. Faça login no seu projeto
3. No menu lateral, clique em **SQL Editor**

### Passo 2: Execute o SQL para adicionar admin
```sql
-- Substitua os valores abaixo pelos dados do barbeiro
INSERT INTO barbeiros (nome, email, senha_hash, telefone, especialidade, foto)
VALUES (
    'João Silva',                    -- Nome do barbeiro
    'joao@barberserra.com',          -- Email para login
    '$2a$10$exemplo_hash',           -- Senha criptografada (ver abaixo)
    '(11) 98765-4321',               -- Telefone
    'Especialista em Cortes Clássicos', -- Especialidade
    'images/joao.jpg'                -- Caminho da foto
);
```

### Passo 3: Criar senha criptografada
Para gerar a senha criptografada (bcrypt):

**Opção A - Usando bcrypt online:**
1. Acesse: https://bcrypt-generator.com/
2. Digite a senha desejada (ex: `admin123`)
3. Copie o hash gerado
4. Use no SQL acima

**Opção B - Usando Node.js:**
```javascript
const bcrypt = require('bcrypt');
const senha = 'admin123';
const hash = bcrypt.hashSync(senha, 10);
console.log(hash);
```

---

## Método 2: Usando SQL Direto (Rápido)

Execute este SQL no Supabase SQL Editor:

```sql
-- Admin exemplo com senha: admin123
INSERT INTO barbeiros (nome, email, senha_hash, telefone, especialidade, foto)
VALUES (
    'Admin Principal',
    'admin@barberserra.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhd2',
    '(11) 99999-9999',
    'Administrador',
    'images/admin-avatar.jpg'
);
```

**⚠️ IMPORTANTE:** Senha padrão é `admin123` - **TROQUE IMEDIATAMENTE** após o primeiro login!

---

## Método 3: Criar Admin via Interface (Futuro)

Após ter pelo menos 1 admin cadastrado, você pode criar uma função para adicionar novos admins:

```sql
-- Função para adicionar barbeiro/admin
CREATE OR REPLACE FUNCTION adicionar_barbeiro(
    p_nome VARCHAR,
    p_email VARCHAR,
    p_senha VARCHAR,
    p_telefone VARCHAR,
    p_especialidade VARCHAR
)
RETURNS INT AS $$
DECLARE
    novo_id INT;
BEGIN
    INSERT INTO barbeiros (nome, email, senha_hash, telefone, especialidade)
    VALUES (
        p_nome,
        p_email,
        crypt(p_senha, gen_salt('bf')),
        p_telefone,
        p_especialidade
    )
    RETURNING id INTO novo_id;
    
    RETURN novo_id;
END;
$$ LANGUAGE plpgsql;
```

Usar a função:
```sql
SELECT adicionar_barbeiro(
    'Carlos Souza',
    'carlos@barberserra.com',
    'senha_segura_123',
    '(11) 98888-7777',
    'Especialista em Barba'
);
```

---

## Como fazer login como Admin

1. Acesse: `http://seusite.com/admin/login.html`
2. Use o email cadastrado
3. Use a senha configurada
4. Clique em **Entrar**

### Login de Teste (Modo Demo)
Se ainda não configurou o Supabase, use:
- **Email:** `admin@barberserra.com`
- **Senha:** qualquer coisa (modo demo)

---

## Verificar admins cadastrados

```sql
SELECT id, nome, email, telefone, especialidade, ativo
FROM barbeiros
ORDER BY id;
```

---

## Alterar senha de um admin

```sql
UPDATE barbeiros
SET senha_hash = '$2a$10$NOVO_HASH_AQUI'
WHERE email = 'admin@barberserra.com';
```

---

## Desativar um admin (sem deletar)

```sql
UPDATE barbeiros
SET ativo = false
WHERE email = 'admin@barberserra.com';
```

---

## Reativar um admin

```sql
UPDATE barbeiros
SET ativo = true
WHERE email = 'admin@barberserra.com';
```

---

## 🎯 Exemplo Completo - Adicionar 3 Barbeiros

```sql
-- Barbeiro 1 - Admin Principal
INSERT INTO barbeiros (nome, email, senha_hash, telefone, especialidade, foto, ativo)
VALUES (
    'João Silva',
    'joao@barberserra.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhd2', -- senha: admin123
    '(11) 98765-4321',
    'Cortes Clássicos e Modernos',
    'images/joao.jpg',
    true
);

-- Barbeiro 2
INSERT INTO barbeiros (nome, email, senha_hash, telefone, especialidade, foto, ativo)
VALUES (
    'Carlos Souza',
    'carlos@barberserra.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhd2', -- senha: admin123
    '(11) 98765-1234',
    'Especialista em Barba e Bigode',
    'images/carlos.jpg',
    true
);

-- Barbeiro 3
INSERT INTO barbeiros (nome, email, senha_hash, telefone, especialidade, foto, ativo)
VALUES (
    'Pedro Santos',
    'pedro@barberserra.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhd2', -- senha: admin123
    '(11) 98765-5678',
    'Cortes Degradê e Desenhos',
    'images/pedro.jpg',
    true
);
```

**Todos com senha padrão:** `admin123` 

⚠️ **LEMBRE-SE:** Troque todas as senhas após o primeiro acesso!

---

## 📧 Recuperação de Senha (Futuro)

Para implementar recuperação de senha, você precisará:

1. Configurar SMTP no Supabase
2. Criar função de reset de senha
3. Enviar email com token
4. Criar página de nova senha

---

## 🔒 Segurança

### Boas Práticas:
- ✅ Use senhas fortes (mínimo 8 caracteres, letras, números e símbolos)
- ✅ Troque a senha padrão imediatamente
- ✅ Não compartilhe credenciais
- ✅ Use emails únicos para cada barbeiro
- ✅ Desative contas de funcionários que saírem
- ✅ Faça backup regular do banco de dados

### Senha Forte Exemplo:
- ❌ Fraca: `123456`, `admin`, `senha123`
- ✅ Forte: `B@rb3r2024!Secur3`, `C0rt3$Serra#99`

---

## 🆘 Problemas Comuns

### "Email já existe"
```sql
-- Verificar emails duplicados
SELECT email, COUNT(*) 
FROM barbeiros 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Deletar duplicata (cuidado!)
DELETE FROM barbeiros WHERE id = 99; -- substitua pelo ID correto
```

### "Não consigo fazer login"
1. Verifique se o barbeiro está ativo: `SELECT ativo FROM barbeiros WHERE email = 'seu@email.com'`
2. Verifique se o email está correto
3. Verifique se o Supabase está configurado em `js/config.js`
4. Teste no modo demo primeiro

### "Esqueci a senha"
```sql
-- Resetar para admin123
UPDATE barbeiros
SET senha_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhd2'
WHERE email = 'seu@email.com';
```

---

## 📱 Próximos Passos

Após adicionar o admin:

1. ✅ Fazer login em `/admin/login.html`
2. ✅ Trocar a senha padrão
3. ✅ Adicionar foto do perfil
4. ✅ Configurar horários disponíveis
5. ✅ Cadastrar serviços
6. ✅ Começar a receber agendamentos!

---

**Precisa de ajuda?** Entre em contato com o suporte técnico.
