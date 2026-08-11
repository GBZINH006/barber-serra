# 📸 Como Configurar o Widget do Instagram

O site agora exibe o feed do Instagram em vez de uma galeria estática. Isso traz várias vantagens:

✅ Conteúdo sempre atualizado automaticamente  
✅ Não precisa fazer upload de fotos no site  
✅ Clientes veem os trabalhos mais recentes  
✅ Aumenta engajamento no Instagram  
✅ Mais profissional e moderno  

---

## 🚀 Opções de Widget

### **OPÇÃO 1: EmbedSocial** (Recomendada) ⭐

**Por que escolher:**
- ✅ Mais bonito e profissional
- ✅ Gratuito até 5.000 views/mês
- ✅ Carrega rápido
- ✅ Responsivo
- ✅ Customizável

#### Passo a Passo:

1. **Acesse:** https://embedsocial.com/products/embedfeed/

2. **Crie Conta Grátis:**
   - Clique em "Start Free Trial"
   - Use o e-mail da barbearia
   - Confirme o e-mail

3. **Conecte o Instagram:**
   - No dashboard, clique em "Add new source"
   - Escolha "Instagram"
   - Clique em "Connect Instagram account"
   - Autorize o acesso

4. **Configure o Widget:**
   - Escolha o layout: "Grid" ou "Carousel"
   - Defina número de posts: 6-9 posts
   - Escolha o tema: Dark ou Light
   - Ajuste espaçamento e bordas

5. **Personalize o Design:**
   ```
   Layout: Grid
   Columns: 3
   Gap: 10px
   Border Radius: 12px
   Show captions: No
   Show likes/comments: Optional
   ```

6. **Copie o Código:**
   - Clique em "Get Code"
   - Copie o código JavaScript

7. **Cole no Site:**
   
   Abra `index.html` e encontre:
   ```html
   <div id="embedsocial-instagram-feed"></div>
   ```
   
   Logo antes de `</body>`, adicione:
   ```html
   <script>
   (function(d, s, id) {
     var js; if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://embedsocial.com/cdn/ht.js";
     d.getElementsByTagName("head")[0].appendChild(js);
   }(document, "script", "EmbedSocialHashtagScript"));
   </script>
   ```
   
   E substitua o div por:
   ```html
   <div class="embedsocial-hashtag" data-ref="SEU_CODIGO_AQUI"></div>
   ```

---

### **OPÇÃO 2: SnapWidget** (Alternativa)

**Por que escolher:**
- ✅ Muito simples de usar
- ✅ Gratuito
- ✅ Não precisa de conta

#### Passo a Passo:

1. **Acesse:** https://snapwidget.com/

2. **Escolha o Tipo:**
   - Clique em "Free Widget"
   - Escolha "Instagram Grid"

3. **Configure:**
   - Username: @barberserra
   - Layout: Grid
   - Photos: 9
   - Columns: 3
   - Photo Size: Medium

4. **Copie o Código:**
   - Clique em "Get Widget"
   - Copie o código iframe

5. **Cole no Site:**
   
   Abra `index.html` e descomente:
   ```html
   <iframe src="https://snapwidget.com/embed/SEU_CODIGO" 
           class="snapwidget-widget" 
           allowtransparency="true" 
           frameborder="0" 
           scrolling="no"
           style="border:none; overflow:hidden; width:100%; height:600px;">
   </iframe>
   ```

---

### **OPÇÃO 3: Elfsight** (Premium)

**Por que escolher:**
- ✅ Mais recursos
- ✅ Stories do Instagram
- ✅ Filtros avançados

**Preço:** $5/mês

**Link:** https://elfsight.com/instagram-feed-instashow/

---

## 🎨 Customização Adicional

### Alterar Cores do Widget

No `index.html`, adicione este estilo:
```html
<style>
#embedsocial-instagram-feed {
    --primary-color: #c9a96e;
    filter: sepia(10%);
}
</style>
```

### Alterar Número de Posts

Edite no widget configurator:
- 6 posts = 2x3 grid
- 9 posts = 3x3 grid (recomendado)
- 12 posts = 4x3 grid

### Adicionar Botão "Seguir"

Já incluído! O botão "Seguir no Instagram" aparece abaixo do feed.

---

## 📱 Testar Responsividade

Após configurar, teste em:
- ✅ Desktop (1920px)
- ✅ Tablet (768px)
- ✅ Mobile (375px)

O widget deve se ajustar automaticamente!

---

## 🔧 Troubleshooting

### Widget não aparece
**Problema:** Código não foi colado corretamente  
**Solução:** 
1. Verifique se colou o script antes de `</body>`
2. Verifique se o código do widget está correto
3. Limpe o cache do navegador (Ctrl+Shift+R)

### Posts não atualizam
**Problema:** Cache do widget  
**Solução:**
1. EmbedSocial atualiza a cada 6-12 horas
2. Force update no dashboard do EmbedSocial
3. Aguarde até 24h para sincronização

### Widget muito lento
**Problema:** Muitas fotos ou conexão ruim  
**Solução:**
1. Reduza número de posts para 6
2. Use lazy loading (já incluído no código)
3. Otimize imagens no Instagram antes de postar

### Instagram não conecta
**Problema:** Conta privada ou sem permissão  
**Solução:**
1. Certifique-se que a conta é **pública**
2. Se for Business Account, use Instagram Graph API
3. Reautorize a conexão no dashboard

---

## 💡 Dicas Pro

### 1. Use Hashtags Consistentes
```
#barberserra #barbearia #belavista #palhoca
```
No widget, você pode filtrar por hashtag!

### 2. Poste Regularmente
- **Ideal:** 1-2 posts por dia
- **Mínimo:** 3-4 posts por semana

### 3. Qualidade das Fotos
- ✅ Boa iluminação
- ✅ Foco no corte/barba
- ✅ Fundo limpo
- ✅ Edição leve (contraste, brilho)

### 4. Horários de Pico
Poste quando seu público está online:
- **Manhã:** 8h-10h
- **Almoço:** 12h-14h
- **Noite:** 18h-21h

### 5. Engajamento
Responda comentários para aumentar alcance!

---

## 🆘 Precisa de Ajuda?

### Suporte EmbedSocial:
- Email: support@embedsocial.com
- Chat: No dashboard
- Docs: https://embedsocial.com/docs/

### Suporte SnapWidget:
- Email: support@snapwidget.com
- FAQ: https://snapwidget.com/faq

### Suporte Desenvolvedor (Você!):
Deixe seu contato aqui para o cliente:
- WhatsApp: [SEU NÚMERO]
- E-mail: [SEU EMAIL]

---

## 📊 Métricas para Acompanhar

Após implementar, monitore:

### No Instagram:
- 📈 Crescimento de seguidores
- 👁️ Visualizações de perfil
- 💬 Engajamento (likes + comentários)

### No Site:
- 📈 Tempo na página (deve aumentar)
- 👆 Cliques no Instagram (via Google Analytics)
- 📱 Taxa de conversão de agendamentos

---

## ✅ Checklist de Implementação

- [ ] Escolher opção de widget (EmbedSocial recomendado)
- [ ] Criar conta na plataforma
- [ ] Conectar conta do Instagram
- [ ] Configurar layout e design
- [ ] Copiar código do widget
- [ ] Colar no index.html
- [ ] Testar em desktop
- [ ] Testar em mobile
- [ ] Verificar performance
- [ ] Configurar atualização automática

---

## 🎯 Resultado Final

Depois de configurado, você terá:

✅ **Feed Instagram atualizado automaticamente**  
✅ **Design bonito e profissional**  
✅ **Mais engajamento no Instagram**  
✅ **Menos trabalho (não precisa fazer upload manual)**  
✅ **Conteúdo sempre fresco**  

---

**Tempo de implementação:** 10-15 minutos  
**Custo:** Gratuito (plano básico)  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)

**Bora implementar?** 🚀
