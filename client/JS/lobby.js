import { BACKEND_URL } from "./appconfig.js";
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
let powers;
let game;
let ball_speed;
let ball_acc;
let matchmaking = false;
let firstInvite = false;


async function waitingState()
{
    intervalId = setInterval(async () => {
        const message = {
            "type": "waiting_state",
			"userId": user.id,
			"game": game,
            "opponentId": (user.id == player1.id ? player2.id : player1.id),
            "matchId": matchData.id,
			"firstInvite": firstInvite
        };
        sendMessage(message);
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
				<div class="lobbyPlayerUsername" id="lobbyPlayer1Username"></div>
			</div>
			<div id="lobbyPlayer2">
				<div class="lobbyPlayerPfp" id="lobbyPlayer2Pfp"></div>
				<div class="lobbyPlayerUsername" id="lobbyPlayer2Username"></div>
			</div>
			<div id="lobbyStatusText">Waiting for player ..</div>
		</div>
		<div id="bg"></div>
	`;
}

export async function renderLobby()
{
	const urlParams = new URLSearchParams(window.location.search);
	user = await fetchUserData();
	socket = await getWebSocket();
	matchmaking = urlParams.get('matchmaking');
	if (matchmaking != "true")
	{
		matchData = await fetchMatch(urlParams.get('matchId'));
		console.log("Match is: ");
		console.log(matchData);
		powers = matchData.powers;
		game = matchData.game;
	}
	else
		game = urlParams.get('game');

	firstInvite = urlParams.has('firstInvite') ? urlParams.get('firstInvite') : false;
	
	if (game == 'pong' && matchmaking != "true") {
		ball_speed = matchData.ball_speed;
		ball_acc = matchData.ball_acc;
		game = 'pong';
	}
	else if (matchmaking != "true")
		game = 'tic-tac-toe';

	document.getElementById('content').innerHTML = lobbyHtml();
	const player1UsernameDiv = document.getElementById('lobbyPlayer1Username');
	const player2UsernameDiv = document.getElementById('lobbyPlayer2Username');
	const player1PfpDiv = document.getElementById('lobbyPlayer1Pfp');
	const player2PfpDiv = document.getElementById('lobbyPlayer2Pfp');
	
	player1UsernameDiv.textContent = user.username;
	player1PfpDiv.style.backgroundImage = `url(${BACKEND_URL}${user.profile_pic})`;
	
	
	if (matchmaking != "true") {
		if (matchData.end_time != null) {
			const homeParams = new URLSearchParams();
			homeParams.append('alert', 'match_finished');
			window.location.href = `/?${homeParams.toString()}`;
		}
		player2 = (user.id == matchData.player2 ? user : await fetchUserById(matchData.player2));
		player1 = (user.id == matchData.player1 ? user : await fetchUserById(matchData.player1));
		console.log("player1");
		console.log(player1);
		console.log("player2");
		console.log(player2);
		player2UsernameDiv.textContent = (user.id == player2.id ? player1.username : player2.username);
		player2PfpDiv.style.backgroundImage = `url(${BACKEND_URL}${user.id == player2.id ? player1.profile_pic : player2.profile_pic})`;
	}
	
	
	if (matchmaking == "true") {
		const messageData = {
			"type": "matchmaking",
			"playerId": user.id,
			"game": urlParams.get('game'),
		}
		console.log("sending matchmaking message");
		console.log(messageData);
		sendMessage(messageData);
		
	} else {

		if (user.id != matchData.player1 && user.id != matchData.player2) {
			const homeParams = new URLSearchParams();
			homeParams.append('alert', 'match_finished');
			window.location.href = `/?${homeParams.toString()}`;
		}
	}


	socketListener();

	if (matchmaking != "true") {
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
				const game_update_message = {
					"id": matchData.id,
					"start_time": new Date()
				};
				await updateGame(game_update_message);
				const messageData = {
					"type": "allons-y",
					"player1": player1.id,
					"player2": player2.id,
					"matchId": matchData.id
				}
				sendMessage(messageData);
			}
		} else if (message.type == 'allons-y')
		{
			console.log("allons-y received");
			if (!matchmaking && message.matchId != matchData.id) {
				return;
			}
			stopWaitingState();

			if (matchmaking == "true") {
				matchData = await fetchMatch(message.matchId);
				console.log("matchData");
				console.log(matchData);
			}

			if (matchData.game == 'pong') {
				const newParams = new URLSearchParams();
				newParams.append('matchId', matchData.id);
				window.location.href = `/pong?${newParams.toString()}`;
			} else if (matchData.game == 'tic-tac-toe') {
				console.log("transfering to tic-tac-toe");
				const oldParams = new URLSearchParams(window.location.search);
				const newParams = new URLSearchParams();
				newParams.append('host', matchData.player1);
				newParams.append('invitee', matchData.player2);
				newParams.append('matchId', matchData.id);
				newParams.append('powers', matchData.powers);
				newParams.append('offline', false);
				if (oldParams.has('tournamentId'))
					newParams.append('tournamentId', oldParams.get('tournamentId'));
				window.location.href = `/tic-tac-toe?${newParams.toString()}`;
			}
		} else if (message.type === 'refuse_invite' && message.matchId == matchData.id)
		{
			stopWaitingState();
			const homeParams = new URLSearchParams();
			homeParams.append('alert', 'match_rejected');
			window.location.href = `/home?${homeParams.toString()}`;
		}
		else if (message.type == 'matchmaking' && message.playerId != user.id && message.game == game)
		{
			const body = {
				game: message.game,
				player1: message.playerId,
				player2: user.id,
			}
			matchData = await createGame(body);
			player1 = await fetchUserById(message.playerId);
			player2 = await fetchUserById(user.id);
			const messageData = {
				"type": "allons-y",
				"player1": player1.id,
				"player2": player2.id,
				"matchId": matchData.id
			}
			sendMessage(messageData);
			const game_update_message = {
				"id": matchData.id,
				"start_time": new Date()
			};
			await updateGame(game_update_message);
		}
	});
}