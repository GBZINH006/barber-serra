# 🗺️ Como Configurar o Mapa do Google Maps

## 📍 Endereço Atual:
**R. Blumenau - Bela Vista, Palhoça - SC, 88132-745**

---

## ✅ Método 1: Usando o Google Maps (RECOMENDADO)

### Passo 1: Acesse o Google Maps
1. Abra: https://www.google.com/maps
2. Digite no campo de busca: **"R. Blumenau, Bela Vista, Palhoça - SC, 88132-745"**
3. Ou busque: **"BARBER SERRA Palhoça"** (se já estiver no Google Meu Negócio)

### Passo 2: Gere o Código de Incorporação
1. Clique no botão **"Compartilhar"** (ícone de compartilhar)
2. Selecione a aba **"Incorporar um mapa"**
3. Escolha o tamanho (recomendado: Grande ou Personalizado)
4. Clique em **"COPIAR HTML"**

### Passo 3: Cole no Site
1. Abra o arquivo: `barber-serra/index.html`
2. Procure por: `<div class="contact-map">`
3. Substitua o `<iframe>` existente pelo código copiado
4. Salve o arquivo

---

## 🎯 Método 2: Usando Coordenadas Exatas

Se você souber as **coordenadas GPS exatas** da barbearia:

### Formato do Link:
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.82!2d-LONGITUDE!3d-LATITUDE!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2zCOORDENADAS!5e0!3m2!1spt-BR!2sbr!4v1699999999999!5m2!1spt-BR!2sbr
```

### Como Descobrir suas Coordenadas:
1. Abra o Google Maps
2. Clique com botão direito no local exato da barbearia
3. Selecione: **"O que há aqui?"**
4. As coordenadas aparecerão embaixo (ex: -27.653876, -48.672349)

### Exemplo de Coordenadas para Bela Vista, Palhoça:
- **Latitude:** -27.653876
- **Longitude:** -48.672349

---

## 🏢 Método 3: Se Tiver Google Meu Negócio

Se a BARBER SERRA já estiver cadastrada no Google Meu Negócio:

1. Acesse: https://business.google.com
2. Faça login com a conta da empresa
3. Vá em **"Informações"** → **"Endereço"**
4. Copie o link de compartilhamento
5. Use o método 1 acima para gerar o embed

---

## 📝 Código Atual no Site

Localização no arquivo `index.html` (linha ~423):

```html
<div class="contact-map">
    <iframe 
        src="SEU_LINK_DO_GOOGLE_MAPS_AQUI"
        width="100%" 
        height="100%" 
        style="border:0;" 
        allowfullscreen="" 
        loading="lazy" 
        referrerpolicy="no-referrer-when-downgrade"
        title="Localização BARBER SERRA">
    </iframe>
</div>
```

---

## 🎨 Personalização do Mapa

### Tamanhos Disponíveis:
- **Pequeno:** 400 x 300
- **Médio:** 600 x 450
- **Grande:** 800 x 600
- **Personalizado:** Você define

### Estilos (opcional):
Você pode adicionar parâmetros na URL do embed:

- `&maptype=roadmap` - Mapa de ruas (padrão)
- `&maptype=satellite` - Vista de satélite
- `&zoom=15` - Nível de zoom (1-20)
- `&language=pt-BR` - Idioma português

---

## ✅ Checklist de Configuração

- [ ] Buscar endereço no Google Maps
- [ ] Verificar se o pin está no local correto
- [ ] Gerar código de incorporação
- [ ] Copiar o código HTML do iframe
- [ ] Substituir no arquivo index.html
- [ ] Testar o mapa no navegador
- [ ] Verificar se está responsivo no mobile

---

## 🚨 Problemas Comuns

### Mapa não carrega:
- Verifique se tem conexão com internet
- Limpe o cache do navegador (Ctrl + Shift + Del)
- Verifique se o código do iframe está completo

### Mapa aparece no lugar errado:
1. **Solução Rápida:** Use o Método 1 acima
2. Busque: "R. Blumenau, Bela Vista, Palhoça - SC"
3. Gere novo código de incorporação
4. Substitua no index.html

### Mapa não é clicável:
- Verifique se tem `allowfullscreen=""`
- Verifique se não tem CSS bloqueando cliques

---

## 📱 Teste no Mobile

Após configurar, teste em:
1. ✅ Desktop (Chrome, Firefox, Edge)
2. ✅ Mobile (Android/iPhone)
3. ✅ Tablet (iPad/Android)

O mapa deve:
- Carregar automaticamente
- Ser clicável/tocável
- Abrir no app Google Maps ao clicar
- Mostrar o endereço correto

---

## 🔗 Links Úteis

- **Google Maps:** https://www.google.com/maps
- **Google Meu Negócio:** https://business.google.com
- **Gerador de Embed:** https://google-map-generator.com

---

## 💡 Dica Profissional

**Cadastre a BARBER SERRA no Google Meu Negócio!**

Benefícios:
- ✅ Aparecer nas buscas do Google
- ✅ Avaliações de clientes
- ✅ Fotos do estabelecimento
- ✅ Horário de funcionamento
- ✅ Botão de direções
- ✅ Telefone clicável
- ✅ Site linkado

**Como cadastrar:**
1. Acesse: https://business.google.com
2. Clique em "Adicionar seu estabelecimento"
3. Preencha os dados da BARBER SERRA
4. Verifique por telefone ou correio
5. Pronto! Você aparecerá no Google Maps

---

**Precisa de ajuda?** Entre em contato com o suporte técnico.
