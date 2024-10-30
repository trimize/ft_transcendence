import { createGame, fetchUserById, fetchUserData, fetchMatch } from "./fetchFunctions.js";
import { getWebSocket, sendMessage } from "./singletonSocket.js";
import { getCurrentTime } from "./utlis.js";

let socket;
let user;
let player1;
let player2;
let opponent;
let matchData;

let isPlayer1Ready = false;
let isPlayer2Ready = false;

async function waitingState()
{
	setInterval( async () => {
		const message = {
			"type": "waiting",
			"opponentId": (user.id == player1.id ? player2.id : player1.id),
			"matchId": matchData.matchId
		}
		await sendMessage(message);
	}, 2000)
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

export async function renderLobby()
{
	const urlParams = new URLSearchParams(window.location.search);
	user = await fetchUserData();
	socket = await getWebSocket();
	matchData = await fetchMatch(urlParams.get('matchId'));
	if (user.id != urlParams.get('host') && user.id != urlParams.get('invitee')) {
		return`
			<div>Error Page Here</div>
		`;
	} else if (user.id != matchData.player1 && user.id != matchData.player2) {
		return`
			<div>Error Page Here</div>
		`;
	} else if (user.id == urlParams.get('host')) {
		player1 = user;
		isPlayer1Ready = true;
		player2 = await fetchUserById(urlParams.get('invitee'));
	} else {
		player2 = user;
		isPlayer2Ready = true;
		player1 = await fetchUserById(urlParams.get('host'));
	}

	waitingState();

	document.getElementById('content').innerHTML = lobbyHtml();
}

async function socketListener()
{
	socket.addEventListener('message', async function(event)
	{
		const message = JSON.parse(event.data);
		if (message.type === 'waiting')
		{
			if (message.opponentId == user.id && matchData.id == message.matchId)
			{
				const messageData = {
					"type": "allons-y",
					"player1": player1.id,
					"player2": player2.id,
					"matchId": matchData.matchId
				}
				await sendMessage(messageData);
				// TODO Update match sending the start time
			}
		}
		if (message.type === 'allons-y' && message.matchId == matchData.id)
		{
			if (matchData.game == 'pong') {
				const newParams = new URLSearchParams();
				newParams.append('host', player1);
				newParams.append('invitee', player2);
				newParams.append('matchId', matchData.id);
				newParams.append('ballAcc', matchData.ballAcc);
				newParams.append('ballSpeed', matchData.ballSpeed);
				newParams.append('powers', matchData.powers);
			} else if (matchData.game == 'tic-tac-toe') {
				const newParams = new URLSearchParams();
				newParams.append('host', player1);
				newParams.append('invitee', player2);
				newParams.append('matchId', matchData.id);
				newParams.append('powers', matchData.powers);
				window.location.href = `/tic-tac-toe?${newParams.toString()}`;
			}
		}
	});
}