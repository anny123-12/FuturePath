// ============================================
// FuturePath — SPA Router & App Init
// ============================================

const App = {
  currentRoute: 'home',

  init() {
    Store.initializeData();
    this.handleRoute();
    window.addEventListener('hashchange', () => this.handleRoute());
  },

  navigate(route) {
    window.location.hash = '#/' + route;
  },

  handleRoute() {
    const hash = window.location.hash.slice(2) || 'home';
    this.currentRoute = hash;
    Navbar.render();
    Navbar.closeAll();
    window.scrollTo(0, 0);

    if (hash === 'home') {
      PageHome.render();
    } else if (hash === 'opportunities') {
      PageOpportunities.render();
    } else if (hash.startsWith('detail/')) {
      const id = hash.split('/')[1];
      PageDetail.render(id);
    } else if (hash === 'login') {
      PageAuth.renderLogin();
    } else if (hash === 'register') {
      PageAuth.renderRegister();
    } else if (hash === 'company-dashboard') {
      PageCompanyDashboard.render();
    } else if (hash === 'admin') {
      PageAdmin.render();
    } else if (hash === 'profile') {
      PageProfile.render();
    } else {
      PageHome.render();
    }
  },

  renderCurrentPage() {
    this.handleRoute();
  }
};

// Boot the app
document.addEventListener('DOMContentLoaded', () => App.init());
