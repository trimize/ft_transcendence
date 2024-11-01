 import { WEBSOCKET_URL } from "./appconfig.js";
import { fetchUserData } from "./fetchFunctions.js";

let socket = null;

export async function getWebSocket() {
	if (!socket || socket.readyState === WebSocket.CLOSED) {
        socket = new WebSocket(localStorage.getItem('websocket_url'));
        socket.addEventListener('open', async () =>
        {
            console.log('WebSocket connection established'); 
            try
            {
                const userInfo = await fetchUserData();
                console.log('Sending to WebSocket:', JSON.stringify({ type: "new_connection", userId: userInfo.id }));
                socket.send(JSON.stringify({ type: "new_connection" , userId: userInfo.id }));
            }
            catch (error)
            {
                console.error('Failed to fetch user info:', error);
            }
        });
        socket.addEventListener('close', () =>
        {
            console.log('WebSocket connection closed');
            socket = null;
        });

        socket.addEventListener('error', (error) =>
        {
            console.error('WebSocket error:', error);
        });
    }
    return socket;
}

export function closeWebSocket()
{
    if (socket && socket.readyState === WebSocket.OPEN)
    {
        socket.close();
        console.log('WebSocket connection closing...');
    }
}

export async function sendMessage(message)
{
	if (socket.readyState === WebSocket.OPEN)
	{
		let json_message = JSON.stringify(message);
		await socket.send(json_message);
	}
	else
	{
	    console.log('WebSocket is not open.');
	}
}
