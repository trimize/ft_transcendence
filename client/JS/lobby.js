import { createGame } from "./fetchFunctions.js";
import { getWebSocket } from "./singletonSocket.js";

let socket = await getWebSocket();

export function renderLobby() {

	const urlParams = new URLSearchParams(window.location.search); //TODO check if the host is the current user

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


	return `
		<div class="lobby">
			<h1>Lobby</h1>
		</div>
	`;
}

