// ============================================
// FuturePath — Data Store (localStorage)
// ============================================

const Store = {
  KEYS: {
    USERS: 'fp_users',
    OPPORTUNITIES: 'fp_opportunities',
    CURRENT_USER: 'fp_current_user',
    INITIALIZED: 'fp_initialized'
  },

  // ---- Helpers ----
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  },
  set(key, data) { localStorage.setItem(key, JSON.stringify(data)); },
  generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 9); },

  // ---- Users ----
  getUsers() { return this.get(this.KEYS.USERS); },
  getUserById(id) { return this.getUsers().find(u => u.id === id); },
  getUserByEmail(email) { return this.getUsers().find(u => u.email === email); },
  createUser(userData) {
    const users = this.getUsers();
    const user = { id: this.generateId(), savedOffers: [], applications: [], createdAt: new Date().toISOString(), ...userData };
    users.push(user);
    this.set(this.KEYS.USERS, users);
    return user;
  },
  updateUser(id, updates) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) { users[idx] = { ...users[idx], ...updates }; this.set(this.KEYS.USERS, users); }
    return users[idx];
  },

  // ---- Current User Session ----
  getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.CURRENT_USER)); } catch { return null; }
  },
  setCurrentUser(user) {
    if (user) {
      const { password, ...safeUser } = user;
      localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(safeUser));
    } else {
      localStorage.removeItem(this.KEYS.CURRENT_USER);
    }
  },

  // ---- Opportunities ----
  getOpportunities() { return this.get(this.KEYS.OPPORTUNITIES); },
  getApprovedOpportunities() { return this.getOpportunities().filter(o => o.status === 'approved'); },
  getPendingOpportunities() { return this.getOpportunities().filter(o => o.status === 'pending'); },
  getOpportunityById(id) { return this.getOpportunities().find(o => o.id === id); },
  getOpportunitiesByCompany(companyId) { return this.getOpportunities().filter(o => o.companyId === companyId); },

  createOpportunity(data) {
    const opps = this.getOpportunities();
    const opp = {
      id: this.generateId(),
      status: 'pending',
      likes: [],
      applicants: [],
      createdAt: new Date().toISOString(),
      ...data
    };
    opps.push(opp);
    this.set(this.KEYS.OPPORTUNITIES, opps);
    return opp;
  },

  updateOpportunity(id, updates) {
    const opps = this.getOpportunities();
    const idx = opps.findIndex(o => o.id === id);
    if (idx !== -1) { opps[idx] = { ...opps[idx], ...updates }; this.set(this.KEYS.OPPORTUNITIES, opps); }
    return opps[idx];
  },

  deleteOpportunity(id) {
    const opps = this.getOpportunities().filter(o => o.id !== id);
    this.set(this.KEYS.OPPORTUNITIES, opps);
  },

  // ---- Like / Apply ----
  toggleLike(oppId, userId) {
    const opp = this.getOpportunityById(oppId);
    if (!opp) return false;
    const idx = opp.likes.indexOf(userId);
    if (idx === -1) { opp.likes.push(userId); } else { opp.likes.splice(idx, 1); }
    this.updateOpportunity(oppId, { likes: opp.likes });
    return idx === -1; // true if now liked
  },

  applyToOpportunity(oppId, userId, coverLetter = '') {
    const opp = this.getOpportunityById(oppId);
    if (!opp) return false;
    if (opp.applicants.find(a => a.userId === userId)) return false;
    opp.applicants.push({ userId, coverLetter, appliedAt: new Date().toISOString(), status: 'pending' });
    this.updateOpportunity(oppId, { applicants: opp.applicants });

    const user = this.getUserById(userId);
    if (user) {
      const apps = user.applications || [];
      apps.push({ oppId, appliedAt: new Date().toISOString(), status: 'pending' });
      this.updateUser(userId, { applications: apps });
    }
    return true;
  },

  toggleSaveOffer(userId, oppId) {
    const user = this.getUserById(userId);
    if (!user) return false;
    const saved = user.savedOffers || [];
    const idx = saved.indexOf(oppId);
    if (idx === -1) { saved.push(oppId); } else { saved.splice(idx, 1); }
    this.updateUser(userId, { savedOffers: saved });
    this.setCurrentUser(this.getUserById(userId));
    return idx === -1;
  },

  // ---- Stats ----
  getStats() {
    const opps = this.getOpportunities();
    const users = this.getUsers();
    return {
      totalOpportunities: opps.filter(o => o.status === 'approved').length,
      totalPending: opps.filter(o => o.status === 'pending').length,
      totalUsers: users.filter(u => u.role === 'user').length,
      totalCompanies: users.filter(u => u.role === 'company').length,
      totalApplications: opps.reduce((sum, o) => sum + (o.applicants?.length || 0), 0),
      byCategory: {
        emploi: opps.filter(o => o.category === 'emploi' && o.status === 'approved').length,
        stage: opps.filter(o => o.category === 'stage' && o.status === 'approved').length,
        bourse: opps.filter(o => o.category === 'bourse' && o.status === 'approved').length,
        evenement: opps.filter(o => o.category === 'evenement' && o.status === 'approved').length,
        formation: opps.filter(o => o.category === 'formation' && o.status === 'approved').length,
      }
    };
  },

  // ---- Seed Data ----
  initializeData() {
    if (localStorage.getItem(this.KEYS.INITIALIZED)) return;

    // Admin account
    this.createUser({
      name: 'Administrateur', email: 'admin@futurepath.com',
      password: 'admin123', role: 'admin', avatar: 'A'
    });

    // Sample companies
    const c1 = this.createUser({ name: 'TechVision Algérie', email: 'contact@techvision.dz', password: 'company123', role: 'company', avatar: 'T' });
    const c2 = this.createUser({ name: 'DataFlow Solutions', email: 'rh@dataflow.dz', password: 'company123', role: 'company', avatar: 'D' });
    const c3 = this.createUser({ name: 'GreenEnergy Corp', email: 'jobs@greenenergy.dz', password: 'company123', role: 'company', avatar: 'G' });
    const c4 = this.createUser({ name: 'MediCare Plus', email: 'recrutement@medicare.dz', password: 'company123', role: 'company', avatar: 'M' });
    const c5 = this.createUser({ name: 'FinStart Academy', email: 'info@finstart.dz', password: 'company123', role: 'company', avatar: 'F' });

    // Sample user
    this.createUser({ name: 'Ahmed Benali', email: 'ahmed@email.com', password: 'user123', role: 'user', avatar: 'A' });

    const opportunities = [
      { title: 'Développeur Full Stack Senior', company: c1.name, companyId: c1.id, category: 'emploi', type: 'CDI', location: 'Alger', salary: '150 000 - 200 000 DZD', applyUrl: 'https://techvision.dz/jobs/java-dev', description: 'Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe innovation. Vous travaillerez sur des projets web modernes utilisant React, Node.js et les technologies cloud.', requirements: ['3+ ans d\'expérience en développement web', 'Maîtrise de React.js et Node.js', 'Expérience avec les bases de données SQL et NoSQL', 'Connaissances en CI/CD et DevOps', 'Capacité à travailler en équipe agile'], status: 'approved' },
      { title: 'Stage en Data Science', company: c2.name, companyId: c2.id, category: 'stage', type: 'Stage', location: 'Oran', salary: '30 000 DZD/mois', applyUrl: 'https://dataflow.dz/internships/ds', description: 'Offre de stage de 6 mois en Data Science. Vous participerez à des projets d\'analyse de données et de machine learning au sein de notre équipe R&D.', requirements: ['Étudiant en informatique ou mathématiques', 'Connaissances en Python et statistiques', 'Notions de Machine Learning', 'Motivation et curiosité'], status: 'approved' },
      { title: 'Bourse d\'Excellence Universitaire 2026', company: c5.name, companyId: c5.id, category: 'bourse', type: 'Bourse', location: 'National', salary: '500 000 DZD/an', applyUrl: 'https://finstart.dz/scholarships/2026', description: 'Programme de bourses d\'excellence pour les étudiants brillants souhaitant poursuivre leurs études supérieures en finance, technologie ou sciences de l\'ingénieur.', requirements: ['Moyenne générale supérieure à 14/20', 'Lettre de motivation', 'Projet professionnel clair', 'Engagement communautaire apprécié'], status: 'approved' },
      { title: 'Conférence Tech Innovation 2026', company: c1.name, companyId: c1.id, category: 'evenement', type: 'Événement', location: 'Alger', salary: 'Gratuit', applyUrl: 'https://techvision.dz/events/tech-2026', description: 'Grande conférence annuelle sur l\'innovation technologique. Networking, workshops et présentations par des experts internationaux. Plus de 500 participants attendus.', requirements: ['Inscription obligatoire', 'Ouvert à tous les professionnels IT', 'Places limitées à 500 participants'], status: 'approved' },
      { title: 'Formation Certifiante en Cybersécurité', company: c2.name, companyId: c2.id, category: 'formation', type: 'Formation', location: 'En ligne', salary: '45 000 DZD', applyUrl: 'https://dataflow.dz/academy/cyber', description: 'Formation intensive de 3 mois en cybersécurité avec certification reconnue internationalement. Cours en ligne avec labs pratiques.', requirements: ['Bases en réseaux informatiques', 'Connaissances en systèmes d\'exploitation', 'Disponibilité de 15h/semaine', 'Ordinateur avec connexion internet'], status: 'approved' },
      { title: 'Ingénieur DevOps', company: c3.name, companyId: c3.id, category: 'emploi', type: 'CDI', location: 'Constantine', salary: '180 000 DZD', applyUrl: 'https://greenenergy.dz/careers/devops', description: 'Rejoignez notre équipe infrastructure pour automatiser et optimiser nos processus de déploiement. Environnement cloud-native avec Kubernetes et AWS.', requirements: ['2+ ans en DevOps/SRE', 'Maîtrise de Docker et Kubernetes', 'Expérience AWS ou Azure', 'Scripting Python/Bash'], status: 'approved' },
      { title: 'Stage Marketing Digital', company: c4.name, companyId: c4.id, category: 'stage', type: 'Stage', location: 'Alger', salary: '25 000 DZD/mois', applyUrl: 'https://medicare.dz/hr/mkt-intern', description: 'Stage de 4 mois au sein du département marketing. Vous participerez à la gestion des réseaux sociaux et aux campagnes publicitaires digitales.', requirements: ['Étudiant en communication ou marketing', 'Maîtrise des réseaux sociaux', 'Créativité et sens de l\'initiative', 'Bon niveau en français et arabe'], status: 'approved' },
      { title: 'Bourse de Recherche Doctorale', company: c5.name, companyId: c5.id, category: 'bourse', type: 'Bourse', location: 'International', salary: '800 000 DZD/an', applyUrl: 'https://finstart.dz/phd/scholarship', description: 'Bourse complète pour doctorants en intelligence artificielle. Couvre frais de scolarité, logement et allocation mensuelle.', requirements: ['Master en informatique ou domaine connexe', 'Publication scientifique souhaitée', 'Projet de recherche en IA', 'Score TOEFL/IELTS requis'], status: 'approved' },
      { title: 'Hackathon Green Tech', company: c3.name, companyId: c3.id, category: 'evenement', type: 'Événement', location: 'Oran', salary: 'Gratuit', applyUrl: 'https://greenenergy.dz/events/hackathon', description: 'Hackathon de 48h sur le thème des technologies vertes. Prix total de 2 000 000 DZD pour les 3 meilleures équipes. Mentoring par des experts de l\'industrie.', requirements: ['Équipes de 3 à 5 personnes', 'Prototype fonctionnel attendu', 'Thème: solutions éco-responsables'], status: 'approved' },
      { title: 'Formation Cloud AWS', company: c2.name, companyId: c2.id, category: 'formation', type: 'Formation', location: 'Alger', salary: '60 000 DZD', applyUrl: 'https://dataflow.dz/academy/aws', description: 'Préparation à la certification AWS Solutions Architect. 2 mois de formation intensive avec projets pratiques et examen blanc inclus.', requirements: ['Bases en développement web', 'Notions de réseaux', 'Engagement sur 2 mois', 'PC portable requis'], status: 'approved' },
      { title: 'Designer UX/UI Junior', company: c1.name, companyId: c1.id, category: 'emploi', type: 'CDD', location: 'Alger', salary: '120 000 DZD', applyUrl: 'https://techvision.dz/jobs/ui-designer', description: 'Poste en CDD de 12 mois pour un designer UX/UI passionné. Travail sur des applications mobiles et web innovantes.', requirements: ['Portfolio design requis', 'Maîtrise de Figma', 'Connaissances en design systems', 'Sens de l\'esthétique et de l\'utilisabilité'], status: 'approved' },
      { title: 'Analyste Données Santé', company: c4.name, companyId: c4.id, category: 'emploi', type: 'CDI', location: 'burundi', salary: '160 000 DZD', applyUrl: 'https://medicare.dz/hr/data-health', description: 'Poste d\'analyste de données dans le secteur de la santé. Vous analyserez les données patients pour améliorer la qualité des soins et optimiser les processus.', requirements: ['Formation en statistiques ou data science', 'Expérience en analyse de données', 'Connaissances secteur santé appréciées', 'SQL et Python obligatoires'], status: 'pending' },
      { title: 'Workshop Intelligence Artificielle', company: c2.name, companyId: c2.id, category: 'formation', type: 'Workshop', location: 'En ligne', salary: 'Gratuit', applyUrl: 'https://dataflow.dz/events/ia-workshop', description: 'Workshop gratuit d\'initiation à l\'intelligence artificielle. Apprenez les fondamentaux du deep learning en une journée avec des exercices pratiques.', requirements: ['Connaissances basiques en programmation', 'Python recommandé', 'Inscription limitée à 100 places'], status: 'pending' },
    ];

    opportunities.forEach(opp => this.createOpportunity(opp));
    localStorage.setItem(this.KEYS.INITIALIZED, 'true');
  }
};
