const gridItems = document.querySelectorAll('.grid-item');
const score = document.getElementById('score');
let player_score = 0;
let enemy_score = 0;


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
	winner = checkWinCondition();
	if (winner)
	{
		console.log(`We have a winner: ${winner}`);
		if (winner == 'X')
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
	score.textContent = player_score + " : " + enemy_score;
}

function reset_game()
{
	let i = 0;
	while (i < 9)
		gridItems[i++].textContent = '';
}

gridItems.forEach((item, index) =>
{
	item.addEventListener('click', function()
	{
		if (item.textContent.trim() === '')
		{

			item.textContent = "X";
			let random = Math.floor(Math.random() * 9);
			if (freeSpace() == 1)
			{
				while (gridItems[random].textContent.trim() == 'X' || gridItems[random].textContent.trim() == 'O')
					random = Math.floor(Math.random() * 9);
				gridItems[random].textContent = "O";
			}
			winner = checkWinCondition();
			if (winner)
			{
				console.log(`We have a winner: ${winner}`);
				if (winner == 'X')
					player_score++;
				else
					enemy_score++;
				setTimeout(reset_game, 1000);
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
					setTimeout(reset_game, 1000);
				count = 0;
			}
			score.textContent = player_score + " : " + enemy_score;
		}
	});
});