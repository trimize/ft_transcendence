import { getWebSocket, sendMessage } from './singletonSocket.js';
import { fetchUserData, getUser, createGame , getTournamentById, fetchUserById, updateTournament } from './fetchFunctions.js';

let socket;
let accepted = false;
let declined = false;
let tournamentId;
let tournamentData;
let player1 = null;
let player2 = null;
let player3 = null;
let player4 = null;
let user;
let players = [];
let match_id = 0;
let powers;
let ball_acc;
let ball_speed;
let game;


const params = new URLSearchParams(window.location.search);

async function sendData()
{
	setInterval(async () => {
		tournamentData = await getTournamentById(tournamentId);
		if (tournamentData) {
			if (tournamentData.player1)
				player1 = await fetchUserById(tournamentData.player1);
			if (tournamentData.player2)
				player2 = await fetchUserById(tournamentData.player2);
			if (tournamentData.player3)
				player3 = await fetchUserById(tournamentData.player3);
			if (tournamentData.player4)
				player4 = await fetchUserById(tournamentData.player4);
			players = [player1, player2, player3, player4];
			sendMessage({...tournamentData, type: "tournament_update"});
		}
	}, 1000);
}

const renderTournamentPageHost = () => {
	return `
	<div id="friendsListDivTournament">
			<div id="friendsTitle"></div>
			<ul id="friendsList">
			</ul>
		</div>
		<div id="tournamentTitle">TOURNAMENT</div>
		<div class="matchup" id="match1">
			<button class="playButton" id="playButtonMatch1" style="display: none;">Play</button>
			<div class="player-name" id="player1">Player 1</div>
			<div class="player-name" id="player2">Player 2</div>
		</div>
		<div class="matchup" id="match2">
			<button class="playButton" id="playButtonMatch2" style="display: none;">Play</button>
			<div class="player-name" id="player3">Player 3</div>
			<div class="player-name" id="player4">Player 4</div>
		</div>

		<div id="firstRoundTree">
			<button id="playButtonMatchV1" style="display: none;">Play</button>
			<div class="playerBranch" id="player1Branch"></div>
			<div class="playerBranch" id="player2Branch"></div>
			<div class="inBetweenBranch" id="inBetweenBranch1"></div>
			<div class="playerBranch" id="player3Branch"></div>
			<div class="playerBranch" id="player4Branch"></div>
			<div class="inBetweenBranch" id="inBetweenBranch2"></div>
			<div class="winnerText" id="winnerText1">Winner</div>
			<div class="winnerText" id="winnerText2">Winner</div>
			<div class="finalBranch" id="finalBranch1"></div>
			<div class="finalBranch" id="finalBranch2"></div>
			<div id="finalInBetween"></div>
			<div id="championDiv"></div>
			<div id="Champion">Champion</div>
		</div>

		<div class="matchup" id="loosersRound">
			<button id="playButtonLooserMatch"style="display: none;">Play</button>
			<div class="player-name" id="looser1">Looser 1</div>
			<div class="player-name" id="looser2">Looser 2</div>
		</div>
		<div id="looserRoundTree">
			<div class="playerBranch" id="player1BranchLooser"></div>
			<div class="playerBranch" id="player2BranchLooser"></div>
			<div class="inBetweenBranch" id="inBetweenBranchLooser"></div>
			<div class="winnerText" id="winnerTextLooser">Winner</div>
		</div>
		<div id="bg"></div>`

}

const renderTournamentPageInvitee = () => {
	return `
		<div id="tournamentTitle">TOURNAMENT</div>
		<div class="matchup" id="match1">
			<button class="playButton" id="playButtonMatch1" style="display: none;">Play</button>
			<div class="player-name" id="player1">Player 1</div>
			<div class="player-name" id="player2">Player 2</div>
		</div>
		<div class="matchup" id="match2">
			<button class="playButton" id="playButtonMatch2" style="display: none;">Play</button>
			<div class="player-name" id="player3">Player 3</div>
			<div class="player-name" id="player4">Player 4</div>
		</div>

		<div id="firstRoundTree">
			<button id="playButtonMatchV1" style="display: none;">Play</button>
			<div class="playerBranch" id="player1Branch"></div>
			<div class="playerBranch" id="player2Branch"></div>
			<div class="inBetweenBranch" id="inBetweenBranch1"></div>
			<div class="playerBranch" id="player3Branch"></div>
			<div class="playerBranch" id="player4Branch"></div>
			<div class="inBetweenBranch" id="inBetweenBranch2"></div>
			<div class="winnerText" id="winnerText1">Winner</div>
			<div class="winnerText" id="winnerText2">Winner</div>
			<div class="finalBranch" id="finalBranch1"></div>
			<div class="finalBranch" id="finalBranch2"></div>
			<div id="finalInBetween"></div>
			<div id="championDiv"></div>
			<div id="Champion">Champion</div>
		</div>

		<div class="matchup" id="loosersRound">
			<button id="playButtonLooserMatch" style="display: none;">Play</button>
			<div class="player-name" id="looser1">Looser 1</div>
			<div class="player-name" id="looser2">Looser 2</div>
		</div>
		<div id="looserRoundTree">
			<div class="playerBranch" id="player1BranchLooser"></div>
			<div class="playerBranch" id="player2BranchLooser"></div>
			<div class="inBetweenBranch" id="inBetweenBranchLooser"></div>
			<div class="winnerText" id="winnerTextLooser">Winner</div>
		</div>
		<div id="bg"></div>`

}

const addEventListeners = async () => {
    try {
        const usersListElement = document.getElementById('friendsListDivTournament');
		user = await fetchUserData();
        if (user && user.friends.length > 0) {
            user.friends.forEach(async (friend) => {
                const listItem = document.createElement('li');
                listItem.classList.add('friendItemTournament');
				let friendInfo = await fetchUserById(friend);
				let username = friendInfo.username;
				if (username.length > 6)
                	listItem.textContent = username.substring(0, 4) + "...";
				else
					listItem.textContent = username;
                const inviteButton = document.createElement('div');
                inviteButton.classList.add('friendItemInvite');
                inviteButton.textContent = 'Invite';
                listItem.appendChild(inviteButton);
                usersListElement.appendChild(listItem);
				const inviteButtons = document.querySelectorAll('.friendItemInvite');
    			inviteButtons.forEach(inviteButton => {
        		inviteButton.addEventListener('click', async (button) => {
            	console.log('Invite button clicked');
				const inviteeInfo = await getUser(username);
				const message = {
					"type": "tournament_invite",
					"tournamentId": tournamentId,
					"hostId": user.id,
					"inviteeId": inviteeInfo.id,
				}
				const inviteInterval = setInterval(() => {
				sendMessage(message);
				if (accepted || declined)
				{
					accepted = false;
					declined = false;
					clearInterval(inviteInterval);
				}
			}, 1000);
        });
    });
            });	
        } else {
			const listItem = document.createElement('li');
			listItem.classList.add('friendItemTournament');
			listItem.textContent = 'No friends found';
		}
    } catch (error) {
        console.error('Failed to fetch user data:', error);
    }
	
    
}

const createGameInTournament = async (game_player1, game_player2) => {
	let body;
	if (game == "pong")
	{
		body = {
			player1: game_player1,
			player2: game_player2,
			game: "pong",
			powers: powers,
			match_type: "online_multiplayer",
			ball_speed: ball_speed,
			ball_acc: ball_acc
		};
	}
	else if (game == "tic-tac-toe") {
		body = {
			player1: game_player1,
			player2: game_player2,
			game: "tic_tac_toe",
			match_type: "online_multiplayer",
			powers: powers
		};
	}
	console.log(body);
	match_id = await createGame(body);
}

const renderPlayButton = async (game_player1, game_player2) => {
	if (user.id == player1.id || user.id == player3.id)
	{
		await createGameInTournament(game_player1, game_player2);
		sendMessage({type: "tournament_match", matchId: match_id, player1: game_player1, player2: game_player2});
	}
	if (match_id == 0) {
		console.log("Match not created"); //change here to show error
		return;
	} else {
		const matchParams = new URLSearchParams();
		matchParams.append('matchId', match_id);
		window.location.href = `/lobby?${matchParams.toString()}`;
	}

}

const renderPlayButtons = async () => {
	const playButtonMatch1 = document.getElementById('playButtonMatch1');
    const playButtonMatch2 = document.getElementById('playButtonMatch2');
    if (user.id == player1.id || user.id == player2.id) {
        playButtonMatch1.style.display = 'block';
        playButtonMatch1.addEventListener('click', async () => {
			renderPlayButton(player1.id, player2.id);
        });
    }
	else if (user.id == player3.id || user.id == player4.id) {
		playButtonMatch2.style.display = 'block';
		playButtonMatch2.addEventListener('click', async () => {
			renderPlayButton(player3.id, player4.id);
		})}
}    

const getPlayers = async () => {
	const playerElements = document.querySelectorAll('.player-name');
	let players = [];
	for (let i = 0; i < playerElements.length; i++) {
		const player = await getUser(playerElements[i].textContent);
		players.push(player.id);
	}
	return players;
}

const receiveInfoFromSocket = (socket) => {
	socket.addEventListener('message', async (event) => {
        const msg = JSON.parse(event.data);
        //console.log('Message received:', msg);
		if (msg.type === 'tournament_invite_response' ) {
			//console.log('Invitation response received:', msg);
			if (msg.status == 'accepted' && user.id == tournamentData.player1) {
				if (tournamentData.player2 == null)
					tournamentData = await updateTournament({id: tournamentId, player2: msg.inviteeId});
				else if (tournamentData.player3 == null)
					tournamentData = await updateTournament({id: tournamentId, player3: msg.inviteeId});
				else if (tournamentData.player4 == null)
					tournamentData = await updateTournament({id: tournamentId, player4: msg.inviteeId});
				accepted = true;
			} else if (msg.status == 'declined') {
				declined = true;
				//handle declined invitation to tournament
				console.log(`User #id ${msg.inviteeName} declined the invitation`);
				return;
			}
		} else if (msg.type === 'tournament_update') {
			//console.log('Tournament update received:', msg);
			if (user.id != msg.player1) {
				delete msg.type;
			 	console.log('Receiving the update');
			 	tournamentData = msg;
			 	if (tournamentData.player1)
					player1 = await fetchUserById(tournamentData.player1);
			 	if (tournamentData.player2)
					player2 = await fetchUserById(tournamentData.player2);
			 	if (tournamentData.player3)
			 		player3 = await fetchUserById(tournamentData.player3);
			 	if (tournamentData.player4)
			 		player4 = await fetchUserById(tournamentData.player4);
			}
			const playerElements = document.querySelectorAll('.player-name');
			players = [player1, player2, player3, player4];
            for (let i = 0; i < players.length; i++) {
                if (players[i] && playerElements[i].textContent === `Player ${i + 1}`) {
					console.log("trying to change the name");
                    playerElements[i].textContent = players[i].username;
                }
            }
		}
		else if (msg.type === 'tournament_match' && user.id != msg.player1 && user.id != msg.player3)
		{
			match_id = msg.matchId;
		}
    });
}

export const renderTournament = async () => {
	socket = await getWebSocket();
	tournamentId = params.get('tournamentId');
	user = await fetchUserData();
	tournamentData = await getTournamentById(tournamentId);
	powers = tournamentData.powers;
	game = tournamentData.game;
	if (game == "pong")
	{
		ball_acc = tournamentData.ball_acc;
		ball_speed = tournamentData.ball_speed;
	}
	const host = await fetchUserById(tournamentData.player1);
	if (!user || !tournamentData || !host) {
		console.log('Failed to fetch tournament data');
		return;
	}
	if (user.id == tournamentData.player1) {
		document.getElementById('content').innerHTML = renderTournamentPageHost();
		document.getElementById('player1').textContent = host.username;
		addEventListeners();
	} else {
		document.getElementById('content').innerHTML = renderTournamentPageInvitee();
		document.getElementById('player1').textContent = host.username;
	}

	if (user.id == tournamentData.player1) {
		sendData();
	}

	const showButtons = setInterval(() => 
	{
		if (player1 && player2 && player3 && player4)
		{
			clearInterval(showButtons);
			renderPlayButtons();
		}
	}, 1000);

	receiveInfoFromSocket(socket);
}