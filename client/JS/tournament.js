import { getWebSocket, sendMessage } from './singletonSocket.js';
import { fetchUserData, getUser, createGame , getTournamentById, fetchUserById, updateTournament, fetchUsers } from './fetchFunctions.js';

let socket;
const params = new URLSearchParams(window.location.search);

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
		const profileData = await fetchUserData();
        if (profileData && profileData.friends.length > 0) {
            profileData.friends.forEach(async (friend) => {
                const listItem = document.createElement('li');
                listItem.classList.add('friendItemTournament');
				let friendInfo = await fetchUserById(friend);
				let username = friendInfo.username;
				if (friendInfo.username.length > 6)
					username = friend.username.substring(0, 4) + "...";
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
				const friendName = button.target.parentElement.textContent.substring(0, button.target.parentElement.textContent.length - 6);
				const inviteeInfo = await getUser(friendName);
				// needs to be updated according to the logic when game and tournament is created
				// const tournamentData = await getTournaments();
				const message = {
                "type": "tournament_invite", // needs to be displayed together with friends nofitications
                "tournamentId": params.get('tournamentId'),
				"game": params.get('game'),
				"powers": params.get('powers'),
                "hostId": profileData.id,
                "inviteeId": inviteeInfo.id,
                // "matchId": params.get('matchId')
            }
			sendMessage(message);
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

const renderPlayButtons = async () => {
	const playButtonMatch1 = document.getElementById('playButtonMatch1');
    const playButtonMatch2 = document.getElementById('playButtonMatch2');
    const player1 = document.getElementById('player1');
    const player2 = document.getElementById('player2');
    const player3 = document.getElementById('player3');
    const player4 = document.getElementById('player4');
    if (playButtonMatch1) {
        playButtonMatch1.style.display = 'block';
        playButtonMatch1.addEventListener('click', async () => {
			const match_id = await createGame({
				// "player1": player1.id,
				// "player2": player2.id,
				"game": params.get('game'),
				"powers": params.get('powers'),
				"match_type": "online_multiplayer", // shall we replace it to tournament??
				// "ball_speed": theBallSpeed,
                // "ball_acc": ballAcc.checked
			});
            const matchParams = new URLSearchParams();
            // matchParams.append('player1', player1.id);
            // matchParams.append('player2', player2.id);
            matchParams.append('game', params.get('game'));
            matchParams.append('matchId', match_id);
            window.location.href = `/lobby?${matchParams.toString()}`;
        });
    }

    if (playButtonMatch2) {
        playButtonMatch2.style.display = 'block';
        playButtonMatch2.addEventListener('click', async () => {
			const match_id = await createGame({
				// "player1": player3.id,
				// "player2": player4.id,
				"game": params.get('game'),
				"powers": params.get('powers'),
				"match_type": "online_multiplayer", // shall we replace it to tournament??
				// "ball_speed": theBallSpeed,
				// "ball_acc": ballAcc.checked
			});
            const matchParams = new URLSearchParams();
            // matchParams.append('player1', player3.id);
            // matchParams.append('player2', player4.id);
            matchParams.append('game', params.get('game'));
            matchParams.append('matchId', match_id);
            window.location.href = `/lobby?${matchParams.toString()}`;
        });
    }
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
        console.log('Message received:', msg);
		if (msg.type === 'tournament_invite_response') {
			console.log('Invitation response received:', msg);
			if (msg.status == 'accepted') {
				const tournamentData = await getTournamentById(params.get('tournamentId'));
				const player1 = tournamentData.player1;
				const player2 = tournamentData.player2;
				const player3 = tournamentData.player3;
				const player4 = tournamentData.player4;
				const message = {
					"type": "tournament_invite_accepted",  // accepted or reject in chat notifications
					"tournamentId": params.get('tournamentId'),
					"player1": player1,
					"player2": player2,
					"player3": player3,
					"player4": player4,
					"newPlayerId": msg.inviteeId,
					"newPlayerName": msg.inviteeName,
				}
				sendMessage(message);	
			} else if (msg.status == 'declined') {
				//handle declined invitation to tournament
				console.log(`User #id ${msg.inviteeName} declined the invitation`);
				return;
			}
		} else if (msg.type === 'tournament_invite_accepted') {
			console.log('Invitation accepted:', msg);
			const playerElements = document.querySelectorAll('.player-name');
			const players = [msg.player1, msg.player2, msg.player3, msg.player4];

            for (let i = 0; i < players.length; i++) {
                if (players[i] && playerElements[i].textContent === `Player ${i + 1}`) {
                    playerElements[i].textContent = players[i];
                }
            }
            renderPlayButtons();
		}
    });
}

export const renderTournament = async () => {
	const user = await fetchUserData();
	const tournament = await getTournamentById(params.get('tournamentId'));
	const host = await fetchUserById(tournament.player1);
	if (!user || !tournament || !host) {
		document.getElementById('content').innerHTML = '<div>Failed to load tournament</div>';
		return;
	}
	if (user.id == tournament.player1) {
		document.getElementById('content').innerHTML = renderTournamentPageHost();
		document.getElementById('player1').textContent = host.username;
		addEventListeners();
	} else {
		document.getElementById('content').innerHTML = renderTournamentPageInvitee();
		document.getElementById('player1').textContent = host.username;
	}
	socket = await getWebSocket();
	receiveInfoFromSocket(socket);
	// if (players.length == 4) {
	// 	setupPlayers(players);
	// 	renderPlayButtons();
	// }
}