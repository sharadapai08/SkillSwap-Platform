document.addEventListener('DOMContentLoaded', () => {
    AppState.init();

    // Add sample data if empty (optional)
    if (DB.getUsers().length === 0) {
        const sampleUsers = [
            { id: '1', name: 'John Doe', email: 'john@example.com', password: 'password', location: 'New York, NY', bio: 'Software developer with 5 years of experience', createdAt: new Date().toISOString() },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', password: 'password', location: 'San Francisco, CA', bio: 'Graphic designer and photography enthusiast', createdAt: new Date().toISOString() },
            { id: '3', name: 'Mike Johnson', email: 'mike@example.com', password: 'password', location: 'Chicago, IL', bio: 'Language teacher and travel blogger', createdAt: new Date().toISOString() }
        ];
        sampleUsers.forEach(user => DB.addUser(user));

        const sampleSkills = [
            // Add sample skill objects here as needed
        ];
        sampleSkills.forEach(skill => DB.addSkill(skill));

        const sampleMessages = [
            // Add sample messages here if needed
        ];
        sampleMessages.forEach(msg => DB.addMessage(msg));
    }
});
