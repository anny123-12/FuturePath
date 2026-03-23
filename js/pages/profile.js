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
              <div class="flex justify-between items-start">
                <div>
                  <h2>${user.name}</h2>
                  <p>📧 ${user.email}</p>
                  <p>👤 ${fullUser?.gender === 'M' ? 'Homme' : fullUser?.gender === 'F' ? 'Femme' : ''} ${fullUser?.age ? `• ${fullUser.age} ans` : ''}</p>
                  <p>🎓 Diplôme : <strong id="diploma-display">${fullUser?.diploma || 'Non renseigné'}</strong></p>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="PageProfile.showEditDiploma()">✏️ Modifier profil</button>
              </div>
              <p style="margin-top:var(--space-2);font-size:var(--text-xs);color:var(--text-muted);">👤 Membre depuis ${Card.timeAgo(fullUser?.createdAt)}</p>
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
            <button class="tab ${this.activeTab === 'applications' ? 'active' : ''}" onclick="PageProfile.switchTab('applications')">📤 Candidatures</button>
            <button class="tab ${this.activeTab === 'alerts' ? 'active' : ''}" onclick="PageProfile.switchTab('alerts')">🔔 Alertes</button>
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
    const tabs = ['applications', 'alerts', 'saved', 'liked'];
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
    } else if (this.activeTab === 'alerts') {
      const notes = (fullUser?.notifications || []);
      if (!notes.length) {
        content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔔</div><h3>Aucune alerte</h3><p>Renseignez votre diplôme pour recevoir des alertes personnalisées.</p></div>`;
        return;
      }
      content.innerHTML = `
        <div class="notifications-page-list" style="display:flex;flex-direction:column;gap:var(--space-3);">
          ${notes.map(n => `
            <div class="card p-4 flex justify-between items-center ${!n.isRead ? 'border-primary' : ''}" style="${!n.isRead ? 'background:rgba(139, 92, 246, 0.05);' : ''}">
              <div>
                <h4 style="margin-bottom:4px;">${n.title}</h4>
                <p style="color:var(--text-secondary);font-size:var(--text-sm);">${n.message}</p>
                <span style="font-size:var(--text-xxs);color:var(--text-muted);">${Card.timeAgo(n.date)}</span>
              </div>
              <button class="btn btn-primary btn-sm" onclick="App.navigate('${n.link}')">Voir l'offre</button>
            </div>
          `).join('')}
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

  showEditDiploma() {
    const user = Auth.getCurrentUser();
    const fullUser = Store.getUserById(user.id);
    Modal.show('Modifier mon profil', `
      <div class="form-group">
        <label class="form-label">Votre Diplôme / Spécialité</label>
        <input type="text" class="form-input" id="edit-diploma" value="${fullUser?.diploma || ''}" placeholder="Ex: Informatique, Marketing, Master 2...">
        <p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--space-2);">
          Nous utiliserons ce mot-clé pour vous alerter quand de nouvelles offres correspondantes seront publiées.
        </p>
      </div>
    `, {
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Annuler</button>
        <button class="btn btn-primary" onclick="PageProfile.saveDiploma()">Enregistrer</button>
      `
    });
  },

  saveDiploma() {
    const user = Auth.getCurrentUser();
    const diploma = document.getElementById('edit-diploma')?.value.trim();
    if (diploma !== undefined) {
      Store.updateUser(user.id, { diploma });
      Toast.success('Profil mis à jour');
      Modal.close();
      this.render();
    }
  },

  getLikedCount(userId) {
    return Store.getApprovedOpportunities().filter(o => o.likes?.includes(userId)).length;
  }
};
