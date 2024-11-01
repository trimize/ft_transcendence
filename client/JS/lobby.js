import { createGame, fetchUserById, fetchUserData, fetchMatch, updateGame } from "./fetchFunctions.js";
import { getWebSocket, sendMessage } from "./singletonSocket.js";
import { getCurrentTime } from "./utils.js";

let user;
let socket;
let player1;
let player2;
let opponent;
let matchData;
let intervalId;
let matchmaking = false;

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
	matchmaking = urlParams.get('matchmaking');
	user = await fetchUserData();
	socket = await getWebSocket();

	if (!matchmaking) {
		matchData = await fetchMatch(urlParams.get('matchId'));
	}
	
	
	if (matchmaking) {
		const messageData = {
			"type": "matchmaking",
			"playerId": user.id,
			"game": urlParams.get('game'),
		}
		console.log("sending matchmaking message");
		console.log(messageData);
		sendMessage(messageData);
	} else {

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
	}

	document.getElementById('content').innerHTML = lobbyHtml();

	socketListener();

	if (!matchmaking) {
		waitingState();
	}

}

async function socketListener()
{
	socket.addEventListener('message', async function(event)
	{
		const message = JSON.parse(event.data);
		console.log("message received " + event.data);
		if (message.type == 'waiting_state')
		{
			if (message.opponentId == user.id && matchData.id == message.matchId)
			{
				stopWaitingState();
				const messageData = {
					"type": "allons-y",
					"player1": player1.id,
					"player2": player2.id,
					"matchId": matchData.id
				}
				await sendMessage(messageData);
				const game_update_message = {
					"id": matchData.id,
					"start_time": new Date()
				};
				await updateGame(game_update_message);
			}
		} else if (message.type == 'allons-y')
		{
			if (!matchmaking && message.matchId != matchData.id) {
				return;
			}
			stopWaitingState();

			if (matchmaking) {
				matchData = await fetchMatch(message.matchId);
				console.log("matchData");
				console.log(matchData);
			}

			console.log("allons-y message received");

			if (matchData.game == 'pong') {
				const newParams = new URLSearchParams();
				newParams.append('host', matchData.player1);
				newParams.append('invitee', matchData.player2);
				newParams.append('matchId', matchData.id);
				newParams.append('ballAcc', matchData.ballAcc);
				newParams.append('ballSpeed', matchData.ballSpeed);
				newParams.append('powers', matchData.powers);
				newParams.append('offline', false);
			} else if (matchData.game == 'tic-tac-toe') {
				console.log("allons-y message received2");
				const newParams = new URLSearchParams();
				newParams.append('host', matchData.player1);
				newParams.append('invitee', matchData.player2);
				newParams.append('matchId', matchData.id);
				newParams.append('powers', matchData.powers);
				newParams.append('offline', false);
				window.location.href = `/tic-tac-toe?${newParams.toString()}`;
			}
		} else if (message.type === 'refuse_invite' && message.matchId == matchData.id)
		{
			stopWaitingState();
			const homeParams = new URLSearchParams();
			homeParams.append('alert', 'match_refused');
			window.location.href = `/home?${homeParams.toString()}`;
		}
	});
}