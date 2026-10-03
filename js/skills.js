const Skills = {
    showAddSkillModal: function() {
        document.getElementById('add-skill-modal').classList.remove('hidden');
    },

    hideAddSkillModal: function() {
        document.getElementById('add-skill-modal').classList.add('hidden');
        document.getElementById('add-skill-form').reset();
    },

    addSkill: function(skillData, currentUser) {
        const newSkill = {
            id: Date.now().toString(),
            userId: currentUser.id,
            userEmail: currentUser.email,
            ...skillData,
            createdAt: new Date().toISOString()
        };
        DB.addSkill(newSkill);
    },

    deleteSkill: function(skillId) {
        DB.deleteSkill(skillId);
    },

    // Function to render skills etc can be added here or inside AppState
};
