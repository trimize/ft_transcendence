import { createGame, fetchUserById, fetchUserData } from "./fetchFunctions.js";
import { getWebSocket } from "./singletonSocket.js";


async function sendInvite()
{
	let socket = await getWebSocket();
	const user = await fetchUserData();
	const urlParams = new URLSearchParams(window.location.search); //TODO check if the host is the current user
	if (urlParams.get('host') != user.id)
	{
		return`
			<div>Error Page Here</div>
		`;
	}
	
	const gameType = urlParams.get('game') === 'ttt' ? 'tic-tac-toe' : 'pong';

	const body = {
		"game": gameType,
		"player1": urlParams.get('host'),
		"player2": urlParams.get('invitee'),
		"match_type": "online_multiplayer",
		"powers": true
	}

	const matchData = createGame(body);
	console.log(matchData);

	const message = {
		"type": "send_invite",
		"game": gameType,
		"hostId": urlParams.get('host'),
		"inviteeId": urlParams.get('invitee'),
		"matchId": matchData.matchId
	}

	socket.send(JSON.stringify(message));
}

function lobbyHtml()
{
	return `
		<div id="lobbyDiv">
			<div id="lobbyPlayer1">
				<div class="lobbyPlayerPfp" id="lobbyPlayer1Pfp"></div>
				<div class="lobbyPlayerUsername" id="lobbyPlayer1Username">toto</div>
			</div>
			<div id="lobbyPlayer2">
				<div class="lobbyPlayerPfp" id="lobbyPlayer2Pfp"></div>
				<div class="lobbyPlayerUsername" id="lobbyPlayer2Username">to</div>
			</div>
			<div id="lobbyStatusText">Game Starting ..</div>
		</div>
		<div id="bg"></div>
	`;
}

export function renderLobby()
{
	sendInvite();
	document.getElementById('content').innerHTML = lobbyHtml();
}
