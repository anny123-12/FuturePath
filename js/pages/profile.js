// ============================================
// FuturePath — Profile Page
// ============================================

const PageProfile = {
  activeTab: 'applications',

  render() {
    if (!Auth.requireAuth('user')) return;
    const user = Auth.getCurrentUser();
    const fullUser = Store.getUserById(user.id);
    const applications = fullUser?.applications || [];
    const savedOffers = fullUser?.savedOffers || [];

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="profile-page">
        <div class="container">
          <div class="profile-header">
            <div class="profile-avatar">${user.avatar || user.name.charAt(0)}</div>
            <div class="profile-info">
              <h2>${user.name}</h2>
              <p>📧 ${user.email}</p>
              <p>👤 Membre depuis ${Card.timeAgo(fullUser?.createdAt)}</p>
            </div>
          </div>

          <div class="dashboard-stats" style="grid-template-columns: repeat(3, 1fr);">
            <div class="stat-card">
              <div class="stat-card-value" style="color:var(--primary-300);">${applications.length}</div>
              <div class="stat-card-label">Candidatures</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-value" style="color:var(--danger-text);">${this.getLikedCount(user.id)}</div>
              <div class="stat-card-label">Offres aimées</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-value" style="color:var(--accent-300);">${savedOffers.length}</div>
              <div class="stat-card-label">Sauvegardées</div>
            </div>
          </div>

          <div class="tabs">
            <button class="tab ${this.activeTab === 'applications' ? 'active' : ''}" onclick="PageProfile.switchTab('applications')">📤 Mes candidatures</button>
            <button class="tab ${this.activeTab === 'saved' ? 'active' : ''}" onclick="PageProfile.switchTab('saved')">★ Sauvegardées</button>
            <button class="tab ${this.activeTab === 'liked' ? 'active' : ''}" onclick="PageProfile.switchTab('liked')">❤️ Aimées</button>
          </div>

          <div id="profile-content"></div>
        </div>
      </div>
    `;
    this.renderTab();
  },

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const tabs = ['applications', 'saved', 'liked'];
    document.querySelector(`.tab:nth-child(${tabs.indexOf(tab) + 1})`).classList.add('active');
    this.renderTab();
  },

  renderTab() {
    const content = document.getElementById('profile-content');
    if (!content) return;
    const user = Auth.getCurrentUser();
    const fullUser = Store.getUserById(user.id);

    if (this.activeTab === 'applications') {
      const apps = fullUser?.applications || [];
      if (!apps.length) {
        content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><h3>Aucune candidature</h3><p>Explorez les opportunités et postulez à celles qui vous intéressent.</p><button class="btn btn-primary" onclick="App.navigate('opportunities')">Explorer</button></div>`;
        return;
      }
      content.innerHTML = `
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr><th>Offre</th><th>Entreprise</th><th>Date</th><th>Statut</th><th>Action</th></tr></thead>
            <tbody>
              ${apps.map(a => {
                const opp = Store.getOpportunityById(a.oppId);
                if (!opp) return '';
                return `
                  <tr>
                    <td><strong>${opp.title}</strong></td>
                    <td>${opp.company}</td>
                    <td>${Card.timeAgo(a.appliedAt)}</td>
                    <td><span class="badge badge-pending">⏳ En cours</span></td>
                    <td><button class="btn btn-ghost btn-sm" onclick="App.navigate('detail/${opp.id}')">👁 Voir</button></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (this.activeTab === 'saved') {
      const saved = (fullUser?.savedOffers || []).map(id => Store.getOpportunityById(id)).filter(Boolean);
      if (!saved.length) {
        content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">☆</div><h3>Aucune offre sauvegardée</h3><p>Sauvegardez des offres pour les retrouver facilement.</p></div>`;
        return;
      }
      content.innerHTML = `<div class="opportunities-grid">${saved.map(o => Card.render(o)).join('')}</div>`;
    } else {
      const liked = Store.getApprovedOpportunities().filter(o => o.likes?.includes(user.id));
      if (!liked.length) {
        content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🤍</div><h3>Aucune offre aimée</h3><p>Aimez des offres pour les retrouver ici.</p></div>`;
        return;
      }
      content.innerHTML = `<div class="opportunities-grid">${liked.map(o => Card.render(o)).join('')}</div>`;
    }
  },

  getLikedCount(userId) {
    return Store.getApprovedOpportunities().filter(o => o.likes?.includes(userId)).length;
  }
};
