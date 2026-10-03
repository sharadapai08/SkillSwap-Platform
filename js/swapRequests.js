const SwapRequests = {
    addSwapRequest: function(swapRequest) {
        DB.addSwapRequest(swapRequest);
    },
    
    updateSwapRequestStatus: function(requestId, status) {
        const requests = DB.getSwapRequests();
        const request = requests.find(req => req.id === requestId);
        if (request) {
            request.status = status;
            DB.updateSwapRequest(request);

            if (status === 'accepted') {
                const message = {
                    id: Date.now().toString(),
                    senderId: request.ownerId,
                    receiverId: request.requesterId,
                    content: `Hi! I've accepted your swap request for ${request.skillName}. Let's discuss how we can exchange skills.`,
                    timestamp: new Date().toISOString()
                };
                DB.addMessage(message);
            }
        }
    }
};
