import { getWebSocket, sendMessage } from './singletonSocket.js';
import { fetchUserData, getUser, createTournament , getTournaments, fetchUserById, updateTournament } from './fetchFunctions.js';
import { getCurrentTime } from './utlis.js'

let userData;
let tournamentData;
let socket = await getWebSocket();
let isExistingTournament = false;

async function invitePlayer(playerNumber)
{
	console.log(playerNumber);
	const usernameInput = document.getElementById(`player${playerNumber}`);
	if (usernameInput.value != "")
	{
		const invitedUser = await getUser(usernameInput.value);
		if (invitedUser != "")
		{
			const Data =
			{
				type: "send_invite",
				tournamentId: tournamentData.id,
				inviteeId: invitedUser.id,
				hostId: userData.id,
				game: "pong",
				tournament: true,
				player_number: playerNumber
			};
			//startOnlineButton.display = 'none';
			await sendMessage(Data);
		}
		else
			alert("This user doesn't exist");
		
	}
	else
		alert('Please enter a username');
	usernameInput.value = '';
}

async function checkExistingTournaments()
{
	const tournamentsArray = await getTournaments();
	for (let i = 0; i < tournamentsArray.length; i++)
	{
		if (tournamentsArray[i].player1 == userData.id)
		{
			tournamentData = tournamentsArray[i];
			console.log("In check existing tournament function");
			console.log(tournamentData);
			isExistingTournament = true;
			return ;
		}
	}
	return ;
}

async function initializingTournament()
{
	const Data =
	{
		game: "pong",
		player1: userData.id,
		start_time: getCurrentTime()
	};
	tournamentData = await createTournament(Data);
	const socketTournamentData =
	{
		type: "new_tournament",
		tournamentId: tournamentData.id,
	};
	await sendMessage(socketTournamentData);
	document.getElementById('player1').textContent = userData.username;
	for(let i = 2; i < 5; i++)
	{
		document.getElementById('button' + i).addEventListener('click', function()
		{
			invitePlayer(i);
		})
	}
}

async function resumeTournament()
{
	console.log("in resume tournament function : " + tournamentData);
	document.getElementById('player1').textContent = userData.username;
	if (tournamentData.player2 != undefined)
	{
		const p2 = await fetchUserById(tournamentData.player2);
		document.getElementById('player2').style.display = 'none';
		document.getElementById('player2Spand').classList.remove('d-none');
		document.getElementById('player2Spand').textContent = p2.username;
		document.getElementById('button2').style.display = 'none';
	}
	else
	{
		document.getElementById('button2').addEventListener('click', function()
		{
			invitePlayer(2);
		})
	}
	if (tournamentData.player3 != undefined)
	{
		const p3 = await fetchUserById(tournamentData.player3);
		document.getElementById('player3').style.display = 'none';
		document.getElementById('player3Spand').classList.remove('d-none');
		document.getElementById('player3Spand').textContent = p3.username;
		document.getElementById('button3').style.display = 'none';
	}
	else
	{
		document.getElementById('button3').addEventListener('click', function()
		{
			invitePlayer(3);
		})
	}
	if (tournamentData.player4 != undefined)
	{
		const p4 = await fetchUserById(tournamentData.player4);
		document.getElementById('player4').style.display = 'none';
		document.getElementById('player4Spand').classList.remove('d-none');
		document.getElementById('player4Spand').textContent = p4.username;
		document.getElementById('button3').style.display = 'none';
	}
	else
	{
		document.getElementById('button4').addEventListener('click', function()
		{
			invitePlayer(4);
		})
	}
}

async function preparePlayer(id, number)
{
	const playerData = await fetchUserById(id);
	console.log(playerData);
	const Data =
	{
		id: tournamentData.id,
		[`player${number}`]: playerData
	};
	tournamentData = updateTournament(Data);
	document.getElementById(`player${number}`).style.display = 'none';
	document.getElementById(`player${number}Spand`).classList.remove('d-none');
	document.getElementById(`player${number}Spand`).textContent = playerData.username;
	document.getElementById(`button${number}`).style.display = 'none';
}

async function socketEvents(event)
{
	const message = JSON.parse(event.data);
	console.log(message);
	if (message.type == 'accept_invite')
		preparePlayer(message.inviteeId, message.player_number);
}

addEventListener("DOMContentLoaded", async function()
{
	userData = await fetchUserData();
	await checkExistingTournaments();
	console.log(isExistingTournament);
	if (isExistingTournament === true)
		resumeTournament();
	else
		initializingTournament();
	socket.addEventListener('message', socketEvents);
});
