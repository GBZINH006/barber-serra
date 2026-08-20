/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * BARBER SERRA — CINEMATIC MOTION SYSTEM
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Sistema completo de animações cinematográficas, parallax e microinterações
 * Performance otimizada com GPU acceleration e reduced motion support
 */

const CinematicMotion = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIGURAÇÃO GLOBAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  config: {
    prefersReducedMotion: false,
    isMobile: false,
    isTouch: false,
    scrollThrottle: 16, // 60fps
    intersectionThreshold: 0.15,
    staggerDelay: 100, // ms entre cada item no stagger
    parallaxIntensity: 0.3
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INICIALIZAÇÃO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  init() {
    this.detectEnvironment();
    this.setupIntersectionObserver();
    this.setupParallax();
    this.setupScrollProgress();
    this.setupBackToTop();
    this.setupCounters();
    this.setupCursorEffects();
    this.applyReducedMotionPreference();
    
    console.log('🎬 Cinematic Motion System: Initialized');
  },

  // Detecta ambiente e preferências
  detectEnvironment() {
    this.config.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.config.isMobile = window.innerWidth < 768;
    this.config.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Listener para mudanças de preferência
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.config.prefersReducedMotion = e.matches;
      this.applyReducedMotionPreference();
    });

    // Listener para resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.config.isMobile = window.innerWidth < 768;
      }, 250);
    });
  },

  // Aplica preferência de movimento reduzido
  applyReducedMotionPreference() {
    if (this.config.prefersReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
      console.log('♿ Reduced Motion: Enabled');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INTERSECTION OBSERVER - REVEAL ANIMATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  setupIntersectionObserver() {
    const options = {
      threshold: this.config.intersectionThreshold,
      rootMargin: '0px 0px -80px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.revealElement(entry.target);
        }
      });
    }, options);

    // Observa elementos com classe reveal
    this.observeRevealElements();
  },

  observeRevealElements() {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale, .fade-in, .stagger-item'
    );

    revealElements.forEach((el, index) => {
      // Adiciona delay inicial baseado no índice para elementos stagger
      if (el.closest('.stagger-container') || el.classList.contains('stagger-item')) {
        const staggerIndex = Array.from(el.parentElement?.children || []).indexOf(el);
        el.style.transitionDelay = `${staggerIndex * this.config.staggerDelay}ms`;
      }
      
      this.observer.observe(el);
    });
  },

  revealElement(element) {
    element.classList.add('is-visible');
    
    // Para elementos com contador
    if (element.classList.contains('counter')) {
      this.animateCounter(element);
    }

    // Remove observer após revelação para performance
    this.observer.unobserve(element);
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PARALLAX EFFECT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  setupParallax() {
    // Não ativar parallax em mobile ou com reduced motion
    if (this.config.isMobile || this.config.prefersReducedMotion) return;

    this.parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (this.parallaxElements.length === 0) return;

    let ticking = false;
    let lastScrollY = 0;

    const updateParallax = () => {
      lastScrollY = window.pageYOffset;

      this.parallaxElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;

        if (isInView) {
          const speed = parseFloat(el.dataset.parallax) || this.config.parallaxIntensity;
          const yPos = -(lastScrollY - el.offsetTop) * speed;
          
          // GPU-accelerated transform
          el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
      });

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SCROLL PROGRESS INDICATOR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  setupScrollProgress() {
    // Criar elemento de progresso
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    progressBar.innerHTML = '<div class="scroll-progress-fill"></div>';
    document.body.appendChild(progressBar);

    const fill = progressBar.querySelector('.scroll-progress-fill');

    let ticking = false;

    const updateProgress = () => {
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.pageYOffset / windowHeight) * 100;
      fill.style.width = `${Math.min(scrolled, 100)}%`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BACK TO TOP BUTTON
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  setupBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    btn.setAttribute('aria-label', 'Voltar ao topo');
    document.body.appendChild(btn);

    let isVisible = false;

    const toggleVisibility = () => {
      const shouldShow = window.pageYOffset > 600;
      
      if (shouldShow && !isVisible) {
        btn.classList.add('is-visible');
        isVisible = true;
      } else if (!shouldShow && isVisible) {
        btn.classList.remove('is-visible');
        isVisible = false;
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANIMATED COUNTERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  setupCounters() {
    this.counters = document.querySelectorAll('.counter');
  },

  animateCounter(element) {
    const target = parseInt(element.dataset.count || element.textContent.replace(/\D/g, ''));
    const duration = parseInt(element.dataset.duration || 2000);
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    
    let current = 0;
    const increment = target / (duration / 16); // 60fps
    const startTime = Date.now();

    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutExpo)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      current = Math.floor(eased * target);
      
      element.textContent = `${prefix}${current.toLocaleString('pt-BR')}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = `${prefix}${target.toLocaleString('pt-BR')}${suffix}`;
      }
    };

    requestAnimationFrame(updateCounter);
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CURSOR EFFECTS (Desktop only)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  setupCursorEffects() {
    if (this.config.isTouch || this.config.isMobile) return;

    // Magnetic effect para botões premium
    const magneticElements = document.querySelectorAll('.btn-primary, .btn-magnetic');

    magneticElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        el.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      });

      el.addEventListener('mousemove', (e) => {
        if (this.config.prefersReducedMotion) return;

        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const moveX = x * 0.15;
        const moveY = y * 0.15;

        el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STAGGER ANIMATION HELPER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  applyStagger(container, selector = '.stagger-item', delay = 100) {
    const items = container.querySelectorAll(selector);
    items.forEach((item, index) => {
      item.style.transitionDelay = `${index * delay}ms`;
      item.classList.add('stagger-item');
    });
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE TRANSITION HELPER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  pageTransition(callback) {
    if (this.config.prefersReducedMotion) {
      callback();
      return;
    }

    document.body.classList.add('page-transitioning');
    
    setTimeout(() => {
      callback();
      setTimeout(() => {
        document.body.classList.remove('page-transitioning');
      }, 50);
    }, 300);
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY: Reveal elemento manualmente
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  reveal(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => this.revealElement(el));
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DESTROY (cleanup)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  destroy() {
    if (this.observer) this.observer.disconnect();
    console.log('🎬 Cinematic Motion System: Destroyed');
  }
};

// Auto-inicializar quando DOM estiver pronto
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CinematicMotion.init());
  } else {
    CinematicMotion.init();
  }
}
