// import { getUserInfo } from "./appconfig.js";
import { fetchUserData } from "./fetchFunctions.js";

let socket = null;

export async function getWebSocket() {
	if (!socket || socket.readyState === WebSocket.CLOSED) {
        // If there's no existing connection or it's closed, create a new WebSocket
        socket = new WebSocket(localStorage.getItem('websocket_url'));
        // Set up event listeners
        socket.addEventListener('open', async () => {
            console.log('WebSocket connection established'); 
            try {
                const userInfo = await fetchUserData();
                console.log('Sending to WebSocket:', JSON.stringify({ type: "new_connection", userId: userInfo.id }));
                // Send userId to the WebSocket server
                socket.send(JSON.stringify({ type: "new_connection" , userId: userInfo.id }));
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
	// const socket = await getWebSocket();
	if (socket.readyState === WebSocket.OPEN)
	{
		let json_message = JSON.stringify(message);
		await socket.send(json_message);
		//console.log("message sent " + json_message);
	}
	else
	{
	    console.log('WebSocket is not open.');
	}
}
