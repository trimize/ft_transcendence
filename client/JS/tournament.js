import { getWebSocket } from './singletonSocket.js';

let webSocket = await getWebSocket();

function invitePlayer(playerNumber) {
    const usernameInput = document.getElementById(`player${playerNumber}`);
    const username = usernameInput.value;
    if (username) {
        
    } else {
        alert('Please enter a username');
    }
}