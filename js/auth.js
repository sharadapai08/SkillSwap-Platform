const Auth = {
    login: function(email, password) {
        const user = DB.findUserByEmail(email);
        if (user && user.password === password) {
            localStorage.setItem('skillswap_current_user', JSON.stringify(user));
            return user;
        }
        throw new Error('Invalid email or password');
    },

    signup: function(name, email, password, location, bio) {
        if (DB.findUserByEmail(email)) {
            throw new Error('User with this email already exists');
        }
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            location,
            bio,
            createdAt: new Date().toISOString()
        };
        DB.addUser(newUser);
        localStorage.setItem('skillswap_current_user', JSON.stringify(newUser));
        return newUser;
    },

    logout: function() {
        localStorage.removeItem('skillswap_current_user');
    },

    getCurrentUser: function() {
        const user = localStorage.getItem('skillswap_current_user');
        return user ? JSON.parse(user) : null;
    }
};
