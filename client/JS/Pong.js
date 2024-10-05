let start = false;
let score_player = 0;
let score_enemy = 0;
let single = false;
let multi = false;
const player = document.getElementById("player");
const enemy = document.getElementById("enemy");

window.addEventListener('resize', function()
{
	const contentArea = document.getElementById('contentArea');
	const enemy = document.getElementById('enemy');
	
	enemy.style.left = (contentArea.getBoundingClientRect().right - 97) + "px";
});

function sleep(ms)
{
	return new Promise(resolve => setTimeout(resolve, ms));
}

function startMovingSquare()
{
	const contentArea = player.parentElement;
	enemy.style.left = contentArea.getBoundingClientRect().right - 97 + "px";
	const movingSquare = document.getElementById("moving-square");
	const step = 20;
	const ball_step = 10;
	const angle = Math.PI;
	let deltaX = Math.cos(angle) * ball_step; // Horizontal movement
	let deltaY = Math.cos(angle) * ball_step; // Vertical movement

	let bounce_bool = true;
	let enemy_touch = true;
	document.getElementById("score").textContent = score_player + " : " + score_enemy;
	const contentWidth = contentArea.clientWidth;
	const contentHeight = contentArea.clientHeight;
	const centerX = contentWidth / 2;
	const centerY = contentHeight / 2;


	movingSquare.style.left = `${centerX}px`;
	movingSquare.style.top = `${centerY}px`;
	movingSquare.style.display = 'block';

	const moveInterval = setInterval(() =>
	{
		const playerRect = player.getBoundingClientRect();
		const enemyRect = enemy.getBoundingClientRect();
			const squareRect = movingSquare.getBoundingClientRect();
		const ParentRect = contentArea.getBoundingClientRect();
		const leftPosition = parseInt(movingSquare.style.left, 10) || 0;
		const topPosition = parseInt(movingSquare.style.top, 10) || 0;
		let enemyY = parseInt(window.getComputedStyle(enemy).top, 10);
		
		const newLeftPosition = leftPosition + deltaX;
		const newTopPosition = topPosition + deltaY;
		
		if (newTopPosition <= 0 || newTopPosition >= (player.parentElement.clientHeight - squareRect.height))
			deltaY *= -1;
		if (squareRect.bottom <= playerRect.bottom + 5 && squareRect.top >= playerRect.top + 5 && squareRect.left <= playerRect.right + 5 && bounce_bool && squareRect.left >= playerRect.right - 5)
		{
			deltaX *= -1;
			bounce_bool = false;
		}
		if (squareRect.bottom <= enemyRect.bottom && squareRect.top >= enemyRect.top && squareRect.right >= enemyRect.left - 5 && bounce_bool && squareRect.right <= enemyRect.left + 5)
		{
			deltaX *= -1;
			bounce_bool = false;
			enemy_touch = false;
		}
		if (squareRect.left > playerRect.right + 5 && squareRect.right < enemyRect.left - 5)
			bounce_bool = true;
		if (newLeftPosition >= centerX && single)
		{
			if (enemyRect.top > squareRect.top - 40 && enemy_touch)
			{
				enemyY -= step;
				if (enemyY <= 0)
					enemyY = 0;
			}
			else if (enemyRect.top < squareRect.top - 80 && enemy_touch)
			{	
				enemyY += step;
				if (enemyY > enemy.parentElement.clientHeight - enemy.height)
					enemyY = enemy.parentElement.clientHeight - enemy.clientHeight;
			}
			else
			{
				enemyY = enemyY;
				console.log("yikers");
			}
			enemy.style.top = `${enemyY}px`;
		}
		if (newLeftPosition < centerX && single)
			enemy_touch = true;
		if (newLeftPosition > 0 && newLeftPosition < ParentRect.right - 50)
		{
			movingSquare.style.left = `${newLeftPosition}px`;
			movingSquare.style.top = `${newTopPosition}px`;
		}
		else
		{
			if (newLeftPosition >= ParentRect.right - 50)
				score_player++;
			else
				score_enemy++;
			clearInterval(moveInterval);
			movingSquare.style.display = 'none';
			setTimeout(startMovingSquare, 1000);
		}
	}, 50);
}

function hideModal()
{
	gameModeModal.classList.remove('show');
	gameModeModal.style.display = 'none';
	page.classList.remove('blur');
	start = true;
}

document.addEventListener("DOMContentLoaded", function()
{
	var gameModeModal = document.getElementById('gameModeModal');
        var page = document.getElementById('page');
        
	gameModeModal.classList.add('show');
        gameModeModal.style.display = 'block';
        gameModeModal.setAttribute('aria-modal', 'true');
        gameModeModal.setAttribute('role', 'dialog');
        page.classList.add('blur'); // Add blur effect to the background

        var singleplayerBtn = document.getElementById('singleplayer-btn');
        var multiplayerBtn = document.getElementById('multiplayer-btn');

	singleplayerBtn.addEventListener('click', function ()
	{
		single = true;
		hideModal();
	});
	multiplayerBtn.addEventListener('click', function()
	{
		multi = true;
		hideModal();
	});
});

document.addEventListener("keydown", function(event)
{
	event.preventDefault();
	if (start)
	{
		const currentTop = parseInt(window.getComputedStyle(player).top, 10);
		const current2pTop = parseInt(window.getComputedStyle(enemy).top, 10);
		const parentDiv = player.parentElement;
		const parentHeight = parentDiv.clientHeight;
		const rectangleHeight = player.clientHeight;
		const rectangle2pHeight = enemy.clientHeight;
		const step = 20;
		
		if (event.key === "ArrowUp")
		{
			let newTop = currentTop - step;
			if (newTop < 0)
				newTop = 0;
			player.style.top = newTop + "px";
		}
		else if (event.key === "ArrowDown")
		{
			let newTop = currentTop + step;
			if (newTop > parentHeight - rectangleHeight)
				newTop = parentHeight - rectangleHeight;
			player.style.top = newTop + "px";
		}
		if (multi)
		{
			if (event.key === "w")
			{
				let newTop = current2pTop - step;
				if (newTop < 0)
					newTop = 0;
				enemy.style.top = newTop + "px";
			}
			else if (event.key === "s")
			{
				let newTop = current2pTop + step;
				if (newTop > parentHeight - rectangle2pHeight)
					newTop = parentHeight - rectangle2pHeight;
				enemy.style.top = newTop + "px";
			}
		}
	}
});

let checkValue = setInterval(function()
{
	console.log("yes");
	if (start === true)
	{
		setTimeout(startMovingSquare, 1000);
		clearInterval(checkValue); // Stop checking after it becomes true
	}
}, 100);
