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

  // ---- Notifications & Smart Alerts ----
  getNotifications(userId) {
    const user = this.getUserById(userId);
    return user?.notifications || [];
  },

  addNotification(userId, notification) {
    const user = this.getUserById(userId);
    if (!user) return;
    const notes = user.notifications || [];
    notes.unshift({
      id: this.generateId(),
      date: new Date().toISOString(),
      isRead: false,
      ...notification
    });
    this.updateUser(userId, { notifications: notes });
    // Update session if it's the current user
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(this.getUserById(userId));
    }
  },

  markNotificationsRead(userId) {
    const user = this.getUserById(userId);
    if (!user) return;
    const notes = (user.notifications || []).map(n => ({ ...n, isRead: true }));
    this.updateUser(userId, { notifications: notes });
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(this.getUserById(userId));
    }
  },

  triggerAlertsForOpportunity(oppId) {
    const opp = this.getOpportunityById(oppId);
    if (!opp || opp.status !== 'approved') return;

    const users = this.getUsers().filter(u => u.role === 'user' && u.diploma);
    const keywords = [opp.title, opp.description, ...(opp.requirements || [])]
      .join(' ')
      .toLowerCase();

    users.forEach(user => {
      const diploma = user.diploma.toLowerCase();
      // Simple keyword matching: if the diploma is mentioned in the job details
      if (keywords.includes(diploma) || diploma.split(' ').some(word => word.length > 3 && keywords.includes(word))) {
        this.addNotification(user.id, {
          title: 'Nouvelle offre pour vous !',
          message: `L'offre "${opp.title}" correspond à votre profil (${user.diploma}).`,
          link: `detail/${opp.id}`,
          type: 'alert'
        });
      }
    });
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
    const c1 = this.createUser({ name: 'TechVision Burundi', email: 'contact@techvision.bi', password: 'company123', role: 'company', avatar: 'T' });
    const c2 = this.createUser({ name: 'DataFlow Solutions', email: 'rh@dataflow.bi', password: 'company123', role: 'company', avatar: 'D' });
    const c3 = this.createUser({ name: 'GreenEnergy Corp', email: 'jobs@greenenergy.bi', password: 'company123', role: 'company', avatar: 'G' });
    const c4 = this.createUser({ name: 'MediCare Plus', email: 'recrutement@medicare.bi', password: 'company123', role: 'company', avatar: 'M' });
    const c5 = this.createUser({ name: 'FinStart Academy', email: 'info@finstart.bi', password: 'company123', role: 'company', avatar: 'F' });

    // Sample user
    this.createUser({ name: 'Ahmed Benali', email: 'ahmed@email.com', password: 'user123', role: 'user', avatar: 'A' });

    const opportunities = [
      { title: 'Développeur Full Stack Senior', company: oppsInBurundi[0]?.name || 'TechVision', companyId: '1', category: 'emploi', type: 'CDI', location: 'Bujumbura', salary: '1 500 000 BIF', applyUrl: 'https://techvision.bi/jobs/java-dev', description: 'Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe innovation.', requirements: ['3+ ans d\'expérience', 'React & Node', 'Informatique'], status: 'approved' },
      { title: 'Stage en Data Science', company: 'DataFlow', companyId: '2', category: 'stage', type: 'Stage', location: 'Gitega', salary: '300 000 BIF/mois', applyUrl: 'https://dataflow.bi/internships/ds', description: 'Offre de stage en Data Science.', requirements: ['Étudiant en informatique', 'Statistiques'], status: 'approved' },
      { title: 'Bourse d\'Excellence Universitaire 2026', company: c5.name, companyId: c5.id, category: 'bourse', type: 'Bourse', location: 'National', salary: '5 000 000 BIF/an', applyUrl: 'https://finstart.bi/scholarships/2026', description: 'Programme de bourses d\'excellence pour les étudiants brillants souhaitant poursuivre leurs études supérieures en finance, technologie ou sciences de l\'ingénieur.', requirements: ['Moyenne générale supérieure à 14/20', 'Lettre de motivation', 'Projet professionnel clair', 'Engagement communautaire apprécié'], status: 'approved' },
      { title: 'Conférence Tech 2026', company: 'TechVision', companyId: '1', category: 'evenement', type: 'Événement', location: 'Bujumbura', salary: 'Gratuit', applyUrl: 'https://techvision.bi/events/tech-2026', description: 'Conférence tech.', requirements: ['Inscription obligatoire'], status: 'approved' },
      { title: 'Formation Certifiante en Cybersécurité', company: c2.name, companyId: c2.id, category: 'formation', type: 'Formation', location: 'En ligne', salary: '450 000 BIF', applyUrl: 'https://dataflow.bi/academy/cyber', description: 'Formation intensive de 3 mois en cybersécurité.', requirements: ['Bases en réseaux'], status: 'approved' },
      { title: 'Ingénieur DevOps', company: c3.name, companyId: c3.id, category: 'emploi', type: 'CDI', location: 'Gitega', salary: '1 800 000 BIF', applyUrl: 'https://greenenergy.bi/careers/devops', description: 'Rejoignez notre équipe infrastructure.', requirements: ['2+ ans en DevOps'], status: 'approved' },
      { title: 'Stage Marketing Digital', company: 'MediCare', companyId: '4', category: 'stage', type: 'Stage', location: 'Ngozi', salary: '200 000 BIF/mois', applyUrl: 'https://medicare.bi/hr/mkt-intern', description: 'Stage marketing.', requirements: ['Marketing'], status: 'approved' },
      { title: 'Bourse de Recherche Doctorale', company: c5.name, companyId: c5.id, category: 'bourse', type: 'Bourse', location: 'International', salary: '8 000 000 BIF/an', applyUrl: 'https://finstart.bi/phd/scholarship', description: 'Bourse complète pour doctorants.', requirements: ['Master en informatique'], status: 'approved' },
      { title: 'Hackathon Green Tech', company: c3.name, companyId: c3.id, category: 'evenement', type: 'Événement', location: 'Rumonge', salary: 'Gratuit', applyUrl: 'https://greenenergy.bi/events/hackathon', description: 'Hackathon 48h.', requirements: ['Équipes de 3-5'], status: 'approved' },
      { title: 'Formation Cloud AWS', company: c2.name, companyId: c2.id, category: 'formation', type: 'Formation', location: 'Bujumbura', salary: '600 000 BIF', applyUrl: 'https://dataflow.bi/academy/aws', description: 'Préparation certif AWS.', requirements: ['Bases tech'], status: 'approved' },
      { title: 'Designer UX/UI Junior', company: c1.name, companyId: c1.id, category: 'emploi', type: 'CDD', location: 'Bujumbura', salary: '1 200 000 BIF', applyUrl: 'https://techvision.bi/jobs/ui-designer', description: 'Poste en CDD.', requirements: ['Figma'], status: 'approved' },
      { title: 'Analyste Données Santé', company: c4.name, companyId: c4.id, category: 'emploi', type: 'CDI', location: 'Bujumbura', salary: '1 600 000 BIF', applyUrl: 'https://medicare.bi/hr/data-health', description: 'Poste analyste.', requirements: ['Stats'], status: 'pending' },
      { title: 'Workshop Intelligence Artificielle', company: c2.name, companyId: c2.id, category: 'formation', type: 'Workshop', location: 'En ligne', salary: 'Gratuit', applyUrl: 'https://dataflow.bi/events/ia-workshop', description: 'Workshop gratuit d\'initiation à l\'intelligence artificielle.', requirements: ['Proche Bujumbura'], status: 'pending' },
    ];

    opportunities.forEach(opp => this.createOpportunity(opp));
    localStorage.setItem(this.KEYS.INITIALIZED, 'true');
  }
};
