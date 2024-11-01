import { getWebSocket, sendMessage } from './singletonSocket.js';
import { fetchUserData, getUser, createTournament , getTournamentById, fetchUserById, updateTournament, fetchUsers } from './fetchFunctions.js';

let socket;
const params = new URLSearchParams(window.location.search);

const renderTournamentPageHost = (host) => {
	return `
	<div id="friendsListDivTournament">
			<div id="friendsTitle"></div>
			<ul id="friendsList">
			</ul>
		</div>
		<div id="tournamentTitle">TOURNAMENT</div>
		<div class="matchup" id="match1">
			<button class="playButton" id="playButtonMatch1" style="display: none;">Play</button>
			<div class="player-name" id="player1">${host.username || "Player 1"}</div>
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

const renderTournamentPageInvitee = (host) => {
	return `
		<div id="tournamentTitle">TOURNAMENT</div>
		<div class="matchup" id="match1">
			<button class="playButton" id="playButtonMatch1" style="display: none;">Play</button>
			<div class="player-name" id="player1">${host.username || "Player 1"}</div>
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
        // replace with fetchFriends(), fetching users for testing
		const profileData = await fetchUsers();
        if (profileData && profileData.length > 0) {
            profileData.forEach(friend => {
                const listItem = document.createElement('li');
                listItem.classList.add('friendItemTournament');
				let username = friend.username;
				if (friend.username.length > 5)
					username = friend.username.substring(0, 4) + "...";
                listItem.textContent = username;
                const inviteButton = document.createElement('div');
                inviteButton.classList.add('friendItemInvite');
                inviteButton.textContent = 'Invite';
                listItem.appendChild(inviteButton);
                usersListElement.appendChild(listItem);
            });	
        } else {
			const listItem = document.createElement('li');
			listItem.classList.add('friendItemTournament');
			listItem.textContent = 'No friends found';
		}
    } catch (error) {
        console.error('Failed to fetch user data:', error);
    }
	
    const inviteButtons = document.querySelectorAll('.friendItemInvite');
    inviteButtons.forEach(inviteButton => {
        inviteButton.addEventListener('click', async (button) => {
            const friendName = button.target.parentElement.textContent.substring(0, button.target.parentElement.textContent.length - 6);
			const inviteeInfo = await getUser(friendName);
			// needs to be updated according to the logic when game and tournament is created
			// const tournamentData = await getTournaments();
			const message = {
                "type": "tournament_invite",
                "game": params.get('game'),
                "hostId": params.get('hostId'),
                "inviteeId": inviteeInfo.id,
                "matchId": params.get('matchId')
            }
			if (socket.readyState === WebSocket.OPEN) {
                sendMessage(message);
                console.log(`Inviting ${friendName}`);
            } else {
                console.error('WebSocket is not open.');
            }
        });
    });
}

// const setupPlayers = (players) => {
// 	//add match making logic here
//     const playerElements = document.querySelectorAll('.player-name');
//     for (let i = 0; i < players.length; i++) {
//         playerElements[i].textContent = players[i].username;
//     }
// };

const renderPlayButtons = () => {
	console.log('Rendering play buttons');
	const playButtons = document.querySelectorAll('.playButton');
	//need to change the logic for passing players to lobby
	const player1 = document.getElementById('player1');
	const player2 = document.getElementById('player2');
	playButtons.forEach(playButton => {
		console.log('Adding event listener to play button');
		playButton.style.display = 'block';
		playButton.addEventListener('click', () => {
			const matchParams = new URLSearchParams();
			matchParams.append('player1', player1.textContent);
			matchParams.append('player2', player2.textContent);
			matchParams.append('game', params.get('game'));
			matchParams.append('matchId', params.get('matchId'));
			window.location.href = `/lobby?${matchParams.toString()}`;
		});
	});
}     

const receiveInfoFromSocket = (socket) => {
	socket.addEventListener('message', (event) => {
        const msg = JSON.parse(event.data);
        console.log('Message received:', msg);
		if (msg.type === 'tournament_invite_response') {
			console.log('Invitation response received:', msg);
			if (msg.status == 'accepted') {
				const message = {
					"type": "tournament_invite_accepted",
					"tournamentId": params.get('tournamentId'),
					"inviteeId": inviteeInfo.id,
					"newPlayerId": msg.invitee,
					"newPlayerName": msg.inviteeName,
				}
				if (socket.readyState === WebSocket.OPEN) {
					sendMessage(message);
					console.log(`Inviting ${friendName}`);
				} else {
					console.error('WebSocket is not open.');
				}
			} else {
				//handle declined invitation to tournament
				console.log(`User #id ${msg.invitee} declined the invitation`);
				return;
			}
		} else if (msg.type === 'tournament_invite_accepted') {
			//rerender players names in the grid after they accept the invitation by fetching tournament info
		}
    });
}

export const renderTournament = async () => {
	const user = await fetchUserData();
	const tournament = await getTournamentById(params.get('tournamentId'));
	const host = await getUser(tournament.player1.id); //proper tournament needs to be created
	if (!user || !tournament) {
		document.getElementById('content').innerHTML = '<div>Failed to load tournament</div>';
		return;
	}
	if (user.id == tournament.player1) {
		document.getElementById('content').innerHTML = renderTournamentPageHost(host);
		addEventListeners();
	} else {
		document.getElementById('content').innerHTML = renderTournamentPageInvitee(host);
	}
	socket = await getWebSocket();
	receiveInfoFromSocket(socket);
	if (players.length == 4) {
		setupPlayers(players);
		renderPlayButtons();
	}
}