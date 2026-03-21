// ============================================
// FuturePath — Opportunity Detail Page
// ============================================

const PageDetail = {
  render(id) {
    const app = document.getElementById('app');
    const opp = Store.getOpportunityById(id);
    if (!opp) {
      app.innerHTML = `<div class="empty-state"><div class="empty-state-icon">404</div><h3>Opportunité introuvable</h3><p>Cette offre n'existe plus ou a été supprimée.</p><button class="btn btn-primary" onclick="App.navigate('opportunities')">Retour aux opportunités</button></div>`;
      return;
    }
    const user = Auth.getCurrentUser();
    const isLiked = user && opp.likes?.includes(user.id);
    const hasApplied = user && opp.applicants?.find(a => a.userId === user.id);
    const isSaved = user && (Store.getUserById(user.id)?.savedOffers || []).includes(opp.id);

    app.innerHTML = `
      <div class="detail-page animate-fade-in">
        <div class="detail-back" onclick="App.navigate('opportunities')">← Retour aux opportunités</div>
        <div class="detail-header">
          <div class="detail-company-row">
            <div class="detail-company-avatar">${opp.company?.charAt(0) || '?'}</div>
            <div>
              <h4 style="font-size:var(--text-lg);">${opp.company}</h4>
              <span style="color:var(--text-muted);font-size:var(--text-sm);">📍 ${opp.location || 'Non spécifié'}</span>
            </div>
          </div>
          <h1 class="detail-title">${opp.title}</h1>
          <div class="detail-meta">
            <span class="badge badge-${opp.category}">${Card.categoryLabels[opp.category]}</span>
            ${opp.type ? `<span class="badge badge-info">${opp.type}</span>` : ''}
            ${opp.salary ? `<span class="detail-meta-item">💰 ${opp.salary}</span>` : ''}
            <span class="detail-meta-item">📅 ${Card.timeAgo(opp.createdAt)}</span>
            <span class="detail-meta-item">❤️ ${opp.likes?.length || 0} likes</span>
            <span class="detail-meta-item">👤 ${opp.applicants?.length || 0} candidat(s)</span>
          </div>
          <div class="detail-actions">
            ${opp.applyUrl ? `
              <a href="${opp.applyUrl}" target="_blank" class="btn btn-primary" style="text-decoration: none;">
                📤 Postuler en cliquant sur ce lien
              </a>
            ` : ''}
            ${user && user.role === 'user' ? `
              <button class="btn ${isLiked ? 'btn-danger' : 'btn-secondary'}" onclick="Card.toggleLike('${opp.id}');PageDetail.render('${opp.id}');">
                ${isLiked ? '❤️ Aimé' : '🤍 Aimer'}
              </button>
              <button class="btn ${isSaved ? 'btn-accent' : 'btn-secondary'}" onclick="PageDetail.toggleSave('${opp.id}')">
                ${isSaved ? '★ Sauvegardé' : '☆ Sauvegarder'}
              </button>
            ` : !user ? `
              <p style="color: var(--text-muted); font-size: var(--text-sm);">Connectez-vous pour aimer ou sauvegarder cette offre.</p>
            ` : ''}
          </div>
        </div>
        <div class="detail-content">
          <div class="detail-sidebar-card">
            <h3>Description</h3>
            <p>${opp.description}</p>
          </div>
          ${opp.requirements?.length ? `
            <div class="detail-sidebar-card">
              <h3>Exigences</h3>
              <ul>${opp.requirements.map(r => `<li>${r}</li>`).join('')}</ul>
            </div>
          ` : ''}
        </div>
        ${this.renderSimilar(opp)}
      </div>
    `;
  },

  toggleSave(oppId) {
    const user = Auth.getCurrentUser();
    if (!user) { App.navigate('login'); return; }
    const saved = Store.toggleSaveOffer(user.id, oppId);
    Toast.show(saved ? 'Offre sauvegardée ★' : 'Offre retirée des favoris', '', saved ? 'success' : 'info', 2000);
    this.render(oppId);
  },

  renderSimilar(opp) {
    const similar = Store.getApprovedOpportunities()
      .filter(o => o.id !== opp.id && o.category === opp.category)
      .slice(0, 3);
    if (!similar.length) return '';
    return `
      <div style="margin-top:var(--space-12);">
        <h2 style="margin-bottom:var(--space-6);">Offres similaires</h2>
        <div class="opportunities-grid">${similar.map(o => Card.render(o)).join('')}</div>
      </div>
    `;
  }
};
