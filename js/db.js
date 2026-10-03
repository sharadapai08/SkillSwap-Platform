const DB = {
    init: function() {
        if (!localStorage.getItem('skillswap_users')) localStorage.setItem('skillswap_users', JSON.stringify([]));
        if (!localStorage.getItem('skillswap_skills')) localStorage.setItem('skillswap_skills', JSON.stringify([]));
        if (!localStorage.getItem('skillswap_swap_requests')) localStorage.setItem('skillswap_swap_requests', JSON.stringify([]));
        if (!localStorage.getItem('skillswap_messages')) localStorage.setItem('skillswap_messages', JSON.stringify([]));
    },

    getUsers: function() {
        return JSON.parse(localStorage.getItem('skillswap_users'));
    },

    addUser: function(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('skillswap_users', JSON.stringify(users));
    },

    findUserByEmail: function(email) {
        const users = this.getUsers();
        return users.find(user => user.email === email);
    },

    updateUser: function(updatedUser) {
        const users = this.getUsers();
        const index = users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem('skillswap_users', JSON.stringify(users));
        }
    },

    getSkills: function() {
        return JSON.parse(localStorage.getItem('skillswap_skills'));
    },

    addSkill: function(skill) {
        const skills = this.getSkills();
        skills.push(skill);
        localStorage.setItem('skillswap_skills', JSON.stringify(skills));
    },

    getUserSkills: function(userId) {
        return this.getSkills().filter(skill => skill.userId === userId);
    },

    updateSkill: function(updatedSkill) {
        const skills = this.getSkills();
        const index = skills.findIndex(skill => skill.id === updatedSkill.id);
        if (index !== -1) {
            skills[index] = updatedSkill;
            localStorage.setItem('skillswap_skills', JSON.stringify(skills));
        }
    },

    deleteSkill: function(skillId) {
        const skills = this.getSkills().filter(skill => skill.id !== skillId);
        localStorage.setItem('skillswap_skills', JSON.stringify(skills));
    },

    getSwapRequests: function() {
        return JSON.parse(localStorage.getItem('skillswap_swap_requests'));
    },

    addSwapRequest: function(request) {
        const requests = this.getSwapRequests();
        requests.push(request);
        localStorage.setItem('skillswap_swap_requests', JSON.stringify(requests));
    },

    updateSwapRequest: function(updatedRequest) {
        const requests = this.getSwapRequests();
        const index = requests.findIndex(request => request.id === updatedRequest.id);
        if (index !== -1) {
            requests[index] = updatedRequest;
            localStorage.setItem('skillswap_swap_requests', JSON.stringify(requests));
        }
    },

    getMessages: function() {
        return JSON.parse(localStorage.getItem('skillswap_messages'));
    },

    addMessage: function(message) {
        const messages = this.getMessages();
        messages.push(message);
        localStorage.setItem('skillswap_messages', JSON.stringify(messages));
    },

    getConversations: function(userId) {
        const messages = this.getMessages();
        const userMessages = messages.filter(msg => msg.senderId === userId || msg.receiverId === userId);
        const partners = new Set();
        userMessages.forEach(msg => {
            if (msg.senderId === userId) partners.add(msg.receiverId);
            else partners.add(msg.senderId);
        });
        return Array.from(partners);
    },

    getMessagesBetweenUsers: function(user1Id, user2Id) {
        const messages = this.getMessages();
        return messages.filter(msg =>
            (msg.senderId === user1Id && msg.receiverId === user2Id) ||
            (msg.senderId === user2Id && msg.receiverId === user1Id)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
};
