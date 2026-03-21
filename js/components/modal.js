// ============================================
// FuturePath — Modal Component
// ============================================

const Modal = {
  show(title, contentHTML, options = {}) {
    this.close();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) this.close(); };

    const footerHTML = options.footer || '';
    const widthStyle = options.wide ? 'max-width: 700px;' : '';

    overlay.innerHTML = `
      <div class="modal" style="${widthStyle}">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="Modal.close()">✕</button>
        </div>
        <div class="modal-body">${contentHTML}</div>
        ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  },

  close() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.remove();
      document.body.style.overflow = '';
    }
  },

  confirm(title, message, onConfirm) {
    this.show(title, `<p style="color: var(--text-secondary);">${message}</p>`, {
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Annuler</button>
        <button class="btn btn-primary" id="modal-confirm-btn">Confirmer</button>
      `
    });
    document.getElementById('modal-confirm-btn').onclick = () => {
      this.close();
      onConfirm();
    };
  }
};
