let socket = null;

export function getWebSocket() {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
        // If there's no existing connection or it's closed, create a new WebSocket
        socket = new WebSocket(localStorage.getItem('websocket_url'));
        
        // Set up event listeners
        socket.addEventListener('open', () => {
            console.log('WebSocket connection established');
        });

        //socket.addEventListener('message', (event) => {
        //    console.log('Message received:', event.data);
        //});

        socket.addEventListener('close', () => {
            console.log('WebSocket connection closed');
            socket = null; // Reset the socket so a new one can be created if needed
        });

        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }
    return socket;
}