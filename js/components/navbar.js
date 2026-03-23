// ============================================
// FuturePath — Navbar Component
// ============================================

const Navbar = {
  render() {
    const user = Auth.getCurrentUser();
    const nav = document.getElementById('navbar');
    if (!nav) return;

    const links = [
      { label: 'Accueil', route: 'home', icon: '🏠' },
      { label: 'Opportunités', route: 'opportunities', icon: '🔍' },
    ];

    if (user) {
      if (user.role === 'company') links.push({ label: 'Mon Dashboard', route: 'company-dashboard', icon: '📊' });
      if (user.role === 'admin') links.push({ label: 'Administration', route: 'admin', icon: '⚙️' });
      if (user.role === 'user') links.push({ label: 'Mon Profil', route: 'profile', icon: '👤' });
    }

    const currentRoute = App.currentRoute || 'home';

    nav.innerHTML = `
      <div class="navbar-inner">
        <a class="navbar-brand" onclick="App.navigate('home')" style="cursor:pointer;">
          <span class="navbar-logo"><span class="text-gradient">Future</span>Path</span>
        </a>
        <div class="navbar-links" id="navbar-links">
          ${links.map(l => `
            <a class="navbar-link ${currentRoute === l.route ? 'active' : ''}"
               onclick="App.navigate('${l.route}')">${l.label}</a>
          `).join('')}
        </div>
        <div class="navbar-actions">
          ${user ? `
            <div class="navbar-notifications" onclick="Navbar.toggleNotifications()" style="position:relative;">
              <div class="navbar-icon">🔔</div>
              ${this.getUnreadCount(user.id) > 0 ? `<div class="navbar-badge">${this.getUnreadCount(user.id)}</div>` : ''}
              <div class="navbar-dropdown hidden" id="notifications-dropdown" style="width:300px; right:0;">
                <div class="navbar-dropdown-header">Notifications</div>
                <div class="notifications-list">
                  ${this.renderNotifications(user.id)}
                </div>
              </div>
            </div>
            <div class="navbar-user" onclick="Navbar.toggleDropdown()" style="position:relative;">
              <div class="navbar-user-avatar">${user.avatar || user.name.charAt(0)}</div>
              <span class="navbar-user-name">${user.name}</span>
              <div class="navbar-dropdown hidden" id="navbar-dropdown">
                ${user.role === 'user' ? `
                  <button class="navbar-dropdown-item" onclick="App.navigate('profile')">
                    👤 Mon Profil
                  </button>
                ` : ''}
                ${user.role === 'company' ? `
                  <button class="navbar-dropdown-item" onclick="App.navigate('company-dashboard')">
                    📊 Dashboard
                  </button>
                ` : ''}
                ${user.role === 'admin' ? `
                  <button class="navbar-dropdown-item" onclick="App.navigate('admin')">
                    ⚙️ Administration
                  </button>
                ` : ''}
                <div class="navbar-dropdown-divider"></div>
                <button class="navbar-dropdown-item" onclick="Auth.logout()">
                  🚪 Déconnexion
                </button>
              </div>
            </div>
          ` : `
            <button class="btn btn-ghost btn-sm" onclick="App.navigate('login')">Connexion</button>
            <button class="btn btn-primary btn-sm" onclick="App.navigate('register')">Inscription</button>
          `}
          <button class="navbar-hamburger" onclick="Navbar.toggleMobile()" id="navbar-hamburger">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    `;
  },

  getUnreadCount(userId) {
    return Store.getNotifications(userId).filter(n => !n.isRead).length;
  },

  renderNotifications(userId) {
    const notes = Store.getNotifications(userId);
    if (!notes.length) return '<div class="navbar-dropdown-item" style="color:var(--text-muted);text-align:center;">Aucune notification</div>';
    
    return notes.map(n => `
      <div class="navbar-dropdown-item ${!n.isRead ? 'unread' : ''}" onclick="Navbar.handleNoteClick('${n.id}', '${n.link}')" style="flex-direction:column;align-items:flex-start;gap:2px;">
        <div style="font-weight:600;font-size:var(--text-sm);">${n.title}</div>
        <div style="font-size:var(--text-xs);color:var(--text-secondary);">${n.message}</div>
        <div style="font-size:var(--text-xxs);color:var(--text-muted);margin-top:4px;">${Card.timeAgo(n.date)}</div>
      </div>
    `).join('');
  },

  handleNoteClick(noteId, link) {
    const user = Auth.getCurrentUser();
    if (user) {
      Store.markNotificationsRead(user.id);
      this.render();
      if (link) App.navigate(link);
    }
  },

  toggleNotifications() {
    const nd = document.getElementById('notifications-dropdown');
    const ud = document.getElementById('navbar-dropdown');
    if (nd) nd.classList.toggle('hidden');
    if (ud) ud.classList.add('hidden');
  },

  toggleDropdown() {
    const ud = document.getElementById('navbar-dropdown');
    const nd = document.getElementById('notifications-dropdown');
    if (ud) ud.classList.toggle('hidden');
    if (nd) nd.classList.add('hidden');
  },

  toggleMobile() {
    const links = document.getElementById('navbar-links');
    if (links) links.classList.toggle('open');
  },

  closeAll() {
    const ud = document.getElementById('navbar-dropdown');
    const nd = document.getElementById('notifications-dropdown');
    if (ud) ud.classList.add('hidden');
    if (nd) nd.classList.add('hidden');
    const links = document.getElementById('navbar-links');
    if (links) links.classList.remove('open');
  }
};

// Close dropdowns on click outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.navbar-user') && !e.target.closest('.navbar-hamburger') && !e.target.closest('.navbar-notifications')) {
    Navbar.closeAll();
  }
});
