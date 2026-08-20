/**
 * BARBER SERRA — UI CORE UTILITIES
 * Toast notifications, Modals, Formatters, Masks and UI Helpers
 */

const UICore = {
  /**
   * Initializes UI events (ESC to close modals, overlay clicks, etc.)
   */
  init() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        this.closeModal(e.target.id);
      }
    });
  },

  /**
   * Toast notification system
   */
  toast(title, message, type = 'info', duration = 4000) {
    let container = document.getElementById('global-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'global-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';

    toast.innerHTML = `
      <i class="fas ${iconClass} toast-icon"></i>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button type="button" class="toast-close" aria-label="Fechar notificação">
        <i class="fas fa-times"></i>
      </button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.opacity = '0';
          toast.style.transform = 'translateX(20px)';
          toast.style.transition = 'all 0.3s ease';
          setTimeout(() => toast.remove(), 300);
        }
      }, duration);
    }
  },

  /**
   * Modal Management
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea, button.btn-primary');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    if (!document.querySelector('.modal-backdrop.active')) {
      document.body.style.overflow = '';
    }
  },

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop.active').forEach((modal) => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  },

  /**
   * Formatters
   */
  formatCurrency(value) {
    const num = Number(value) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  formatDate(dateStr) {
    if (!dateStr) return '--';
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  },

  formatTime(timeStr) {
    if (!timeStr) return '--';
    return timeStr.substring(0, 5);
  },

  formatPhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  },

  applyPhoneMask(inputElement) {
    if (!inputElement) return;
    inputElement.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.substring(0, 11);
      if (v.length > 6) {
        e.target.value = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
      } else if (v.length > 2) {
        e.target.value = `(${v.substring(0, 2)}) ${v.substring(2)}`;
      } else if (v.length > 0) {
        e.target.value = `(${v}`;
      } else {
        e.target.value = '';
      }
    });
  },

  /**
   * WhatsApp Link Generator
   */
  getWhatsAppLink(phone, message) {
    const cleanPhone = (phone || '48988139261').replace(/\D/g, '');
    const encoded = encodeURIComponent(message || 'Olá, gostaria de saber mais sobre o Barber Serra!');
    return `https://wa.me/55${cleanPhone}?text=${encoded}`;
  }
};

// Auto initialize on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => UICore.init());
}
