import { sendMessage, getSocket } from './socketHandler.js';
import { fetchUserData, getUser, createTournament , getTournaments, fetchUserById, updateTournament, fetchUsers } from './fetchFunctions.js';
import { getWebSocket } from './singletonSocket.js';

const renderTournamentPage = () => {
	return `
	<div id="friendsListDivTournament">
			<div id="friendsTitle"></div>
			<ul id="friendsList">
			</ul>
		</div>
		<div id="tournamentTitle">TOURNAMENT</div>
		<div class="matchup" id="match1">
			<button id="playButtonMatch1">Play</button>
			<div class="player-name" id="player1">Player 1</div>
			<div class="player-name" id="player2">Player 2</div>
		</div>
		<div class="matchup" id="match2">
			<button id="playButtonMatch2">Play</button>
			<div class="player-name" id="player3">Player 3</div>
			<div class="player-name" id="player4">Player 4</div>
		</div>

		<div id="firstRoundTree">
			<button id="playButtonMatchV1">Play</button>
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
			<button id="playButtonLooserMatch">Play</button>
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

    const updatePlayerNames = (playerName) => {
        const playerElements = document.querySelectorAll('.player-name');
        //for (let playerElement of playerElements) {
        //    if (playerElement.textContent.startsWith('Player')) {
        //        playerElement.textContent = playerName;
        //        break;
        //    }
        //}
    };
	
    const inviteButtons = document.querySelectorAll('.friendItemInvite');
    inviteButtons.forEach(inviteButton => {
        inviteButton.addEventListener('click', async (button) => {
			let socket = getSocket();
            const friendName = button.target.parentElement.textContent;
			// const userData = await fetchUserData();
			// needs to be updated according to the logic when game and tournament is created
			// const tournamentData = await getTournaments();
			const message = {
                "type": "send_invite",
                "game": 'pong',
                "hostId": 1,
                "inviteeId": friendName,
                "matchId": 1
            }
			if (socket.readyState === WebSocket.OPEN) {
                sendMessage(socket, message);
                console.log(`Inviting ${friendName}`);
            } else {
                console.error('WebSocket is not open.');
            }
			// receiveInfoFromSocket(socket);
        });
    });
}

export const renderTournament = () => {
	document.getElementById('content').innerHTML = renderTournamentPage();
	addEventListeners();
}