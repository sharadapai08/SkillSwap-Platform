const AppState = {
    currentUser: null,
    currentPage: 'home',
    currentDashboardTab: 'profile',
    currentConversation: null,

    init: function() {
        DB.init();
        this.currentUser = Auth.getCurrentUser();
        this.currentPage = this.currentUser ? 'home' : 'login';
        this.showInitialUI();
        this.setupEventListeners();
    },

    showInitialUI: function() {
        if (this.currentUser) {
            this.showUserMenu();
        } else {
            this.showAuthButtons();
        }
        this.showPage(this.currentPage);
    },

    showUserMenu: function() {
        document.getElementById('auth-buttons').classList.add('hidden');
        document.getElementById('user-menu').classList.remove('hidden');
        document.getElementById('user-greeting').textContent = `Hello, ${this.currentUser.name.split(' ')[0]}!`;
    },

    showAuthButtons: function() {
        document.getElementById('auth-buttons').classList.remove('hidden');
        document.getElementById('user-menu').classList.add('hidden');
    },

    showPage: function(page) {
        // Prevent navigation to protected pages if not logged in
        if (page === 'dashboard' && !this.currentUser) {
            this.showPage('login');
            return;
        }
        document.querySelectorAll('main section').forEach(s => s.classList.add('hidden'));
        this.currentPage = page;
        const section = document.getElementById(`${page}-page`);
        if (section) section.classList.remove('hidden');
        if (page === 'dashboard') this.showDashboardTab(this.currentDashboardTab);
        if (page === 'browse') this.loadAllSkills();
        if (page === 'home') this.loadFeaturedSkills && this.loadFeaturedSkills();
    },

    setupEventListeners: function() {
        document.getElementById('nav-home').addEventListener('click', (e) => { e.preventDefault(); if (this.currentUser) this.showPage('home'); else this.showPage('login'); });
        document.getElementById('nav-browse').addEventListener('click', (e) => { e.preventDefault(); if (this.currentUser) this.showPage('browse'); else this.showPage('login'); });
        document.getElementById('nav-how-it-works').addEventListener('click', (e) => { e.preventDefault(); if (this.currentUser) this.showPage('how-it-works'); else this.showPage('login'); });

        document.getElementById('login-btn').addEventListener('click', (e) => { e.preventDefault(); this.showPage('login'); });
        document.getElementById('signup-btn').addEventListener('click', (e) => { e.preventDefault(); this.showPage('signup'); });

        document.getElementById('dashboard-btn').addEventListener('click', (e) => { e.preventDefault(); this.showPage('dashboard'); });
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
            this.currentUser = null;
            this.showAuthButtons();
            this.showPage('home');
        });

        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                const user = Auth.login(email, password);
                this.currentUser = user;
                this.showUserMenu();
                this.showPage('dashboard');
            } catch (err) {
                alert('Invalid email or password');
            }
        });

        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const location = document.getElementById('signup-location').value;
            const bio = document.getElementById('signup-bio').value;
            try {
                const user = Auth.signup(name, email, password, location, bio);
                this.currentUser = user;
                this.showUserMenu();
                this.showPage('dashboard');
            } catch (err) {
                alert(err.message);
            }
        });

        document.getElementById('go-to-signup').addEventListener('click', (e) => { e.preventDefault(); this.showPage('signup'); });
        document.getElementById('go-to-login').addEventListener('click', (e) => { e.preventDefault(); this.showPage('login'); });

        document.getElementById('get-started-btn').addEventListener('click', (e) => { e.preventDefault(); this.showPage('signup'); });

        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.target.getAttribute('data-tab');
                this.showDashboardTab(tab);
            });
        });

        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('profile-name').value;
            const location = document.getElementById('profile-location').value;
            const bio = document.getElementById('profile-bio').value;
            this.currentUser.name = name;
            this.currentUser.location = location;
            this.currentUser.bio = bio;
            DB.updateUser(this.currentUser);
            localStorage.setItem('skillswap_current_user', JSON.stringify(this.currentUser));
            this.loadProfile();
            alert('Profile updated!');
        });

        document.getElementById('add-skill-btn').addEventListener('click', () => {
            document.getElementById('add-skill-modal').classList.remove('hidden');
        });
        document.getElementById('cancel-skill-btn').addEventListener('click', () => {
            document.getElementById('add-skill-modal').classList.add('hidden');
        });
        document.getElementById('close-skill-modal').addEventListener('click', () => {
            document.getElementById('add-skill-modal').classList.add('hidden');
        });
        document.querySelector('.modal-overlay').addEventListener('click', () => {
            document.getElementById('add-skill-modal').classList.add('hidden');
        });

        document.getElementById('add-skill-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const skill = {
                name: document.getElementById('skill-name').value,
                category: document.getElementById('skill-category').value,
                description: document.getElementById('skill-description').value,
                level: document.getElementById('skill-level').value,
                teach: document.getElementById('skill-teach').checked,
                learn: document.getElementById('skill-learn').checked,
            };
            DB.addSkill({ ...skill, userId: this.currentUser.id, userEmail: this.currentUser.email, id: Date.now().toString(), createdAt: new Date().toISOString() });
            document.getElementById('add-skill-modal').classList.add('hidden');
            document.getElementById('add-skill-form').reset();
            this.loadUserSkills();
        });

        // Skill search (browse page)
        const skillSearch = document.getElementById('skill-search');
        if (skillSearch) skillSearch.addEventListener('input', (e) => {
            this.searchSkills(e.target.value);
        });
    },

    showDashboardTab: function(tab) {
        document.querySelectorAll('.sidebar-menu a').forEach(link => link.classList.remove('active'));
        document.querySelector(`.sidebar-menu a[data-tab="${tab}"]`).classList.add('active');
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
        document.getElementById(`${tab}-tab`).classList.remove('hidden');
        this.currentDashboardTab = tab;
        switch(tab) {
            case 'profile': this.loadProfile(); break;
            case 'my-skills': this.loadUserSkills(); break;
            case 'swap-requests': this.loadSwapRequests(); break;
        }
    },

    loadProfile: function() {
        if (!this.currentUser) return;
        document.getElementById('profile-name').value = this.currentUser.name || '';
        document.getElementById('profile-email').value = this.currentUser.email || '';
        document.getElementById('profile-location').value = this.currentUser.location || '';
        document.getElementById('profile-bio').value = this.currentUser.bio || '';
        // Professional card
        const formContainer = document.getElementById('profile-form').parentElement;
        let profileCard = document.getElementById('profile-card');
        if (!profileCard) {
            profileCard = document.createElement('div');
            profileCard.id = 'profile-card';
            profileCard.className = 'form-container mb-2';
            formContainer.parentElement.insertBefore(profileCard, formContainer);
        }
        profileCard.innerHTML = `
            <div style="display:flex;align-items:center;gap:1rem;">
                <div class="avatar" style="font-size:2rem;width:60px;height:60px;">
                    ${this.currentUser.name ? this.currentUser.name.charAt(0) : '?'}
                </div>
                <div>
                    <div style="font-size:1.2rem;font-weight:700;">${this.currentUser.name || ''}</div>
                    <div style="color:var(--primary);font-size:1rem;">${this.currentUser.email || ''}</div>
                    <div style="color:#6c757d;margin-top:.2rem;">${this.currentUser.location || ''}</div>
                    <div style="margin-top:.5rem;color:var(--dark);">${this.currentUser.bio || ''}</div>
                </div>
            </div>
        `;
    },

    loadUserSkills: function() {
        const userSkills = DB.getUserSkills(this.currentUser.id);
        const container = document.getElementById('user-skills-list');
        container.innerHTML = '';
        if (userSkills.length === 0) {
            container.innerHTML = '<p>You haven\'t added any skills yet.</p>';
            return;
        }
        userSkills.forEach(skill => {
            const skillElement = document.createElement('div');
            skillElement.className = 'skill-card mb-1';
            skillElement.innerHTML = `
                <div class="skill-card-header">
                    <h3>${skill.name}</h3>
                    <span class="skill-category">${skill.category}</span>
                </div>
                <div class="skill-card-body">
                    <p>${skill.description}</p>
                    <p><strong>Level:</strong> ${skill.level}</p>
                    <p><strong>Offering to teach:</strong> ${skill.teach ? 'Yes' : 'No'}</p>
                    <p><strong>Looking to learn:</strong> ${skill.learn ? 'Yes' : 'No'}</p>
                </div>
                <div class="skill-card-footer">
                    <button class="btn btn-outline edit-skill-btn" data-skill-id="${skill.id}">Edit</button>
                    <button class="btn btn-outline delete-skill-btn" data-skill-id="${skill.id}">Delete</button>
                </div>
            `;
            container.appendChild(skillElement);
        });
        document.querySelectorAll('.edit-skill-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const skillId = e.target.getAttribute('data-skill-id');
                alert('Edit not implemented yet: ' + skillId);
            });
        });
        document.querySelectorAll('.delete-skill-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const skillId = e.target.getAttribute('data-skill-id');
                if (confirm('Are you sure you want to delete this skill?')) {
                    DB.deleteSkill(skillId);
                    this.loadUserSkills();
                }
            });
        });
    },

    loadSwapRequests: function() {
        const requests = DB.getSwapRequests();
        const userRequests = requests.filter(
            req => req.ownerId === this.currentUser.id || req.requesterId === this.currentUser.id
        );
        const container = document.getElementById('swap-requests-list');
        container.innerHTML = '';

        if (userRequests.length === 0) {
            container.innerHTML = '<p>No swap requests found.</p>';
            return;
        }

        userRequests.forEach(request => {
            const isOwner = request.ownerId === this.currentUser.id;
            const skill = DB.getSkills().find(skill => skill.id === request.skillId);
            const requester = DB.getUsers().find(user => user.id === request.requesterId);
            const owner = DB.getUsers().find(user => user.id === request.ownerId);

            const card = document.createElement('div');
            card.className = 'skill-card mb-1';
            card.innerHTML = `
                <div class="skill-card-header">
                    <h3>${request.skillName}</h3>
                    <span class="request-status">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                </div>
                <div class="skill-card-body">
                    <div style="margin-bottom:0.6rem;">
                        <span style="font-weight:600;">
                            ${isOwner ? 'Requester:' : 'Owner:'}
                        </span>
                        <div class="user-info" style="margin-top:0.4rem;">
                            <div class="avatar">${isOwner ? requester.name.charAt(0) : owner.name.charAt(0)}</div>
                            <div>
                                <div class="user-name">${isOwner ? requester.name : owner.name}</div>
                                <div class="user-location">${isOwner ? requester.location : owner.location}</div>
                            </div>
                        </div>
                    </div>
                    <p>
                        <strong>Category:</strong> ${skill ? skill.category : ''}
                    </p>
                    <p>
                        <strong>Description:</strong> ${skill ? skill.description : ''}
                    </p>
                    <p>
                        <strong>Status:</strong> <span style="text-transform:capitalize">${request.status}</span>
                    </p>
                </div>
                ${isOwner && request.status === 'pending' ?
                    `<div class="skill-card-footer">
                        <button class="btn btn-primary accept-request-btn" data-request-id="${request.id}">Accept</button>
                        <button class="btn btn-outline reject-request-btn" data-request-id="${request.id}">Reject</button>
                    </div>` : ''
                }
            `;
            container.appendChild(card);
        });

        document.querySelectorAll('.accept-request-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const requestId = e.target.getAttribute('data-request-id');
                this.updateSwapRequestStatus(requestId, 'accepted');
            });
        });
        document.querySelectorAll('.reject-request-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const requestId = e.target.getAttribute('data-request-id');
                this.updateSwapRequestStatus(requestId, 'rejected');
            });
        });
    },

    updateSwapRequestStatus: function(requestId, status) {
        const requests = DB.getSwapRequests();
        const request = requests.find(req => req.id === requestId);
        if (request) {
            request.status = status;
            DB.updateSwapRequest(request);
            this.loadSwapRequests();
        }
    },

    // -------- For browse/skills pages: swap request card UI -------
    renderSkills: function(skills, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (skills.length === 0) {
            container.innerHTML = '<p class="text-center">No skills found.</p>';
            return;
        }

        skills.forEach(skill => {
            const user = DB.findUserByEmail(skill.userEmail);
            const skillCard = document.createElement('div');
            skillCard.className = 'skill-card';

            skillCard.innerHTML = `
                <div class="skill-card-header">
                    <h3>${skill.name}</h3>
                    <span class="skill-category">${skill.category}</span>
                </div>
                <div class="skill-card-body">
                    <p>${skill.description}</p>
                    <p><strong>Level:</strong> ${skill.level}</p>
                    <p><strong>Offering to teach:</strong> ${skill.teach ? 'Yes' : 'No'}</p>
                    <p><strong>Looking to learn:</strong> ${skill.learn ? 'Yes' : 'No'}</p>
                </div>
                <div class="skill-card-footer">
                    <div class="user-info">
                        <div class="avatar">${user.name.charAt(0)}</div>
                        <div>
                            <div class="user-name">${user.name}</div>
                            <div class="user-location">${user.location}</div>
                        </div>
                    </div>
                    ${this.currentUser && this.currentUser.id !== user.id ?
                        `<button class="btn btn-primary request-swap-btn" data-skill-id="${skill.id}">Request Swap</button>` : ''}
                </div>
            `;
            container.appendChild(skillCard);
        });

        // Add event listeners to swap buttons
        document.querySelectorAll('.request-swap-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const skillId = e.target.getAttribute('data-skill-id');
                this.requestSkillSwap(skillId);
            });
        });
    },

    requestSkillSwap: function(skillId) {
        if (!this.currentUser) {
            this.showPage('login');
            return;
        }
        const skill = DB.getSkills().find(s => s.id === skillId);
        const skillOwner = DB.findUserByEmail(skill.userEmail);
        const requests = DB.getSwapRequests();
        const alreadyRequested = requests.some(req =>
            req.requesterId === this.currentUser.id &&
            req.ownerId === skillOwner.id &&
            req.skillId === skillId &&
            req.status === 'pending'
        );

        if (alreadyRequested) {
            alert("You've already sent a swap request for this skill.");
            return;
        }

        const swapRequest = {
            id: Date.now().toString(),
            skillId,
            skillName: skill.name,
            requesterId: this.currentUser.id,
            requesterName: this.currentUser.name,
            ownerId: skillOwner.id,
            ownerName: skillOwner.name,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        DB.addSwapRequest(swapRequest);
        alert(`Swap request sent to ${skillOwner.name} for ${skill.name}`);
    },

    searchSkills: function(query) {
        const skills = DB.getSkills();
        const filteredSkills = skills.filter(skill =>
            skill.name.toLowerCase().includes(query.toLowerCase()) ||
            skill.category.toLowerCase().includes(query.toLowerCase()) ||
            skill.description.toLowerCase().includes(query.toLowerCase())
        );
        this.renderSkills(filteredSkills, 'all-skills');
    },

    loadAllSkills: function() {
        const skills = DB.getSkills();
        this.renderSkills(skills, 'all-skills');
    },

    // For featured/home
    loadFeaturedSkills: function() {
        const skills = DB.getSkills();
        const featuredSkills = skills.slice(0, 6);
        this.renderSkills(featuredSkills, 'featured-skills');
    }
};
