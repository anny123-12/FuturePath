// ============================================
// FuturePath — Card & Filters Components
// ============================================

const Card = {
  categoryLabels: {
    emploi: '💼 Emploi', stage: '🎓 Stage', bourse: '🏅 Bourse',
    evenement: '📅 Événement', formation: '📚 Formation'
  },

  render(opp) {
    const user = Auth.getCurrentUser();
    const isLiked = user && opp.likes && opp.likes.includes(user.id);
    const timeAgo = this.timeAgo(opp.createdAt);
    const isPremium = opp.isPremium === true;

    return `
      <div class="card opp-card animate-fade-in-up ${isPremium ? 'card-premium' : ''}" onclick="App.navigate('detail/${opp.id}')">
        ${isPremium ? '<div class="badge badge-premium" style="position:absolute;top:12px;right:12px;z-index:2;">⭐ Sponsorisé</div>' : ''}
        <div class="opp-card-header">
          <div class="opp-card-company">
            <div class="opp-card-avatar">${opp.company?.charAt(0) || '?'}</div>
            <div class="opp-card-company-info">
              <h4>${opp.company}</h4>
              <span>${opp.location || 'Non spécifié'}</span>
            </div>
          </div>
          ${user ? `
            <button class="opp-card-like ${isLiked ? 'liked' : ''}" 
              onclick="event.stopPropagation(); Card.toggleLike('${opp.id}')" 
              title="${isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
              ${isLiked ? '❤️' : '🤍'}
            </button>
          ` : ''}
        </div>
        <h3 class="opp-card-title">${opp.title}</h3>
        <p class="opp-card-desc">${opp.description}</p>
        <div class="opp-card-meta">
          <span class="badge badge-${opp.category}">${this.categoryLabels[opp.category] || opp.category}</span>
          ${opp.type ? `<span class="badge badge-info">${opp.type}</span>` : ''}
          ${opp.salary ? `<span class="badge" style="background:var(--bg-glass);color:var(--text-secondary);border:1px solid var(--border-subtle);">💰 ${opp.salary}</span>` : ''}
        </div>
        <div class="opp-card-footer">
          <span>📅 ${timeAgo}</span>
          <span>❤️ ${opp.likes?.length || 0} · 👤 ${opp.applicants?.length || 0} candidat(s)</span>
        </div>
      </div>
    `;
  },

  toggleLike(oppId) {
    const user = Auth.getCurrentUser();
    if (!user) { Toast.warning('Connexion requise', 'Connectez-vous pour aimer une offre.'); return; }
    const liked = Store.toggleLike(oppId, user.id);
    Toast.show(liked ? 'Ajouté aux favoris ❤️' : 'Retiré des favoris', '', liked ? 'success' : 'info', 2000);
    if (typeof PageOpportunities !== 'undefined' && App.currentRoute === 'opportunities') {
      PageOpportunities.renderResults();
    } else if (App.currentRoute === 'home') {
      PageHome.renderPopular();
    } else {
      App.renderCurrentPage();
    }
  },

  timeAgo(dateStr) {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'À l\'instant';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `Il y a ${days}j`;
    return `Il y a ${Math.floor(days / 30)} mois`;
  }
};

const Filters = {
  state: { categories: [], locations: [], types: [], search: '', sort: 'recent' },

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const opps = Store.getApprovedOpportunities();
    const locations = [...new Set(opps.map(o => o.location).filter(Boolean))];
    const types = [...new Set(opps.map(o => o.type).filter(Boolean))];

    container.innerHTML = `
      <div class="filter-panel">
        <div class="filter-section">
          <div class="filter-section-title">Catégorie</div>
          ${['emploi','stage','bourse','evenement','formation'].map(cat => `
            <div class="filter-option ${this.state.categories.includes(cat) ? 'active' : ''}" onclick="Filters.toggleFilter('categories','${cat}')">
              <div class="filter-checkbox"></div>
              <span>${Card.categoryLabels[cat]}</span>
            </div>
          `).join('')}
        </div>
        <div class="filter-section">
          <div class="filter-section-title">Localisation</div>
          ${locations.map(loc => `
            <div class="filter-option ${this.state.locations.includes(loc) ? 'active' : ''}" onclick="Filters.toggleFilter('locations','${loc}')">
              <div class="filter-checkbox"></div>
              <span>📍 ${loc}</span>
            </div>
          `).join('')}
        </div>
        <div class="filter-section">
          <div class="filter-section-title">Type</div>
          ${types.map(t => `
            <div class="filter-option ${this.state.types.includes(t) ? 'active' : ''}" onclick="Filters.toggleFilter('types','${t}')">
              <div class="filter-checkbox"></div>
              <span>${t}</span>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-ghost btn-sm" onclick="Filters.reset()" style="width:100%;margin-top:var(--space-4);">
          🔄 Réinitialiser les filtres
        </button>
      </div>
    `;
  },

  toggleFilter(group, value) {
    const idx = this.state[group].indexOf(value);
    if (idx === -1) this.state[group].push(value);
    else this.state[group].splice(idx, 1);
    this.apply();
  },

  reset() {
    this.state = { categories: [], locations: [], types: [], search: this.state.search, sort: this.state.sort };
    this.apply();
  },

  apply() {
    if (typeof PageOpportunities !== 'undefined') {
      PageOpportunities.currentPage = 1;
      PageOpportunities.render();
    }
  },

  getFiltered() {
    let opps = Store.getApprovedOpportunities();
    if (this.state.categories.length) opps = opps.filter(o => this.state.categories.includes(o.category));
    if (this.state.locations.length) opps = opps.filter(o => this.state.locations.includes(o.location));
    if (this.state.types.length) opps = opps.filter(o => this.state.types.includes(o.type));
    if (this.state.search) {
      const q = this.state.search.toLowerCase();
      opps = opps.filter(o => o.title.toLowerCase().includes(q) || o.company.toLowerCase().includes(q) || o.description.toLowerCase().includes(q));
    }
    if (this.state.sort === 'recent') opps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (this.state.sort === 'popular') opps.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    
    // Always prioritize premium offers
    return opps.sort((a, b) => (b.isPremium ? 1 : 0) - (a.isPremium ? 1 : 0));
  }
};
