import { getWebSocket, sendMessage } from './singletonSocket.js';
import { fetchUserData, getUser, createTournament , getTournaments, fetchUserById, updateTournament, fetchUsers } from './fetchFunctions.js';
import { getCurrentTime } from './utlis.js'
import { getSocket } from './socketHandler.js';


// let userData;
// let tournamentData;
// // let socket = await getWebSocket();
// let isExistingTournament = false;
// let players_to_invite = [2, 3, 4];

// async function invitePlayer(playerNumber)
// {
// 	console.log(playerNumber);
// 	const usernameInput = document.getElementById(`player${playerNumber}`);
// 	if (usernameInput.value != "")
// 	{
// 		const invitedUser = await getUser(usernameInput.value);
// 		if (invitedUser != "")
// 		{
// 			const Data =
// 			{
// 				type: "send_invite",
// 				tournamentId: tournamentData.id,
// 				inviteeId: invitedUser.id,
// 				hostId: userData.id,
// 				game: "pong",
// 				tournament: true,
// 				player_number: playerNumber
// 			};
// 			//startOnlineButton.display = 'none';
// 			await sendMessage(Data);
// 		}
// 		else
// 			alert("This user doesn't exist");
		
// 	}
// 	else
// 		alert('Please enter a username');
// 	usernameInput.value = '';
// }

// async function checkExistingTournaments()
// {
// 	const tournamentsArray = await getTournaments();
// 	for (let i = 0; i < tournamentsArray.length; i++)
// 	{
// 		if (tournamentsArray[i].player1 == userData.id)
// 		{
// 			tournamentData = tournamentsArray[i];
// 			console.log("In check existing tournament function");
// 			console.log(tournamentData);
// 			isExistingTournament = true;
// 			return ;
// 		}
// 	}
// 	return ;
// }

// async function initializingTournament()
// {
// 	const Data =
// 	{
// 		game: "pong",
// 		player1: userData.id,
// 		start_time: getCurrentTime()
// 	};
// 	tournamentData = await createTournament(Data);
// 	const socketTournamentData =
// 	{
// 		type: "new_tournament",
// 		tournamentId: tournamentData.id,
// 	};
// 	await sendMessage(socketTournamentData);
// 	document.getElementById('player1').textContent = userData.username;
// 	document.getElementById('match-player1').textContent = userData.username;
// 	for(let i = 2; i < 5; i++)
// 	{
// 		document.getElementById('button' + i).addEventListener('click', function()
// 		{
// 			invitePlayer(i);
// 		})
// 	}
// }

// async function resumeTournament()
// {
// 	console.log("in resume tournament function : " + tournamentData);
// 	document.getElementById('player1').textContent = userData.username;
// 	if (tournamentData.player2 != undefined)
// 	{
// 		const p2 = await fetchUserById(tournamentData.player2);
// 		document.getElementById('player2').style.display = 'none';
// 		document.getElementById('player2Spand').classList.remove('d-none');
// 		document.getElementById('player2Spand').textContent = p2.username;
// 		document.getElementById('button2').style.display = 'none';
// 	}
// 	else
// 	{
// 		document.getElementById('button2').addEventListener('click', function()
// 		{
// 			invitePlayer(2);
// 		})
// 	}
// 	if (tournamentData.player3 != undefined)
// 	{
// 		const p3 = await fetchUserById(tournamentData.player3);
// 		document.getElementById('player3').style.display = 'none';
// 		document.getElementById('player3Spand').classList.remove('d-none');
// 		document.getElementById('player3Spand').textContent = p3.username;
// 		document.getElementById('button3').style.display = 'none';
// 	}
// 	else
// 	{
// 		document.getElementById('button3').addEventListener('click', function()
// 		{
// 			invitePlayer(3);
// 		})
// 	}
// 	if (tournamentData.player4 != undefined)
// 	{
// 		const p4 = await fetchUserById(tournamentData.player4);
// 		document.getElementById('player4').style.display = 'none';
// 		document.getElementById('player4Spand').classList.remove('d-none');
// 		document.getElementById('player4Spand').textContent = p4.username;
// 		document.getElementById('button3').style.display = 'none';
// 	}
// 	else
// 	{
// 		document.getElementById('button4').addEventListener('click', function()
// 		{
// 			invitePlayer(4);
// 		})
// 	}
// }

// function fillRemainingPlayers(Data)
// {
// 	if (tournamentData.player2 != undefined)
// 		Data["player2"] = tournamentData.player2;
// 	else
// 		Data["player2"] = null;
// 	if (tournamentData.player2 != undefined)
// 		Data["player3"] = tournamentData.player3;
// 	else
// 		Data["player3"] = null;
// 	if (tournamentData.player2 != undefined)
// 		Data["player4"] = tournamentData.player4;
// 	else
// 		Data["player4"] = null;
// }

// async function preparePlayer(id, number)
// {
// 	const playerData = await fetchUserById(id);
// 	const Data =
// 	{
// 		id: tournamentData.id,
// 		[`player${number}`]: playerData.id,
// 		player1: userData.id,

// 	};
// 	const index = players_to_invite.findIndex(item => item === number);
// 	players_to_invite.splice(index, 1);
// 	tournamentData = await updateTournament(Data);
// 	fillRemainingPlayers(Data);
// 	Data["type"] = "update_tournament";
// 	await sendMessage(Data);
// 	document.getElementById(`player${number}`).style.display = 'none';
// 	document.getElementById(`player${number}Spand`).classList.remove('d-none');
// 	document.getElementById(`player${number}Spand`).textContent = playerData.username;
// 	document.getElementById(`button${number}`).style.display = 'none';
// 	document.getElementById(`match-player${number}`)
// 	if (players_to_invite.length == 0)
// 		document.getElementById('startTournamentButton').classList.remove('d-none');
// }

// async function socketEvents(event)
// {
// 	const message = JSON.parse(event.data);
// 	console.log(message);
// 	if (message.type == 'accept_invite')
// 		preparePlayer(message.inviteeId, message.player_number);
// }

// addEventListener("DOMContentLoaded", async function()
// {
// 	userData = await fetchUserData();
// 	await checkExistingTournaments();
// 	console.log(isExistingTournament);
// 	if (isExistingTournament === true)
// 		resumeTournament();
// 	else
// 		initializingTournament();
// 	socket.addEventListener('message', socketEvents);
// });

const addEventListeners = async () => {
	const socket = getSocket();
	try {
		const usersListElement = document.getElementById('usersList');
		const noFriendsMessageElement = document.getElementById('noFriendsMessage');
		const profileData = await fetchUsers();

		if (profileData && profileData.length > 0) {
            profileData.forEach(friend => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                const friendName = document.createElement('span');
            	friendName.textContent = friend.username;
				const inviteButton = document.createElement('button');
            inviteButton.classList.add('btn', 'btn-primary');
            inviteButton.textContent = 'Invite';
            listItem.appendChild(friendName);
            listItem.appendChild(inviteButton);
            usersListElement.appendChild(listItem);
                
            });
            noFriendsMessageElement.style.display = 'none';
        } else {
            noFriendsMessageElement.style.display = 'block';
        }
	} catch (error) {
        console.error('Failed to fetch user data:', error);
    }
	const inviteButtons = document.querySelectorAll('.btn-primary');
	inviteButtons.forEach(inviteButton => {
		inviteButton.addEventListener('click', async (event) => {
			const friendName = event.target.parentElement.querySelector('span').textContent;
			console.log(`Inviting ${friendName}`);
			// Send invite to friend
			socket.onopen = () => {
				sendMessage(socket, {
					type: "send_invite",
					tournamentId: tournamentData.id,
					inviteeId: invitedUser.id,
					hostId: userData.id,
					game: "pong",
					tournament: true,
					player_number: playerNumber
			})};
		});
	});
}

const renderTournamentPage = () => {
	return `
	<div>
    <h2>All players</h2>
    <ul id="usersList" class="list-group">
        <!-- Users will be dynamically inserted here -->
    </ul>
    <div id="noFriendsMessage" style="display: none; color: black;">No players yet</div>
</div>
<div class="bracket">
    <h1>4 Player Tournament Bracket</h1>
    <!-- Round 1 -->
    <div class="round">
        <div class="matchup">
            <div class="player" id="player1">Player 1</div>
            <button class="play-button">Play</button>
            <div class="player" id="player2">Player 2</div>
        </div>
        <div class="matchup">
            <div class="player" id="player3">Player 3</div>
            <button class="play-button">Play</button>
            <div class="player" id="player4">Player 4</div>
        </div>
    </div>

    <!-- Connectors for round 1 -->
    <div class="round">
        <div class="connector"></div>
        <div class="connector"></div>
    </div>

    <!-- Finals -->
    <div class="round">
        <div class="matchup">
            <div class="player">Winner 1</div>
            <button class="play-button">Play</button>
            <div class="player">Winner 2</div>
        </div>
    </div>

    <!-- Connector for final -->
    <div class="round">
        <div class="connector"></div>
    </div>

    <!-- Champion -->
    <div class="round">
        <div class="player winner">Champion</div>
    </div>
</div>`

}

export const renderTournament = () => {
	document.getElementById('content').innerHTML = renderTournamentPage();
	addEventListeners();
}