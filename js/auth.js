// ============================================
// FuturePath — Authentication Module
// ============================================

const Auth = {
  login(email, password) {
    const user = Store.getUserByEmail(email);
    if (!user) return { success: false, error: 'Aucun compte trouvé avec cet email.' };
    if (user.password !== password) return { success: false, error: 'Mot de passe incorrect.' };
    Store.setCurrentUser(user);
    return { success: true, user };
  },

  register(data) {
    if (Store.getUserByEmail(data.email)) {
      return { success: false, error: 'Un compte existe déjà avec cet email.' };
    }
    if (data.password.length < 9) {
      return { success: false, error: 'Le mot de passe doit contenir au moins 9 caractères.' };
    }
    const user = Store.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'user',
      avatar: data.name.charAt(0).toUpperCase()
    });
    Store.setCurrentUser(user);
    return { success: true, user };
  },

  logout() {
    Store.setCurrentUser(null);
    App.navigate('home');
  },

  getCurrentUser() {
    return Store.getCurrentUser();
  },

  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  isCompany() {
    const user = this.getCurrentUser();
    return user && user.role === 'company';
  },

  isUser() {
    const user = this.getCurrentUser();
    return user && user.role === 'user';
  },

  requireAuth(role = null) {
    if (!this.isLoggedIn()) {
      Toast.show('Connexion requise', 'Veuillez vous connecter pour accéder à cette page.', 'warning');
      App.navigate('login');
      return false;
    }
    if (role && this.getCurrentUser().role !== role) {
      Toast.show('Accès refusé', 'Vous n\'avez pas les permissions nécessaires.', 'error');
      App.navigate('home');
      return false;
    }
    return true;
  }
};
