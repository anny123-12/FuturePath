// ============================================
// FuturePath — Company Dashboard
// ============================================

const PageCompanyDashboard = {
  render() {
    if (!Auth.requireAuth('company')) return;
    const user = Auth.getCurrentUser();
    const myOpps = Store.getOpportunitiesByCompany(user.id);
    const approved = myOpps.filter(o => o.status === 'approved');
    const pending = myOpps.filter(o => o.status === 'pending');
    const rejected = myOpps.filter(o => o.status === 'rejected');
    const totalApplicants = myOpps.reduce((s, o) => s + (o.applicants?.length || 0), 0);

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="dashboard">
        <div class="container">
          <div class="dashboard-header">
            <h1 class="dashboard-title">Tableau de bord</h1>
            <p class="dashboard-subtitle">Bienvenue, ${user.name} 🏢</p>
          </div>

          <div class="dashboard-stats">
            <div class="stat-card"><div class="stat-card-value" style="color:var(--primary-300);">${myOpps.length}</div><div class="stat-card-label">Total offres</div></div>
            <div class="stat-card"><div class="stat-card-value" style="color:var(--success-text);">${approved.length}</div><div class="stat-card-label">Approuvées</div></div>
            <div class="stat-card"><div class="stat-card-value" style="color:var(--pending-text);">${pending.length}</div><div class="stat-card-label">En attente</div></div>
            <div class="stat-card"><div class="stat-card-value" style="color:var(--accent-300);">${totalApplicants}</div><div class="stat-card-label">Candidats</div></div>
          </div>

          <div class="dashboard-section">
            <div class="dashboard-section-header">
              <h2>Mes offres</h2>
              <button class="btn btn-primary" onclick="PageCompanyDashboard.showCreateForm()">+ Nouvelle offre</button>
            </div>

            ${myOpps.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>Aucune offre publiée</h3>
                <p>Créez votre première offre pour toucher des candidats qualifiés.</p>
                <button class="btn btn-primary" onclick="PageCompanyDashboard.showCreateForm()">Publier une offre</button>
              </div>
            ` : `
              <div class="table-wrapper">
                <table class="data-table">
                  <thead><tr><th>Titre</th><th>Catégorie</th><th>Statut</th><th>Candidats</th><th>Likes</th><th>Actions</th></tr></thead>
                  <tbody>
                    ${myOpps.map(o => `
                      <tr>
                        <td><strong>${o.title}</strong><br><span style="font-size:var(--text-xs);color:var(--text-muted);">${Card.timeAgo(o.createdAt)}</span></td>
                        <td><span class="badge badge-${o.category}">${Card.categoryLabels[o.category]}</span></td>
                        <td><span class="badge badge-${o.status}">${o.status === 'approved' ? '✓ Approuvée' : o.status === 'pending' ? '⏳ En attente' : '✕ Rejetée'}</span></td>
                        <td>${o.applicants?.length || 0}</td>
                        <td>❤️ ${o.likes?.length || 0}</td>
                        <td>
                          <div class="flex gap-2">
                            <button class="btn btn-ghost btn-sm" onclick="App.navigate('detail/${o.id}')">👁</button>
                            <button class="btn btn-danger btn-sm" onclick="PageCompanyDashboard.deleteOffer('${o.id}')">🗑</button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  showCreateForm() {
    Modal.show('Publier une nouvelle offre', `
      <form id="create-opp-form" class="auth-form" style="gap:var(--space-4);">
        <div class="form-group">
          <label class="form-label">Titre de l'offre *</label>
          <input type="text" class="form-input" id="opp-title" required placeholder="Ex: Développeur Full Stack">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Catégorie *</label>
            <select class="form-select" id="opp-category" required>
              <option value="emploi">💼 Emploi</option>
              <option value="stage">🎓 Stage</option>
              <option value="bourse">🏅 Bourse</option>
              <option value="evenement">📅 Événement</option>
              <option value="formation">📚 Formation</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Type</label>
            <input type="text" class="form-input" id="opp-type" placeholder="Ex: CDI, CDD, Stage...">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Localisation</label>
            <input type="text" class="form-input" id="opp-location" placeholder="Ex: Alger">
          </div>
          <div class="form-group">
            <label class="form-label">Salaire / Budget</label>
            <input type="text" class="form-input" id="opp-salary" placeholder="Ex: 150 000 DZD">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Lien de postulation *</label>
          <input type="url" class="form-input" id="opp-apply-url" required placeholder="https://exemple.com/postuler">
        </div>
        <div class="form-group">
          <label class="form-label">Description *</label>
          <textarea class="form-textarea" id="opp-description" required placeholder="Décrivez l'opportunité en détail..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Exigences (une par ligne)</label>
          <textarea class="form-textarea" id="opp-requirements" placeholder="3 ans d'expérience\nMaîtrise de React\n..." style="min-height:80px;"></textarea>
        </div>
      </form>
    `, {
      wide: true,
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Annuler</button>
        <button class="btn btn-primary" onclick="PageCompanyDashboard.submitOffer()">📤 Soumettre pour vérification</button>
      `
    });
  },

  submitOffer() {
    const title = document.getElementById('opp-title')?.value.trim();
    const description = document.getElementById('opp-description')?.value.trim();
    const applyUrl = document.getElementById('opp-apply-url')?.value.trim();
    if (!title || !description || !applyUrl) {
      Toast.error('Champs requis', 'Le titre, la description et le lien de postulation sont obligatoires.');
      return;
    }
    const user = Auth.getCurrentUser();
    const reqs = document.getElementById('opp-requirements')?.value.trim();
    Store.createOpportunity({
      title,
      company: user.name,
      companyId: user.id,
      category: document.getElementById('opp-category')?.value || 'emploi',
      type: document.getElementById('opp-type')?.value.trim() || '',
      location: document.getElementById('opp-location')?.value.trim() || '',
      salary: document.getElementById('opp-salary')?.value.trim() || '',
      applyUrl,
      description,
      requirements: reqs ? reqs.split('\n').filter(r => r.trim()) : []
    });
    Modal.close();
    Toast.success('Offre soumise !', 'Votre offre sera publiée après vérification par un administrateur.');
    this.render();
  },

  deleteOffer(oppId) {
    Modal.confirm('Supprimer cette offre ?', 'Cette action est irréversible.', () => {
      Store.deleteOpportunity(oppId);
      Toast.success('Offre supprimée');
      this.render();
    });
  }
};
