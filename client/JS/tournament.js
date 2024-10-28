import { getWebSocket, sendMessage } from './singletonSocket.js';
import { fetchUserData, getUser, createTournament , getTournaments, fetchUserById, updateTournament, fetchUsers } from './fetchFunctions.js';
import { getCurrentTime } from './utlis.js'
import { getSocket } from './socketHandler.js';

const addEventListeners = async () => {
    const socket = getSocket();
    try {
        const usersListElement = document.getElementById('friendsList');
        //const noFriendsMessageElement = document.getElementById('noFriendsMessage');
        const profileData = await fetchUsers();

        if (profileData && profileData.length > 0) {
            profileData.forEach(friend => {
                const listItem = document.createElement('li');
                listItem.classList.add('friendItemTournament');
                listItem.textContent = friend.username;
                const inviteButton = document.createElement('div');
                inviteButton.classList.add('friendItemInvite');
                inviteButton.textContent = 'Invite';
                listItem.appendChild(inviteButton);
                usersListElement.appendChild(listItem);
            });
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
            const friendName = button.target.parentElement.firstChild.textContent.trim();
            console.log(`Inviting ${friendName}`);
            
        });
    });
}

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
		<div id="bg"></div>`

}

export const renderTournament = () => {
	document.getElementById('content').innerHTML = renderTournamentPage();
	addEventListeners();
}