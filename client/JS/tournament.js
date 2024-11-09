import { getWebSocket, sendMessage } from './singletonSocket.js';
import { fetchUserData, getUser, createGame , getTournamentById, fetchUserById, updateTournament, fetchMatch } from './fetchFunctions.js';
import { BACKEND_URL } from './appconfig.js';

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
let winner1 = null;
let winner2 = null;
let loser1 = null;
let loser2 = null;
let champion = null;
let second = null;
let third = null;
let start_loser;
let start_winner;
const inviteButtonsMap = new Map();


const params = new URLSearchParams(window.location.search);

async function sendData()
{
	setInterval(async () => {
		tournamentData = await getTournamentById(tournamentId);
		if (tournamentData) {
			if (tournamentData.player1 && !player1)
				player1 = await fetchUserById(tournamentData.player1);
			if (tournamentData.player2 && !player2)
				player2 = await fetchUserById(tournamentData.player2);
			if (tournamentData.player3 && !player3)
				player3 = await fetchUserById(tournamentData.player3);
			if (tournamentData.player4 && !player4)
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
			<ul id="friendsList" style="display: none;">
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
			<div class="winnerText" id="winnerText1">Winner 1</div>
			<div class="winnerText" id="winnerText2">Winner 2</div>
			<div class="finalBranch" id="finalBranch1"></div>
			<div class="finalBranch" id="finalBranch2"></div>
			<div id="finalInBetween"></div>
			<div id="championDiv"></div>
			<div id="Champion">Champion</div>
		</div>

		<div class="matchup" id="loosersRound">
			<button id="playButtonLooserMatch"style="display: none;">Play</button>
			<div class="player-name" id="looser1">Loser 1</div>
			<div class="player-name" id="looser2">Loser 2</div>
		</div>
		<div id="looserRoundTree">
			<div class="playerBranch" id="player1BranchLooser"></div>
			<div class="playerBranch" id="player2BranchLooser"></div>
			<div class="inBetweenBranch" id="inBetweenBranchLooser"></div>
			<div class="winnerText" id="winnerTextLooser">Winner</div>
		</div>
		<div id="tournamentEnded">
			<text class="tournamentWinnerText">Winner</text>
			<text class="tournamentWinnerText" id="theChampion"></text>
			<a id="goBackHome" href="/">Go Home</a>
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
		<div id="tournamentEnded">
			<text class="tournamentWinnerText">Winner</text>
			<text class="tournamentWinnerText" id="theChampion"></text>
			<a id="goBackHome" href="/">Go Home</a>
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
				inviteButtonsMap.set(friend, inviteButton);
				const inviteButtons = document.querySelectorAll('.friendItemInvite');
    			inviteButtons.forEach(inviteButton => {
        		inviteButton.addEventListener('click', async () => {
				inviteButton.classList.add('inactive');
            	inviteButton.textContent = 'Waiting...';
            	inviteButton.disabled = true;
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

const renderPlayButton = async () => {
	if (match_id == 0) {
		showNotification('Match not created. Please wait for the other player to create a match.');
	} else {
		const matchParams = new URLSearchParams();
		matchParams.append('matchId', match_id);
		window.location.href = `/lobby?${matchParams.toString()}`;
	}
}

const renderPlayButtons = async () => {
	if (tournamentData.final_match)
		start_winner = await fetchMatch(tournamentData.final_match);
	if (tournamentData.playoff)
		start_loser = await fetchMatch(tournamentData.playoff);
	if (tournamentData.match1 == null)
	{
		const playButtonMatch1 = document.getElementById('playButtonMatch1');
		const playButtonMatch2 = document.getElementById('playButtonMatch2');
		if (user.id == player1.id || user.id == player2.id) {
			playButtonMatch1.style.display = 'block';
			if (user.id == player1.id)
			{
				await createGameInTournament(player1.id, player2.id);
				const body = {
					id: tournamentId,
					match1: match_id
				};
				tournamentData = await updateTournament(body);
				sendMessage({type: "tournament_match", matchId: match_id, opponentId: player2.id});
				console.log({type: "tournament_match", matchId: match_id, opponentId: player2.id});
			}
			playButtonMatch1.addEventListener('click', async () => {
				renderPlayButton(player1.id, player2.id);
			});
		}
		else if (user.id == player3.id || user.id == player4.id)
		{
			console.log("Going to the second match"); 
			playButtonMatch2.style.display = 'block';
			if (user.id == player3.id)
			{
				await createGameInTournament(player3.id, player4.id);
				const body = {
					id: tournamentId,
					match2: match_id
				};
				tournamentData = await updateTournament(body);
				sendMessage({type: "tournament_match", matchId: match_id, opponentId: player4.id});
				console.log({type: "tournament_match", matchId: match_id, opponentId: player4.id});
			}
			playButtonMatch2.addEventListener('click', async () => {
				renderPlayButton(player3.id, player4.id);
			});
		}
	}
	else if (!tournamentData.final_match || !tournamentData.playoff)
		renderSecondRound();
	else if (tournamentData.final_match && !tournamentData.playoff)
	{
		if (start_winner.start_time == null)
			renderSecondRound();
	}
	else if (!tournamentData.final_match && tournamentData.playoff)
	{
		if (start_loser.start_time == null)
			renderSecondRound();
	}
	else if (tournamentData.final_match && tournamentData.playoff)
	{
		if (start_loser.start_time == null || start_winner.start_time == null)
		{
			if (start_winner.end_time != null || start_loser.end_time != null)
				renderEnd();
			else
				renderSecondRound();
		}
		else
			renderEnd();
	}
}

async function getPodium(winMatch, loseMatch)
{
	console.log("Win match : ", winMatch);
	console.log("lose match : ", loseMatch);
	if (winMatch.player1_score > winMatch.player2_score && winMatch.player1_score >= 3)
	{
		champion = await fetchUserById(winMatch.player1);
		second = await fetchUserById(winMatch.player2);
	}
	else if (winMatch.player2_score > winMatch.player1_score && winMatch.player2_score >= 3)
	{
		console.log("trying to fetch stuff");
		champion = await fetchUserById(winMatch.player2);
		second = await fetchUserById(winMatch.player1);
	}
	if (loseMatch.player1_score > loseMatch.player2_score && loseMatch.player1_score >= 3)
		third = await fetchUserById(loseMatch.player1);
	else if (loseMatch.player2_score > loseMatch.player1_score && loseMatch.player2_score >= 3)
		third = await fetchUserById(loseMatch.player2);
}

async function renderEnd()
{
	const winnerTextLoser = document.getElementById('winnerTextLooser'); 
	const Champion = document.getElementById('Champion');
	const winner1Element = document.getElementById('winnerText1');
	const winner2Element = document.getElementById('winnerText2');
	const loser1Text = document.getElementById('looser1');
	const loser2Text = document.getElementById('looser2');
	document.getElementById('player1').textContent = player1.username;
	document.getElementById('player2').textContent = player2.username;
	document.getElementById('player3').textContent = player3.username;
	document.getElementById('player4').textContent = player4.username;
	const waitingChampion = setInterval(async() =>
	{
		tournamentData = await getTournamentById(tournamentId);
		const matcha1 = await fetchMatch(tournamentData.match1);
		const matcha2 = await fetchMatch(tournamentData.match2);
		getWinnerMatch1(matcha1);
		getWinnerMatch2(matcha2);
		if (winner1)
		{
			winner1Element.textContent = winner1.username;
			loser1Text.textContent = loser1.username;
		}
		if (winner2)
		{
			winner2Element.textContent = winner2.username;
			loser2Text.textContent = loser2.username;
		}
		tournamentData = await getTournamentById(tournamentId);
		const match1 = await fetchMatch(tournamentData.final_match);
		const match2 = await fetchMatch(tournamentData.playoff);
		getPodium(match1, match2);
		console.log("this is the champ : ", champion);
		console.log("this is the second : ", second);
		console.log("this is the third : ", third);
		if (champion != null)
		{
			Champion.textContent = champion.username;
			console.log("This is the champion", champion);
		}
		if (third != null)
		{
			winnerTextLoser.textContent = third.username;
			console.log("This is the third place", third);
		}
		if (champion != null && third != null)
		{
			if (user.id == player1.id)
			{
				const body = {
					id: tournamentId,
					first_place: champion.id,
					second_place: second.id,
					third_place: third.id,
					end_time: new Date()
				}
				tournamentData = await updateTournament(body);
			}
			clearInterval(waitingChampion);
			let opacity = 0;
			const winBg = document.getElementById('tournamentEnded');
			winBg.style.display = "flex";
			winBg.style.backgroundImage = `url(${BACKEND_URL}/media/tournament-bg.gif)`;
			document.getElementById('theChampion').textContent = champion.username;
			const showBg = setInterval(() =>
			{
				opacity += 0.01;
				winBg.style.opacity = opacity;
				if (opacity >= 1)
					clearInterval(showBg);
			}, 10);
		}
	}, 1000);
}

const showNotification = (message) => {
    const notificationElement = document.createElement('div');
    notificationElement.classList.add('tournamentNotification');
    notificationElement.textContent = message;
    document.body.appendChild(notificationElement);

    setTimeout(() => {
        notificationElement.remove();
    }, 3000);
};

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
				const inviteButton = inviteButtonsMap.get(msg.inviteeId);
				if (inviteButton) {
					inviteButton.textContent = 'Joined';
				}
			} else if (msg.status == 'declined') {
				declined = true;
				showNotification(`User ${msg.inviteeName} declined the invitation`);
				const inviteButton = inviteButtonsMap.get(msg.inviteeId);
				if (inviteButton) {
					inviteButton.classList.remove('inactive');
					inviteButton.textContent = 'Invite';
					inviteButton.disabled = false;
				}
				return;
			}
		} else if (msg.type === 'tournament_update') {
			//console.log('Tournament update received:', msg);
			if (user.id != msg.player1) {
				delete msg.type;
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
                    playerElements[i].textContent = players[i].username;
                }
            }
		}
		else if (msg.type === 'tournament_match')
		{
			match_id = msg.matchId;
			console.log("trying to Update my MatchID !", msg);
		}
    });
}

const getWinnerMatch1 = async (match) => {
	if (match.player1_score > match.player2_score && match.player1_score >= 3)
	{
		winner1 = await fetchUserById(match.player1);
		loser1 = await fetchUserById(match.player2);
	}
	else if (match.player2_score > match.player1_score && match.player2_score >= 3)
	{
		winner1 = await fetchUserById(match.player2);
		loser1 = await fetchUserById(match.player1);
	}
}

const getWinnerMatch2 = async (match) => {
	if (match.player1_score > match.player2_score && match.player1_score >= 3)
	{
		winner2 = await fetchUserById(match.player1);
		loser2 = await fetchUserById(match.player2);
		
	}
	else if (match.player2_score > match.player1_score && match.player2_score >= 3)
	{
		winner2 = await fetchUserById(match.player2);
		loser2 = await fetchUserById(match.player1);
	}
}

async function finishedWaiting()
{
	const playButtonLooserMatch = document.getElementById('playButtonLooserMatch');
	const playButtonMatchV1 = document.getElementById('playButtonMatchV1');
	if (user.id == winner1.id || user.id == winner2.id) {
		console.log("I won the first match!");
		if (user.id == winner1.id)
		{
			playButtonMatchV1.style.display = 'block';
			await createGameInTournament(winner1.id, winner2.id);
			const body = {
				id: tournamentId,
				final_match: match_id
			};
			tournamentData = await updateTournament(body);
		}
		if (user.id == winner2.id)
		{
			const checkingmatch = setInterval(async() =>
			{
				tournamentData = await getTournamentById(tournamentId);
				if (tournamentData.final_match)
				{
					match_id = tournamentData.final_match;
					playButtonMatchV1.style.display = 'block';
					clearInterval(checkingmatch);
				}
			}, 1000);
		}
		playButtonMatchV1.addEventListener('click', async () => {
			if (match_id == 0) {
				showNotification('Match not created. Please wait for the other player to create a match.');
			} else {
				const matchParams = new URLSearchParams();
				matchParams.append('matchId', match_id);
				matchParams.append('tournamentId', tournamentId);
				window.location.href = `/lobby?${matchParams.toString()}`;
			}
		});
	}
	else if (user.id == loser1.id || user.id == loser2.id)
	{
		console.log("This is the first loser : ", loser1);
		console.log("This is the second loser : ", loser2);
		if (user.id == loser1.id)
		{
			playButtonLooserMatch.style.display = 'block';
			await createGameInTournament(loser1.id, loser2.id);
			const body = {
				id: tournamentId,
				playoff: match_id
			};
			tournamentData = await updateTournament(body);
		}
		if (user.id == loser2.id)
		{
			const checkingmatch = setInterval(async() =>
			{
				tournamentData = await getTournamentById(tournamentId);
				if (tournamentData.playoff)
				{
					match_id = tournamentData.playoff;
					playButtonLooserMatch.style.display = 'block';
					clearInterval(checkingmatch);
				}
			}, 1000);
		}
		playButtonLooserMatch.addEventListener('click', async () => {
			if (match_id == 0) {
				showNotification('Match not created. Please wait for the other player to create a match.');
			} else {
				const matchParams = new URLSearchParams();
				matchParams.append('matchId', match_id);
				window.location.href = `/lobby?${matchParams.toString()}`;
			}
		});
	}
}

const renderSecondRound = async () => {
	document.getElementById('player1').textContent = player1.username;
	document.getElementById('player2').textContent = player2.username;
	document.getElementById('player3').textContent = player3.username;
	document.getElementById('player4').textContent = player4.username;
	const winner1Element = document.getElementById('winnerText1');
	const winner2Element = document.getElementById('winnerText2');
	const loser1Text = document.getElementById('looser1');
	const loser2Text = document.getElementById('looser2');
	console.log("getting into the function")
	const waitingWinners = setInterval(async() =>
	{
		tournamentData = await getTournamentById(tournamentId);
		const match1 = await fetchMatch(tournamentData.match1);
		const match2 = await fetchMatch(tournamentData.match2);
		console.log("This is the first match", match1);
		console.log("This is the second match", match2);
		getWinnerMatch1(match1);
		getWinnerMatch2(match2);
		if (winner1 != null)
		{
			winner1Element.textContent = winner1.username;
			loser1Text.textContent = loser1.username;
			console.log("This is the first winner", winner1);
		}
		if (winner2 != null)
		{
			winner2Element.textContent =  winner2.username;
			loser2Text.textContent = loser2.username;
			console.log("This is the second winner", winner2);
		}
		if (winner1 != null && winner2 != null)
		{
			clearInterval(waitingWinners);
			finishedWaiting();
		}
	}, 1000);	
}

export const renderTournament = async () => {
	socket = await getWebSocket();
	tournamentId = params.get('tournamentId');
	user = await fetchUserData();
	tournamentData = await getTournamentById(tournamentId);
	console.log("This is the tournament data : ", tournamentData);
	if (tournamentData.player1)
		player1 = await fetchUserById(tournamentData.player1);
	if (tournamentData.player2)
		player2 = await fetchUserById(tournamentData.player2);
	if (tournamentData.player3)
		player3 = await fetchUserById(tournamentData.player3);
	if (tournamentData.player4)
		player4 = await fetchUserById(tournamentData.player4);
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

	if (user.id == tournamentData.player1 && tournamentData.match1 == null && tournamentData.match2 == null)
		sendData();

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