import { getWebSocket, sendMessage } from './singletonSocket.js';
import { fetchUserData, getUser } from './fetchFunctions.js';

let userData;
let webSocket = await getWebSocket();

async function invitePlayer(playerNumber)
{
	const usernameInput = document.getElementById(`player${playerNumber}`);
	if (username)
	{
		const invitedUser = getUser(usernameInput.value);
		const tournamentData =
		{
			type: "send_invite",
			matchId: matchId,
			inviteeId: invitedUser.id,
			hostId: userData.id,
			game: "pong",
			tournament: true
		};
		//startOnlineButton.display = 'none';
		await sendMessage(tournamentData);
	}
	else
		alert('Please enter a username');
	usernameInput.value = '';
}

addEventListener("DOMContentLoaded", async function()
{
	userData = await fetchUserData();

	document.getElementById('player1').textContent = userData.username;

});
