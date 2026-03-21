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

  toggleDropdown() {
    const dd = document.getElementById('navbar-dropdown');
    if (dd) dd.classList.toggle('hidden');
  },

  toggleMobile() {
    const links = document.getElementById('navbar-links');
    if (links) links.classList.toggle('open');
  },

  closeAll() {
    const dd = document.getElementById('navbar-dropdown');
    if (dd) dd.classList.add('hidden');
    const links = document.getElementById('navbar-links');
    if (links) links.classList.remove('open');
  }
};

// Close dropdowns on click outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.navbar-user') && !e.target.closest('.navbar-hamburger')) {
    Navbar.closeAll();
  }
});
