// ============================================
// FuturePath — Home Page
// ============================================

const PageHome = {
  render() {
    const app = document.getElementById('app');
    const stats = Store.getStats();

    app.innerHTML = `
      <!-- Hero -->
      <section class="hero">
        <div class="container">
          <h1 class="hero-title animate-fade-in-up">
            Votre avenir commence <span class="text-gradient">ici</span>
          </h1>
          <p class="hero-subtitle animate-fade-in-up delay-1">
            Découvrez des milliers d'opportunités — emplois, stages, bourses, événements et formations — 
            centralisées en un seul endroit pour accélérer votre carrière.
          </p>
          <div class="hero-actions animate-fade-in-up delay-2">
            <button class="btn btn-primary btn-lg" onclick="App.navigate('opportunities')">
              🔍 Explorer les opportunités
            </button>
            ${!Auth.isLoggedIn() ? `
              <button class="btn btn-secondary btn-lg" onclick="App.navigate('register')">
                ✨ Créer un compte gratuit
              </button>
            ` : ''}
          </div>
          <div class="hero-stats animate-fade-in-up delay-3">
            <div>
              <div class="hero-stat-value text-gradient">${stats.totalOpportunities}+</div>
              <div class="hero-stat-label">Opportunités</div>
            </div>
            <div>
              <div class="hero-stat-value text-gradient">${stats.totalCompanies}+</div>
              <div class="hero-stat-label">Entreprises</div>
            </div>
            <div>
              <div class="hero-stat-value text-gradient">${stats.totalUsers}+</div>
              <div class="hero-stat-label">Utilisateurs</div>
            </div>
            <div>
              <div class="hero-stat-value text-gradient">${stats.totalApplications}+</div>
              <div class="hero-stat-label">Candidatures</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories -->
      <section class="section">
        <div class="container">
          <h2 class="section-title text-center animate-fade-in-up">Explorez par catégorie</h2>
          <p class="section-subtitle text-center animate-fade-in-up delay-1">
            Trouvez l'opportunité qui correspond à vos ambitions
          </p>
          <div class="categories-grid">
            ${this.renderCategories(stats)}
          </div>
        </div>
      </section>

      <!-- Popular Opportunities -->
      <section class="section" style="background: var(--bg-secondary);">
        <div class="container">
          <h2 class="section-title text-center animate-fade-in-up">Offres populaires</h2>
          <p class="section-subtitle text-center animate-fade-in-up delay-1">
            Les opportunités les plus appréciées par la communauté
          </p>
          <div class="opportunities-grid" id="popular-grid"></div>
          <div class="text-center" style="margin-top: var(--space-8);">
            <button class="btn btn-primary btn-lg" onclick="App.navigate('opportunities')">
              Voir toutes les opportunités →
            </button>
          </div>
        </div>
      </section>

      <!-- CTA -->
      ${!Auth.isLoggedIn() ? `
      <section class="section">
        <div class="container text-center">
          <h2 class="section-title animate-fade-in-up">Vous êtes une entreprise ?</h2>
          <p class="section-subtitle animate-fade-in-up delay-1">
            Publiez vos offres et touchez des milliers de candidats qualifiés
          </p>
          <button class="btn btn-accent btn-lg animate-fade-in-up delay-2" onclick="App.navigate('register')">
            🏢 Publier une offre gratuitement
          </button>
        </div>
      </section>
      ` : ''}

      ${this.renderFooter()}
    `;

    this.renderPopular();
  },

  renderCategories(stats) {
    const cats = [
      { key: 'emploi', icon: '💼', name: 'Emploi', count: stats.byCategory.emploi, color: 'var(--cat-emploi)' },
      { key: 'stage', icon: '🎓', name: 'Stages', count: stats.byCategory.stage, color: 'var(--cat-stage)' },
      { key: 'bourse', icon: '🏅', name: 'Bourses', count: stats.byCategory.bourse, color: 'var(--cat-bourse)' },
      { key: 'evenement', icon: '📅', name: 'Événements', count: stats.byCategory.evenement, color: 'var(--cat-event)' },
      { key: 'formation', icon: '📚', name: 'Formations', count: stats.byCategory.formation, color: 'var(--cat-formation)' },
    ];
    return cats.map((c, i) => `
      <div class="category-card animate-fade-in-up delay-${i + 1}" onclick="Filters.state.categories=['${c.key}'];App.navigate('opportunities');" style="border-color: ${c.color}20;">
        <div class="category-icon">${c.icon}</div>
        <div class="category-name">${c.name}</div>
        <div class="category-count">${c.count} offre(s)</div>
      </div>
    `).join('');
  },

  renderPopular() {
    const grid = document.getElementById('popular-grid');
    if (!grid) return;
    const opps = Store.getApprovedOpportunities()
      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
      .slice(0, 6);
    grid.innerHTML = opps.length ? opps.map(o => Card.render(o)).join('') :
      '<div class="empty-state"><div class="empty-state-icon">📭</div><h3>Aucune offre pour le moment</h3></div>';
  },

  renderFooter() {
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <h3><span class="text-gradient">Future</span>Path</h3>
              <p>La plateforme de référence pour centraliser toutes les opportunités professionnelles, académiques et événementielles.</p>
            </div>
            <div class="footer-col">
              <h4>Navigation</h4>
              <a onclick="App.navigate('home')">Accueil</a>
              <a onclick="App.navigate('opportunities')">Opportunités</a>
            </div>
            <div class="footer-col">
              <h4>Catégories</h4>
              <a onclick="Filters.state.categories=['emploi'];App.navigate('opportunities')">Emploi</a>
              <a onclick="Filters.state.categories=['stage'];App.navigate('opportunities')">Stages</a>
              <a onclick="Filters.state.categories=['bourse'];App.navigate('opportunities')">Bourses</a>
              <a onclick="Filters.state.categories=['formation'];App.navigate('opportunities')">Formations</a>
            </div>
            <div class="footer-col">
              <h4>Compte</h4>
              <a onclick="App.navigate('login')">Connexion</a>
              <a onclick="App.navigate('register')">Inscription</a>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© 2026 FuturePath. Tous droits réservés.</span>
            <span>Fait avec ❤️ en Algérie</span>
          </div>
        </div>
      </footer>
    `;
  }
};
