// ============================================
// FuturePath — Admin Dashboard
// ============================================

const PageAdmin = {
  activeTab: 'pending',

  render() {
    if (!Auth.requireAuth('admin')) return;
    const stats = Store.getStats();
    const allOpps = Store.getOpportunities();
    const pending = allOpps.filter(o => o.status === 'pending');
    const approved = allOpps.filter(o => o.status === 'approved');
    const rejected = allOpps.filter(o => o.status === 'rejected');
    const users = Store.getUsers();

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="dashboard">
        <div class="container">
          <div class="dashboard-header">
            <h1 class="dashboard-title">Administration</h1>
            <p class="dashboard-subtitle">Panneau de contrôle FuturePath ⚙️</p>
          </div>

          <div class="dashboard-stats">
            <div class="stat-card"><div class="stat-card-value" style="color:var(--primary-300);">${stats.totalOpportunities}</div><div class="stat-card-label">Offres actives</div></div>
            <div class="stat-card"><div class="stat-card-value" style="color:var(--warning-text);">${stats.totalPending}</div><div class="stat-card-label">En attente</div></div>
            <div class="stat-card"><div class="stat-card-value" style="color:var(--accent-300);">${stats.totalUsers}</div><div class="stat-card-label">Utilisateurs</div></div>
            <div class="stat-card"><div class="stat-card-value" style="color:var(--success-text);">${stats.totalCompanies}</div><div class="stat-card-label">Entreprises</div></div>
          </div>

          <div class="tabs">
            <button class="tab ${this.activeTab === 'pending' ? 'active' : ''}" onclick="PageAdmin.switchTab('pending')">
              ⏳ En attente (${pending.length})
            </button>
            <button class="tab ${this.activeTab === 'approved' ? 'active' : ''}" onclick="PageAdmin.switchTab('approved')">
              ✓ Approuvées (${approved.length})
            </button>
            <button class="tab ${this.activeTab === 'rejected' ? 'active' : ''}" onclick="PageAdmin.switchTab('rejected')">
              ✕ Rejetées (${rejected.length})
            </button>
            <button class="tab ${this.activeTab === 'users' ? 'active' : ''}" onclick="PageAdmin.switchTab('users')">
              👥 Utilisateurs (${users.length})
            </button>
          </div>

          <div id="admin-content"></div>
        </div>
      </div>
    `;
    this.renderTab();
  },

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab:nth-child(${['pending','approved','rejected','users'].indexOf(tab) + 1})`).classList.add('active');
    this.renderTab();
  },

  renderTab() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    if (this.activeTab === 'users') {
      this.renderUsers(content);
      return;
    }

    const opps = Store.getOpportunities().filter(o => o.status === this.activeTab);
    if (!opps.length) {
      content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">${this.activeTab === 'pending' ? '✅' : '📭'}</div><h3>Aucune offre ${this.activeTab === 'pending' ? 'en attente' : this.activeTab === 'approved' ? 'approuvée' : 'rejetée'}</h3></div>`;
      return;
    }

    content.innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Offre</th><th>Entreprise</th><th>Catégorie</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            ${opps.map(o => `
              <tr>
                <td>
                  <strong onclick="PageAdmin.previewOffer('${o.id}')" style="cursor:pointer;color:var(--primary-300);">${o.title}</strong>
                  <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    ${o.description}
                  </div>
                </td>
                <td>${o.company}</td>
                <td><span class="badge badge-${o.category}">${Card.categoryLabels[o.category]}</span></td>
                <td style="white-space:nowrap;">${Card.timeAgo(o.createdAt)}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-ghost btn-sm" onclick="PageAdmin.previewOffer('${o.id}')" title="Aperçu">👁</button>
                    ${this.activeTab === 'pending' ? `
                      <button class="btn btn-success btn-sm" onclick="PageAdmin.approve('${o.id}')" title="Approuver">✓</button>
                      <button class="btn btn-danger btn-sm" onclick="PageAdmin.reject('${o.id}')" title="Rejeter">✕</button>
                    ` : ''}
                    ${this.activeTab === 'rejected' ? `
                      <button class="btn btn-success btn-sm" onclick="PageAdmin.approve('${o.id}')" title="Approuver">✓</button>
                    ` : ''}
                    ${this.activeTab === 'approved' ? `
                      <button class="btn btn-danger btn-sm" onclick="PageAdmin.reject('${o.id}')" title="Rejeter">✕</button>
                    ` : ''}
                    <button class="btn btn-danger btn-sm" onclick="PageAdmin.deleteOffer('${o.id}')" title="Supprimer">🗑</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderUsers(content) {
    const users = Store.getUsers();
    content.innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Inscrit</th></tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td><div class="flex items-center gap-3"><div class="navbar-user-avatar">${u.avatar || u.name.charAt(0)}</div><strong>${u.name}</strong></div></td>
                <td>${u.email}</td>
                <td><span class="badge ${u.role === 'admin' ? 'badge-emploi' : u.role === 'company' ? 'badge-stage' : 'badge-formation'}">${u.role === 'admin' ? '👑 Admin' : u.role === 'company' ? '🏢 Entreprise' : '👤 Utilisateur'}</span></td>
                <td>${Card.timeAgo(u.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  previewOffer(oppId) {
    const opp = Store.getOpportunityById(oppId);
    if (!opp) return;
    Modal.show(opp.title, `
      <div style="display:flex;flex-direction:column;gap:var(--space-4);">
        <div class="flex items-center gap-3">
          <div class="opp-card-avatar">${opp.company?.charAt(0)}</div>
          <div><strong>${opp.company}</strong><br><span style="font-size:var(--text-xs);color:var(--text-muted);">📍 ${opp.location}</span></div>
        </div>
        <div class="flex gap-2">
          <span class="badge badge-${opp.category}">${Card.categoryLabels[opp.category]}</span>
          ${opp.type ? `<span class="badge badge-info">${opp.type}</span>` : ''}
          ${opp.salary ? `<span class="badge" style="background:var(--bg-glass);border:1px solid var(--border-subtle);">💰 ${opp.salary}</span>` : ''}
        </div>
        ${opp.applyUrl ? `
          <div style="background:var(--bg-glass);padding:var(--space-3);border-radius:var(--radius-md);border:1px solid var(--border-subtle);word-break:break-all;">
            <h4 style="margin-bottom:var(--space-1);font-size:var(--text-xs);text-transform:uppercase;color:var(--text-muted);">Lien de postulation</h4>
            <a href="${opp.applyUrl}" target="_blank" style="color:var(--primary-300);font-size:var(--text-sm);">${opp.applyUrl}</a>
          </div>
        ` : ''}
        <div><h4 style="margin-bottom:var(--space-2);">Description</h4><p style="color:var(--text-secondary);font-size:var(--text-sm);line-height:1.6;">${opp.description}</p></div>
        ${opp.requirements?.length ? `<div><h4 style="margin-bottom:var(--space-2);">Exigences</h4><ul style="color:var(--text-secondary);font-size:var(--text-sm);margin-left:var(--space-4);">${opp.requirements.map(r => `<li style="padding:2px 0;">▹ ${r}</li>`).join('')}</ul></div>` : ''}
      </div>
    `, {
      wide: true,
      footer: opp.status === 'pending' ? `
        <button class="btn btn-danger" onclick="PageAdmin.reject('${opp.id}');Modal.close();">✕ Rejeter</button>
        <button class="btn btn-success" onclick="PageAdmin.approve('${opp.id}');Modal.close();">✓ Approuver</button>
      ` : ''
    });
  },

  approve(oppId) {
    Store.updateOpportunity(oppId, { status: 'approved' });
    Toast.success('Offre approuvée ✓', 'L\'offre est maintenant visible par tous.');
    this.render();
  },

  reject(oppId) {
    Store.updateOpportunity(oppId, { status: 'rejected' });
    Toast.warning('Offre rejetée', 'L\'offre ne sera pas publiée.');
    this.render();
  },

  deleteOffer(oppId) {
    Modal.confirm('Supprimer définitivement ?', 'Cette action est irréversible.', () => {
      Store.deleteOpportunity(oppId);
      Toast.success('Offre supprimée');
      this.render();
    });
  }
};
