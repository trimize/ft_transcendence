import { createGame, fetchUserById, fetchUserData, fetchMatch } from "./fetchFunctions.js";
import { getWebSocket, sendMessage } from "./singletonSocket.js";
import { getCurrentTime } from "./utlis.js";

let socket;
let user;
let player1;
let player2;
let opponent;
let matchData;
let intervalId;

let isPlayer1Ready = false;
let isPlayer2Ready = false;

async function waitingState()
{
    intervalId = setInterval(async () => {
        const message = {
            "type": "waiting_state",
			"userId": user.id,
            "opponentId": (user.id == player1.id ? player2.id : player1.id),
            "matchId": matchData.id
        };
        await sendMessage(message);
    }, 2000);
	// console.log('Waiting for opponent');
}

function stopWaitingState() {
    if (intervalId) {
        clearInterval(intervalId);
    }
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
	console.log("Match data is ");
	console.log(matchData);
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
	document.getElementById('content').innerHTML = lobbyHtml();

	socketListener();
	waitingState();

}

async function socketListener()
{
	socket.addEventListener('message', async function(event)
	{
		const message = JSON.parse(event.data);
		console.log("message received " + event.data);
		if (message.type === 'waiting_state')
		{
			stopWaitingState();
			if (message.opponentId == user.id && matchData.id == message.matchId)
			{
				const messageData = {
					"type": "allons-y",
					"player1": player1.id,
					"player2": player2.id,
					"matchId": matchData.id
				}
				await sendMessage(messageData);
				// TODO Update match sending the start time

			}
		} else if (message.type === 'allons-y' && message.matchId == matchData.id)
		{
			stopWaitingState();
			if (matchData.game == 'pong') {
				const newParams = new URLSearchParams();
				newParams.append('host', player1.id);
				newParams.append('invitee', player2.id);
				newParams.append('matchId', matchData.id);
				newParams.append('ballAcc', matchData.ballAcc);
				newParams.append('ballSpeed', matchData.ballSpeed);
				newParams.append('powers', matchData.powers);
			} else if (matchData.game == 'tic-tac-toe') {
				const newParams = new URLSearchParams();
				newParams.append('host', player1.id);
				newParams.append('invitee', player2.id);
				newParams.append('matchId', matchData.id);
				newParams.append('powers', matchData.powers);
				window.location.href = `/tic-tac-toe?${newParams.toString()}`;
			}
		} else if (message.type === 'refuse_invite' && message.matchId == matchData.id)
		{
			stopWaitingState();
			window.location.href = '/';
		}
	});
}