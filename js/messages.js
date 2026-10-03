const Messages = {
    getConversations: function(userId) {
        return DB.getConversations(userId);
    },

    getMessagesBetweenUsers: function(user1Id, user2Id) {
        return DB.getMessagesBetweenUsers(user1Id, user2Id);
    },

    sendMessage: function(msg) {
        DB.addMessage(msg);
    }
};
