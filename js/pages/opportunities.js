// ============================================
// FuturePath — Opportunities Listing Page
// ============================================

const PageOpportunities = {
  currentPage: 1,
  perPage: 9,

  render() {
    const app = document.getElementById('app');
    const filtered = Filters.getFiltered();
    const totalPages = Math.ceil(filtered.length / this.perPage);
    const paged = filtered.slice((this.currentPage - 1) * this.perPage, this.currentPage * this.perPage);

    app.innerHTML = `
      <section class="section" style="padding-top: var(--space-8);">
        <div class="container">
          <div class="opportunities-header">
            <div>
              <h1 style="font-size:var(--text-3xl);margin-bottom:var(--space-2);">Opportunités</h1>
              <span class="opportunities-count">${filtered.length} résultat(s) trouvé(s)</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="search-bar" style="min-width:300px;">
                <span class="search-bar-icon">🔍</span>
                <input type="text" placeholder="Rechercher une opportunité..." 
                  value="${Filters.state.search}" 
                  oninput="Filters.state.search=this.value;PageOpportunities.currentPage=1;PageOpportunities.renderResults();">
              </div>
              <select class="form-select" style="width:auto;min-width:160px;" 
                onchange="Filters.state.sort=this.value;PageOpportunities.currentPage=1;PageOpportunities.renderResults();">
                <option value="recent" ${Filters.state.sort === 'recent' ? 'selected' : ''}>Plus récentes</option>
                <option value="popular" ${Filters.state.sort === 'popular' ? 'selected' : ''}>Plus populaires</option>
              </select>
            </div>
          </div>

          <div class="opportunities-layout">
            <aside class="opportunities-sidebar" id="filters-panel"></aside>
            <div>
              <div class="opportunities-grid" id="opportunities-results"></div>
              <div id="opportunities-pagination"></div>
            </div>
          </div>
        </div>
      </section>
    `;

    Filters.render('filters-panel');
    this.renderResults();
  },

  renderResults() {
    const grid = document.getElementById('opportunities-results');
    const pagination = document.getElementById('opportunities-pagination');
    if (!grid) return;

    const filtered = Filters.getFiltered();
    const totalPages = Math.ceil(filtered.length / this.perPage);
    if (this.currentPage > totalPages) this.currentPage = 1;
    const paged = filtered.slice((this.currentPage - 1) * this.perPage, this.currentPage * this.perPage);

    // Update count
    const countEl = document.querySelector('.opportunities-count');
    if (countEl) countEl.textContent = `${filtered.length} résultat(s) trouvé(s)`;

    if (paged.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-state-icon">🔍</div>
          <h3>Aucune opportunité trouvée</h3>
          <p>Essayez de modifier vos filtres ou votre recherche</p>
          <button class="btn btn-secondary" onclick="Filters.reset();Filters.state.search='';PageOpportunities.render();">
            Réinitialiser
          </button>
        </div>
      `;
      if (pagination) pagination.innerHTML = '';
      return;
    }

    grid.innerHTML = paged.map(o => Card.render(o)).join('');

    if (pagination && totalPages > 1) {
      let pages = '';
      pages += `<button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="PageOpportunities.goTo(${this.currentPage - 1})">‹</button>`;
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
          pages += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="PageOpportunities.goTo(${i})">${i}</button>`;
        } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
          pages += `<span style="color:var(--text-muted);">...</span>`;
        }
      }
      pages += `<button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="PageOpportunities.goTo(${this.currentPage + 1})">›</button>`;
      pagination.innerHTML = `<div class="pagination">${pages}</div>`;
    } else if (pagination) {
      pagination.innerHTML = '';
    }
  },

  goTo(page) {
    this.currentPage = page;
    this.renderResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
