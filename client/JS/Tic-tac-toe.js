import { fetchUserData, updateGame, createGame } from './fetchFunctions.js';
import { getCurrentTime } from './utils.js';

const gridItems = document.querySelectorAll('.grid-item');
const score = document.getElementById('score');
var gameModeModal = document.getElementById('gameModeModal');
var page = document.getElementById('page');
const background = document.getElementById('contentArea');
const powersInput = document.getElementById('powers');
const powersMenu = document.getElementById('customizationModal');
const powerPlayerDiv = document.getElementById('powerPlayer');
const powerEnemyDiv = document.getElementById('powerEnemy');
const startDiv = document.getElementById('start-button');
const victoryModal = document.getElementById('victoryModal');
const victoryTitle = document.getElementById('victorytitle');
const endScore = document.getElementById('endScore');
let player_score = 0;
let enemy_score = 0;
let player1Id;
let start = false;
let single = false;
let multi = false;
let turn = 1;
let player_sign = "X";
let enemy_sign = "O";
let switch_power = false;
let matchId;
let finish = false;

function hideModal()
{
	gameModeModal.classList.remove('show');
	gameModeModal.style.display = 'none';
	powersMenu.classList.add('show');
        powersMenu.style.display = 'block';
	startDiv.addEventListener('click', async function()
	{
		if(powersInput.checked)
		{
			powerPlayerDiv.classList.add('show');
			powerPlayerDiv.style.display = 'block';
			powerEnemyDiv.classList.add('show');
			powerEnemyDiv.style.display = 'block';
			switch_power = true;
		}
		powersMenu.classList.remove('show');
		powersMenu.style.display = 'none';
		const matchData =
		{
			game: "tic_tac_toe",
			player1: player1Id,
			match_type: single ? "singleplayer" : multi ? "local_multiplayer" : "unknown"
		};
		matchId = await createGame(matchData);
		page.classList.remove('blur');
		start = true;
	});
}

async function reset_game()
{
	victoryModal.classList.add('show');
	victoryModal.style.display = 'block';
	if (player_score === 5)
		victoryTitle.textContent = "Victory!";
	else if (enemy_score === 5)
		victoryTitle.textContent = "You lose!";
	endScore.textContent = player_score + " : " + enemy_score;
	const restartButton = document.getElementById('restart-button');
	const mainMenuButton = document.getElementById('main-menu-button');
	finish = true;
	start = false;
	single = false;
	multi = false;
	turn = 1;
	enemy_sign = "O";
	gridItems.forEach((item) =>
	{
		item.addEventListener('click', function()
		{
			clearInterval(item);
		});
	});
	mainMenuButton.addEventListener('click', async function ()
	{
		
	});
	restartButton.addEventListener('click', async function()
	{
		player_score = 0;
		enemy_score = 0;
		finish = false;
		victoryModal.classList.remove('show');
		victoryModal.style.display = 'none';
		await fetchUserData().then(data =>
		{
			player1Id = data.id;
			if (data.tic_tac_toe_background < 8 && data.tic_tac_toe_background >= 1)
			{
				background.style.backgroundImage = `url(../Assets/bg${data.tic_tac_toe_background}.jpg)`;
				background.style.backgroundSize = "cover";
			}
			else if (data.tic_tac_toe_background == 8)
			{
				background.style.background = "linear-gradient(90deg, black, rgb(81, 4, 114))";
				background.style.backgroundSize = "200% 200%";
				background.style.animation = "gradientAnimation 5s ease infinite";
			}
			if (data.tic_tac_toe_sign <= 9 && data.tic_tac_toe_sign >= 1)
			{
				switch(data.tic_tac_toe_sign)
				{
					case 1 :
						player_sign = '$';
						break ;
					case 2 :
						player_sign = '█';
						break ;
					case 3 :
						player_sign = '©';
						break ;
					case 4 :
						player_sign = '¾';
						break ;
					case 5 :
						player_sign = '╬';
						break ;
					case 6 :
						player_sign = '░';
						break ;
					case 7 :
						player_sign = '≡';
						break ;
					case 8 :
						player_sign = 'X';
						break ;
					case 9 :
						player_sign = 'O';
						enemy_sign = 'X';
						break ;
				}
			}
			
		})
		gameModeModal.classList.add('show');
		gameModeModal.style.display = 'block';
		gameModeModal.setAttribute('aria-modal', 'true');
		gameModeModal.setAttribute('role', 'dialog');
		page.classList.add('blur'); // Add blur effect to the background
	
		const singleplayerBtn = document.getElementById('singleplayer-btn');
		const multiplayerBtn = document.getElementById('multiplayer-btn');
		singleplayerBtn.addEventListener('click', function ()
		{
			single = true;
			hideModal();
			clearInterval(singleplayerBtn);
		});
		multiplayerBtn.addEventListener('click', function()
		{
			multi = true;
			hideModal();
			clearInterval(multiplayerBtn);
		});
	});
}

document.addEventListener("DOMContentLoaded", async function()
{
	await fetchUserData().then(data =>
	{
		player1Id = data.id;
		if (data.tic_tac_toe_background < 8 && data.tic_tac_toe_background >= 1)
		{
			background.style.backgroundImage = `url(../Assets/bg${data.tic_tac_toe_background}.jpg)`;
			background.style.backgroundSize = "cover";
		}
		else if (data.tic_tac_toe_background == 8)
		{
			background.style.background = "linear-gradient(90deg, black, rgb(81, 4, 114))";
			background.style.backgroundSize = "200% 200%";
			background.style.animation = "gradientAnimation 5s ease infinite";
		}
		if (data.tic_tac_toe_sign <= 9 && data.tic_tac_toe_sign >= 1)
		{
			switch(data.tic_tac_toe_sign)
			{
				case 1 :
					player_sign = '$';
					break ;
				case 2 :
					player_sign = '█';
					break ;
				case 3 :
					player_sign = '©';
					break ;
				case 4 :
					player_sign = '¾';
					break ;
				case 5 :
					player_sign = '╬';
					break ;
				case 6 :
					player_sign = '░';
					break ;
				case 7 :
					player_sign = '≡';
					break ;
				case 8 :
					player_sign = 'X';
					break ;
				case 9 :
					player_sign = 'O';
					enemy_sign = 'X';
					break ;
			}
		}
		
	})
	victoryModal.classList.remove('show');
	victoryModal.style.display = "none";
	powersMenu.classList.remove('show');
	powersMenu.style.display = "none";
	powerPlayerDiv.classList.remove('show');
	powerPlayerDiv.style.display = "none";
	powerEnemyDiv.classList.remove('show');
	powerEnemyDiv.style.display = "none";
	gameModeModal.classList.add('show');
        gameModeModal.style.display = 'block';
        gameModeModal.setAttribute('aria-modal', 'true');
        gameModeModal.setAttribute('role', 'dialog');
        page.classList.add('blur'); // Add blur effect to the background

        const singleplayerBtn = document.getElementById('singleplayer-btn');
        const multiplayerBtn = document.getElementById('multiplayer-btn');
	singleplayerBtn.addEventListener('click', function ()
	{
		single = true;
		hideModal();
		clearInterval(singleplayerBtn);
	});
	multiplayerBtn.addEventListener('click', function()
	{
		multi = true;
		hideModal();
		clearInterval(multiplayerBtn);
	});
});

function freeSpace()
{
	let i = 0;
	while (i < 9)
	{
		if (gridItems[i].textContent.trim() == '')
			return 1;
		i++;
	}
	return 0;
}

function checkWinCondition()
{
	const gridItems = document.querySelectorAll('.grid-item');
	const cells = Array.from(gridItems).map(item => item.textContent.trim());
	const horizontal =
	[
	    [0, 1, 2],
	    [3, 4, 5],
	    [6, 7, 8]
	];

	const vertical =
	[
	    [0, 3, 6],
	    [1, 4, 7],
	    [2, 5, 8]
	];

	const diagonal =
	[
	    [0, 4, 8],
	    [2, 4, 6]
	];
    
	function isMatching(a, b, c)
	{
	    return cells[a] !== '' && cells[a] === cells[b] && cells[a] === cells[c];
	}
    
	for (let combo of horizontal)
	{
		if (isMatching(combo[0], combo[1], combo[2]))
		{
			console.log(`Winning combo at cells: ${combo}`);
			return cells[combo[0]];
		}
	}
    

	for (let combo of vertical)
	{
		if (isMatching(combo[0], combo[1], combo[2]))
		{
			console.log(`Winning combo at cells: ${combo}`);
			return cells[combo[0]];
		}
	}
    
	for (let combo of diagonal)
	{
		if (isMatching(combo[0], combo[1], combo[2]))
		{
			console.log(`Winning combo at cells: ${combo}`);
			return cells[combo[0]];
		}
	}
	return null;
}

function next_game()
{
	let winner = checkWinCondition();
	if (winner)
	{
		console.log(`We have a winner: ${winner}`);
		if (winner == player_sign)
			player_score++;
		else
			enemy_score++;
		let i = 0;
		while (i < 9)
			gridItems[i++].textContent = '';

	}
	else
	{
		let i = 0;
		let count = 0;
		while (i < 9)
		{
			if (gridItems[i].textContent.trim() != '')
				count++;
			i++;
		}
		if (count == 9)
		{
			console.log("got here");
			i = 0;
			while (i < 9)
				gridItems[i++].textContent = '';
		}
		count = 0;
	}
	const currentTime = getCurrentTime();
	const matchData =
	{
		id: matchId,
		player1_score: player_score,
		player2_score: enemy_score,
		end_time: currentTime,
	};
	updateGame(matchData);
	score.textContent = player_score + " : " + enemy_score;
	if (player_score >= 5 || enemy_score >= 5)
		reset_game();
}

gridItems.forEach((item, index) =>
{
	item.addEventListener('click', function()
	{
		console.log(player_sign);
		if (item.textContent.trim() === '')
		{
			if (single)
			{
				item.textContent = player_sign;
				let random = Math.floor(Math.random() * 9);
				if (freeSpace() == 1 && single)
				{
					while (gridItems[random].textContent.trim() == player_sign || gridItems[random].textContent.trim() == enemy_sign)
						random = Math.floor(Math.random() * 9);
					gridItems[random].textContent = enemy_sign;
				}
			}
			else if (multi)
			{
				if (turn === 1)
				{
					turn = 2;
					item.textContent = player_sign;
				}
				else if (turn === 2)
				{
					turn = 1;
					item.textContent = enemy_sign;
				}
			}
			next_game();
		}
	});
});