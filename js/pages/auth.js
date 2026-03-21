// ============================================
// FuturePath — Auth Pages (Login / Register)
// ============================================

const PageAuth = {
  renderLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <h2>Bon retour ! 👋</h2>
          <p class="auth-subtitle">Connectez-vous à votre compte FuturePath</p>
          <form class="auth-form" onsubmit="PageAuth.handleLogin(event)">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" id="login-email" placeholder="votre@email.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Mot de passe</label>
              <input type="password" class="form-input" id="login-password" placeholder="••••••••" required>
            </div>
            <div id="login-error"></div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Se connecter</button>
          </form>
          <div class="auth-footer">
            Pas encore de compte ? <a onclick="App.navigate('register')">Créer un compte</a>
          </div>
          <div class="auth-divider">Comptes de test</div>
          <div style="display:flex;flex-direction:column;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted);">
            <span>👑 Admin: admin@futurepath.com / admin123</span>
            <span>🏢 Entreprise: contact@techvision.dz / company123</span>
            <span>👤 Utilisateur: ahmed@email.com / user123</span>
          </div>
        </div>
      </div>
    `;
  },

  renderRegister() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <h2>Créer un compte ✨</h2>
          <p class="auth-subtitle">Rejoignez FuturePath gratuitement</p>
          <form class="auth-form" onsubmit="PageAuth.handleRegister(event)">
            <div class="form-group">
              <label class="form-label">Je suis</label>
              <div class="role-selector" id="register-role-selector">
                <div class="role-option active" data-role="user" onclick="PageAuth.selectRole('user')">
                  <span class="role-option-icon">👤</span>
                  Candidat
                </div>
                <div class="role-option" data-role="company" onclick="PageAuth.selectRole('company')">
                  <span class="role-option-icon">🏢</span>
                  Entreprise
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" id="register-name-label">Nom complet</label>
              <input type="text" class="form-input" id="register-name" placeholder="Votre nom" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" id="register-email" placeholder="votre@email.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Mot de passe</label>
              <input type="password" class="form-input" id="register-password" placeholder="Minimum 6 caractères" required minlength="6">
            </div>
            <div id="register-error"></div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Créer mon compte</button>
          </form>
          <div class="auth-footer">
            Déjà un compte ? <a onclick="App.navigate('login')">Se connecter</a>
          </div>
        </div>
      </div>
    `;
    this.selectedRole = 'user';
  },

  selectedRole: 'user',

  selectRole(role) {
    this.selectedRole = role;
    document.querySelectorAll('.role-option').forEach(el => {
      el.classList.toggle('active', el.dataset.role === role);
    });
    const nameLabel = document.getElementById('register-name-label');
    const nameInput = document.getElementById('register-name');
    if (role === 'company') {
      nameLabel.textContent = 'Nom de l\'entreprise';
      nameInput.placeholder = 'Nom de votre entreprise';
    } else {
      nameLabel.textContent = 'Nom complet';
      nameInput.placeholder = 'Votre nom';
    }
  },

  handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const result = Auth.login(email, password);
    if (result.success) {
      Toast.success('Bienvenue !', `Connecté en tant que ${result.user.name}`);
      const user = result.user;
      if (user.role === 'admin') App.navigate('admin');
      else if (user.role === 'company') App.navigate('company-dashboard');
      else App.navigate('home');
    } else {
      document.getElementById('login-error').innerHTML = `<div class="form-error">${result.error}</div>`;
    }
  },

  handleRegister(e) {
    e.preventDefault();
    const data = {
      name: document.getElementById('register-name').value.trim(),
      email: document.getElementById('register-email').value.trim(),
      password: document.getElementById('register-password').value,
      role: this.selectedRole
    };
    const result = Auth.register(data);
    if (result.success) {
      Toast.success('Compte créé !', 'Bienvenue sur FuturePath 🎉');
      if (data.role === 'company') App.navigate('company-dashboard');
      else App.navigate('home');
    } else {
      document.getElementById('register-error').innerHTML = `<div class="form-error">${result.error}</div>`;
    }
  }
};
