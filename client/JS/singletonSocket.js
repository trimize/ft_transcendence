let socket = null;

export async function getWebSocket() {
	if (!socket || socket.readyState === WebSocket.CLOSED) {
        // If there's no existing connection or it's closed, create a new WebSocket
        socket = new WebSocket(localStorage.getItem('websocket_url'));
        let accessToken = localStorage.getItem('access');
        // Set up event listeners
        socket.addEventListener('open', async () => {
            console.log('WebSocket connection established');
            
            try {
                const response = await fetch('http://localhost:8000/api/user_info/', {
                    method: 'GET',
                    headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		}});
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const userInfo = await response.json();
                const userId = userInfo.id;
                console.log(userInfo);
                console.log('Sending to WebSocket:', JSON.stringify({ type: "new_connection", userId: userId }));
                // Send userId to the WebSocket server
                socket.send(JSON.stringify({ type: "new_connection" , userId: userId }));
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            }
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

export async function sendMessage(message)
{
	const socket = await getWebSocket();
	if (socket.readyState === WebSocket.OPEN)
	{
		let json_message = JSON.stringify(message);
		await socket.send(json_message);
		console.log("message sent " + json_message);
	}
	else
	{
	    console.log('WebSocket is not open.');
	}
}
