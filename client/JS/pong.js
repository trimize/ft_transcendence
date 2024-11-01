import { fetchUserData, getUser, updateGame, createGame, fetchMatch, fetchUserById} from './fetchFunctions.js';
import { getWebSocket, sendMessage } from './singletonSocket.js';
import { getCurrentTime } from './utils.js';

let invited = false;
let score_player = 0;
let score_enemy = 0;
let single = false;
let multi = false;
let multi_online = false;
let matchId;
let finish = false;
//const usernameInput = document.getElementById('usernameInput');
const player = document.getElementById("player");
const enemy = document.getElementById("enemy");
//const customization = document.getElementById("customizationModal");
//const start_button = document.getElementById("start-button");
//const enableBallAcceleration = document.getElementById('ballACC');
//const ballSpeed = document.getElementById('ballSpeed');
//const powersOption = document.getElementById('powers');
const powerPlayerSpeed = document.getElementById('player_speed');
const powerPlayerBallSpeed = document.getElementById('ball_speed');
const powerEnemySpeed = document.getElementById('enemy_speed');
const powerEnemyBallSpeed = document.getElementById('enemy_ball_speed');
const movingSquare = document.getElementById("moving-square");
const defaultBallLeft = parseInt(window.getComputedStyle(movingSquare).left, 10);
const defaultBallTop = parseInt(window.getComputedStyle(movingSquare).top, 10);
//const retry_button = document.getElementById('retry-button');
//const end_modal = document.getElementById('victoryModal');
//const playerTitle = document.getElementById('waitingLabel');
//const inviteButton = document.getElementById('inviteOnline');
//const startOnlineButton = document.getElementById('startingGameOnline');
//const notConnectedModal = document.getElementById('notConnectedModal');
//const changeGMButoon = document.getElementById('changeGMbutton');
let enemyY = parseInt(window.getComputedStyle(enemy).top, 10);
let ai_ball_info;
let move_up = true;
let move_down = true;
let ball_acc = false;
let ball_step = 20;
let defaultBallSpeed;
let maxBallSpeed = 0;
let player1_max_consec_touch = 0;
let player2_max_consec_touch = 0;
let power = false;
let player_touch = 0;
let enemy_touch = 0;
let player_consec_touch = 7;
let enemy_consec_touch = 7;
let step = 20;
let enemy_step = 20;
let key_1_player_pressed = false;
let key_2_player_pressed = false;
let ball_powered = false;
let ball_power_player_touch = true;
let ball_power_enemy_touch = true;
let enemy_used_ball_power = false;
let player_used_ball_power = false;
let player1Id = 0;
let player2Id;
let player1Position;
let player2Position;
let reset = false;
let data;
let hasValue;
let offline;
let userInfo;



document.addEventListener("keydown", function(event)
{
    event.preventDefault();

    // Only listening when game has started

    if (!finish)
    {
        const currentTop = parseInt(window.getComputedStyle(player).top, 10);
        const current2pTop = parseInt(window.getComputedStyle(enemy).top, 10);
        const parentDiv = player.parentElement;
        const parentHeight = parentDiv.clientHeight;
        const rectangleHeight = player.clientHeight;
        const rectangle2pHeight = enemy.clientHeight;
        
        // Arrow up/down for player up/down
        if ((single || multi) && !finish)
        {
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
        }

        // In case of multiplayer chosen enemy up/down

        if (multi && !finish)
        {
            if (event.key === "w")
            {
                let newTop2 = current2pTop - step;
                if (newTop2 < 0)
                    newTop2 = 0;
                enemy.style.top = newTop2 + "px";
            }
            else if (event.key === "s")
            {
                let newTop2 = current2pTop + step;
                if (newTop2 > parentHeight - rectangle2pHeight)
                    newTop2 = parentHeight - rectangle2pHeight;
                enemy.style.top = newTop2 + "px";
            }
        }
    }
});


let previousBallInfo = null; // To store the last known position and speed

function predictBallPosition(ai_ball_info, framesAhead) {
    // Extract initial information from `ai_ball_info`
    let { ballX, ballY, deltaX, deltaY, gameHeight, gameWidth } = ai_ball_info;

    let futureY = ballY;
    let futureX = ballX;
    let futureDeltaY = deltaY;
    let futureDeltaX = deltaX;
    let speedMultiplier = 1.0;

    // Estimate the speed increment if `previousBallInfo` is available
    if (previousBallInfo) {
        // Calculate speed change based on previous interval
        speedMultiplier = Math.sqrt(
            (deltaX ** 2 + deltaY ** 2) /
            (previousBallInfo.deltaX ** 2 + previousBallInfo.deltaY ** 2)
        );
    }

    // Predict position over `framesAhead`, adjusting for speed
    for (let i = 0; i < framesAhead; i++) {
        futureY += futureDeltaY * speedMultiplier;
        futureX += futureDeltaX * speedMultiplier;
        // Handle vertical wall collisions
        if (futureY <= 0 || futureY >= gameHeight) {
            futureDeltaY = -futureDeltaY;
            futureY = futureY <= 0 ? -futureY : gameHeight - futureY;
        }

        // Optional: Handle horizontal wall collisions
        if (futureX <= 0 || futureX >= gameWidth) {
            futureDeltaX = -futureDeltaX;
            futureX = futureX <= 0 ? -futureX : gameWidth - futureX;
        }
    }

    // Update `previousBallInfo` for the next call
    previousBallInfo = { ballX, ballY, deltaX, deltaY };

    return { futureX, futureY };
}

function handleAIPowers(futureY)
{

	// If AI is too far from the future Y of the ball it uses the speed power to get to it faster

	if (power && enemy_consec_touch >= 5)
	{
		powerEnemySpeed.style.backgroundColor = "red";
		powerEnemySpeed.style.color = "white";
		if (futureY - enemyY >= 150)
		{
			step = 60;
			powerEnemySpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
			powerEnemySpeed.style.color = "rgba(255, 255, 255, 0.3)";
			enemy_consec_touch = enemy_consec_touch - 5;
			setTimeout(() =>
			{
				step = 20;
			}, 10000);
		}
	}

	// Using the ball speed power for the AI but only when touched by the AI

	if (power && enemy_consec_touch >= 7)
	{
		powerEnemyBallSpeed.style.backgroundColor = "red";
		powerEnemyBallSpeed.style.color = "white";
		setTimeout(() => {
			powerEnemyBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
			powerEnemyBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
			ball_powered = true;
			enemy_consec_touch = enemy_consec_touch - 7;
			enemy_used_ball_power = true;
		}, 2000);
	}

	// If the player has lost consecutive touch points at any point reverts the power's styles back

	if (power && enemy_consec_touch < 7)
	{
		powerEnemyBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerEnemyBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
	if (power && enemy_consec_touch < 5)
	{
		powerEnemySpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerEnemySpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
}

function handleEnemyPowers()
{

	// Using the speed player power for 10 seconds on key press

	if (power && enemy_consec_touch >= 5)
	{
		if (!key_1_player_pressed)
		{
			powerEnemySpeed.style.backgroundColor = "red";
			powerEnemySpeed.style.color = "white";
		}
		document.addEventListener("keydown", handleKeyDown);
		if (key_1_player_pressed)
		{
			enemy_consec_touch = enemy_consec_touch - 5;
			setTimeout(() =>
			{
				step = 20;
			}, 10000);
		}
		key_1_player_pressed = false
	}

	// Using the ball speed power on key press for the player but only when touched by the player

	if (power && enemy_consec_touch >= 7)
	{
		if (!key_2_player_pressed)
		{
			powerEnemyBallSpeed.style.backgroundColor = "red";
			powerEnemyBallSpeed.style.color = "white";
		}
		document.addEventListener("keydown", handleKeyDown);
		if (key_2_player_pressed)
		{
			enemy_consec_touch = enemy_consec_touch - 7;
			key_2_player_pressed = false;
			if (single || multi)
				enemy_used_ball_power = true;
		}
	}

	// If the player has lost consecutive touch points at any point reverts the power's styles back

	if (power && enemy_consec_touch < 7)
	{
		powerEnemyBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerEnemyBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
	if (power && enemy_consec_touch < 5)
	{
		powerEnemySpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerEnemySpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
}

function handlePlayerPowers()
{

	// Using the speed player power for 10 seconds on key press

	if (power && player_consec_touch >= 5)
	{
		if (!key_1_player_pressed)
		{
			powerPlayerSpeed.style.backgroundColor = "red";
			powerPlayerSpeed.style.color = "white";
		}
		document.addEventListener("keydown", handleKeyDown);
		if (key_1_player_pressed)
		{
			player_consec_touch = player_consec_touch - 5;
			setTimeout(() =>
			{
				step = 20;
			}, 10000);
		}
		key_1_player_pressed = false
	}

	// Using the ball speed power on key press for the player but only when touched by the player

	if (power && player_consec_touch >= 7)
	{
		if (!key_2_player_pressed)
		{
			powerPlayerBallSpeed.style.backgroundColor = "red";
			powerPlayerBallSpeed.style.color = "white";
		}
		document.addEventListener("keydown", handleKeyDown);
		if (key_2_player_pressed)
		{
			player_consec_touch = player_consec_touch - 7;
			key_2_player_pressed = false;
			if (single || multi)
				player_used_ball_power = true;
		}
	}

	// If the player has lost consecutive touch points at any point reverts the power's styles back

	if (power && player_consec_touch < 7)
	{
		powerPlayerBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerPlayerBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
	if (power && player_consec_touch < 5)
	{
		powerPlayerSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerPlayerSpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
}

// Handling key pressing for powers

function handleKeyDown(event)
{
	if (event.code === "Numpad1" && player_consec_touch >= 5)
	{
		if (single || multi)
			step = 60;
		key_1_player_pressed = true;
		if (player1Id == userInfo.id)
		{
			powerPlayerSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
			powerPlayerSpeed.style.color = "rgba(255, 255, 255, 0.3)";
		}
		else
		{
			powerEnemySpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
			powerEnemySpeed.style.color = "rgba(255, 255, 255, 0.3)";
		}
	}
	if (event.code === "Numpad2" && player_consec_touch >= 7)
	{
		key_2_player_pressed = true;
		if (player1Id == userInfo.id)
		{
			powerPlayerBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
			powerPlayerBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
		}
		else
		{
			powerEnemyBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
			powerEnemyBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
		}
		ball_powered = true;
		if (multi_online)
		{
			if (player1Id == userInfo.id)
			{

				const matchData =
				{
					type: "match_update",
					matchId: matchId,
					hostId: player1Id,
					inviteeId: player2Id,
					ball_powered: true,
					player_used_ball_power: true,
				};
				sendMessage(matchData)
			}
			else
			{
				const matchData =
				{
					type: "match_update",
					matchId: matchId,
					hostId: player1Id,
					inviteeId: player2Id,
					ball_powered: true,
					enemy_used_ball_power: true,
				};
				sendMessage(matchData)
			}
		}
	}
}

function startMovingSquare()
{
	//console.log(ball_step);
	const contentArea = player.parentElement;
	enemy.style.left = contentArea.getBoundingClientRect().right - 97 + "px";

	let bounce_bool = true;
	document.getElementById("score").textContent = score_player + " : " + score_enemy;
	const contentWidth = contentArea.clientWidth;
	const contentHeight = contentArea.clientHeight;
	const centerX = contentWidth / 2;
	const centerY = contentHeight / 2;


	movingSquare.style.left = `${centerX}px`;
	movingSquare.style.top = `${centerY}px`;
	movingSquare.style.display = 'block';
	const angle = Math.PI;
	let deltaX = Math.cos(angle) * ball_step; // Horizontal movement
	let deltaY = Math.cos(angle) * ball_step; // Vertical movement
	let bounce_X = 1;
	let bounce_Y = 1;

	// Since AI makes its own calculation of the trajectory of the ball we need to update it every 50ms
	const ballSPeed = setInterval(() =>
	{
		if (!finish)
		{
			deltaX = Math.cos(angle) * ball_step * bounce_X;
			deltaY = Math.cos(angle) * ball_step * bounce_Y;
		}
		else
			clearInterval(ballSPeed);
	}, 50);

	// This is making sure the AI has info of the trajectory of the ball only every second

	const moveInterval = setInterval(() =>
	{
		const playerRect = player.getBoundingClientRect();
		const enemyRect = enemy.getBoundingClientRect();
		const squareRect = movingSquare.getBoundingClientRect();
		const ParentRect = contentArea.getBoundingClientRect();
		const leftPosition = parseInt(movingSquare.style.left, 10) || 0;
		const topPosition = parseInt(movingSquare.style.top, 10) || 0;
		
		// Calculating the ball's position every 50ms
        
		const newLeftPosition = leftPosition + deltaX;
		const newTopPosition = topPosition + deltaY;
        if (single)
        {
            const ai_info = setInterval(() => {
                if (!finish) {
                    // Capture the relevant information for the AI
                    ai_ball_info = {
                        ballX: newLeftPosition,
                        ballY: newTopPosition,
                        deltaX: deltaX,
                        deltaY: deltaY,
                        gameHeight: movingSquare.parentElement.clientHeight,
                        gameWidth: movingSquare.parentElement.clientWidth
                    };
                } else {
                    clearInterval(ai_info);
                }
            }, 1000);
        }

		// Ball bounces if touching the top and bottom edges of the game's window
		if (ball_step > maxBallSpeed)
			maxBallSpeed = ball_step;
		if (player_consec_touch > player1_max_consec_touch)
			player1_max_consec_touch = player_consec_touch;
		if (enemy_consec_touch >  player2_max_consec_touch)
			player2_max_consec_touch = enemy_consec_touch;
		if (newTopPosition <= 0 || newTopPosition >= (player.parentElement.clientHeight - squareRect.height))
		{
			deltaY *= -1;
			bounce_Y *= -1;
		}

		// Ball bounces if near enough to the player
		// Uses the power of the player if used to make the ball faster

		if (squareRect.bottom <= playerRect.bottom + 20 && squareRect.top >= playerRect.top - 15 && squareRect.left <= playerRect.right + 20 && bounce_bool && squareRect.left >= playerRect.right - 20)
		{
			if (ball_acc)
				ball_step += 1;
			deltaX *= -1;
			player_touch++;
			player_consec_touch++;
			bounce_bool = false;
			bounce_X *= -1;
			if (ball_powered && ball_power_player_touch && ball_power_enemy_touch && !enemy_used_ball_power)
			{
				ball_step = ball_step + 7;
				ball_power_player_touch = false;
			}
			if (ball_powered && !ball_power_enemy_touch && enemy_used_ball_power)
			{
				ball_step = ball_step - 7;
				ball_power_enemy_touch = true;
				ball_powered = false;
				enemy_used_ball_power = false;
			}
		}

		// Ball bounces if near enough to the enemy
		// Makes the ball slower again if the player used his power and touched the ball
		if (squareRect.bottom <= enemyRect.bottom + 20 && squareRect.top >= enemyRect.top - 25 && squareRect.right >= enemyRect.left - 20 && bounce_bool && squareRect.right <= enemyRect.left + 20)
		{
			deltaX *= -1;
			if (ball_acc && bounce_bool)
				ball_step += 1;
			enemy_touch++;
			enemy_consec_touch++;
			bounce_bool = false;
			bounce_X *= -1;
			if (ball_powered && !ball_power_player_touch && player_used_ball_power)
			{
				ball_step = ball_step - 7;
				ball_power_player_touch = true;
				ball_powered = false;
				player_used_ball_power = false;
			}
			if (ball_powered && ball_power_enemy_touch && ball_power_player_touch && !player_used_ball_power)
			{
				ball_step = ball_step + 7;
				ball_power_enemy_touch = false;
			}
		}

		// Wait for the ball to bounce and move before making it able to bounce again near player/enemy
		// Fixing the problem of the ball bouncing forever if close enough of player/enemy

		if (squareRect.left > playerRect.right + 20 && squareRect.right < enemyRect.left - 20)
			bounce_bool = true;


		// Singleplayer's AI

		if (newLeftPosition >= centerX && single && bounce_X == -1 && single)
		{

			// The AI has 5 frames in advance to try and predict the ball direction

			let frames_ahead = 15;
			const predictedPosition = predictBallPosition(ai_ball_info, frames_ahead);
            const enemyMidPoint = enemyRect.top + enemyRect.height / 2;
			// Self-explanatory, handles the ai's powers
			
			handleAIPowers(predictBallPosition.futureY);

			// AI moves down here, also move_up is a boolean that makes sure the AI doesn't go up
			// and down frenetically
            //console.log(predictedPosition.futureY);
            //console.log(newTopPosition);
			if (predictedPosition.futureY > enemyMidPoint && move_down)
			{
				enemyY += enemy_step;
				if (enemyY > enemy.parentElement.clientHeight - enemy.clientHeight)
					enemyY = enemy.parentElement.clientHeight - enemy.clientHeight;
				move_up = false;
				setTimeout(() => 
				{
					move_up = true;
				}, 200);
			}

			// AI moves down here, also move_down is a boolean that makes sure the AI doesn't go up
			// and down frenetically

			else if (predictedPosition.futureY < enemyMidPoint && move_up)
			{
				enemyY -= enemy_step;
				if (enemyY <= 0) 
					enemyY = 0;
				move_down = false
				setTimeout(() => 
				{
					move_down = true;
				}, 200);
			}
			enemy.style.top = `${enemyY}px`;

		}


		handlePlayerPowers();
		if (multi_online || multi)
			handleEnemyPowers();
		// Checking if the ball is lost for player or enemy
		// Resets everything needed for another round

		if (newLeftPosition > 0 && newLeftPosition < ParentRect.right - 50)
		{
			movingSquare.style.left = `${newLeftPosition}px`;
			movingSquare.style.top = `${newTopPosition}px`;
		}
		else
		{
			console.log('yes');
			if (newLeftPosition >= ParentRect.right - 50)
			{
				score_player++;
				enemy_consec_touch = 0;
			}
			else
			{
				player_consec_touch = 0;
				score_enemy++;
			}
			if (score_player >= 3 || score_enemy >= 3)
			{
				document.getElementById("score").textContent = score_player + " : " + score_enemy;
				if (!offline)
				{
					const currentTime = getCurrentTime();
					const matchData =
					{
						id: matchId,
						player1_score: score_player,
						player2_score: score_enemy,
						player1_ball_touch: player_touch,
						player2_ball_touch: enemy_touch,
						player1_consec_touch: player1_max_consec_touch,
						player2_consec_touch: player2_max_consec_touch,
						fastest_ball_speed: maxBallSpeed,
						end_time: currentTime,
					};
					updateGame(matchData);
				}
				finish = true;
				if (score_enemy == 3)
				{
					//document.getElementById('victorytitle').textContent = "You lose";
					//document.getElementById('endScore').textContent = score_player + " : " + score_enemy;
				}
				else if (score_player == 3)
				{
					//document.getElementById('victorytitle').textContent = "Victory!";
					//document.getElementById('endScore').textContent = score_player + " : " + score_enemy;
				}
				clearInterval(moveInterval);
				//const retryButton = document.getElementById('retry-button');
				//retryButton.addEventListener('click', function()
				//{
				//	clearInterval(retryButton);
				//	retry();
				//	//reset = true;
				//});
				return ;
			}
			if (!offline)
			{
				const matchData =
				{
					id: matchId,
					player1_score: score_player,
					player2_score: score_enemy,
					player1_ball_touch: player_touch,
					player2_ball_touch: enemy_touch,
					player1_consec_touch: player1_max_consec_touch,
					player2_consec_touch: player2_max_consec_touch,
					fastest_ball_speed: maxBallSpeed,
				};
				updateGame(matchData);
			}
			clearInterval(moveInterval);
			movingSquare.style.display = 'none';
			ball_power_player_touch = true;
			ball_powered = false;
			ball_step = defaultBallSpeed;
			setTimeout(startMovingSquare, 1000);
		}
	}, 50);
}

let checkValue = setInterval(function()
{
    setTimeout(startMovingSquare, 1000);
    clearInterval(checkValue);
}, 100);

function pongHTML()
{
	return `<div class="content-area p-4" id="contentArea">
				<div class="rectangle" id="player"></div>
				<div id="score">0 : 0</div>
				<div class="moving-square" id="moving-square"></div>
				<div class="rectangle" id="enemy"></div>
				
				<div class="bottom-left-container">
					<div class="bottom-left" id="player_speed">Player Speed</div>
					<div class="bottom-left" id="ball_speed">Ball Speed</div>
				</div>
					
				<div class="bottom-right-container">
					<div class="bottom-right" id="enemy_speed">Player Speed</div>
					<div class="bottom-right" id="enemy_ball_speed">Ball Speed</div>
				</div>
			</div>`
}

export const renderPong = async () =>
{
	const urlParams = new URLSearchParams(window.location.search);
	offline = urlParams.get('offline');
	ball_step = urlParams.get('ballSpeed');
	power = urlParams.get('powers');
	ball_acc = urlParams.get('ballAcc');
	defaultBallSpeed = urlParams.get('ballSpeed');
	if (urlParams.get('type') == 'multi')
		multi = true;
	else if (urlParams.get('type') == 'single')
		single = true;
	else
		multi_online = true;

	if (!offline)
	{
		matchId = urlParams.get('matchId');
		userInfo = await fetchUserData();
	}
	if (!offline && multi_online)
	{
		player1Id = urlParams.get('host');
		player2Id = urlParams.get('invitee');
		handlingSocketEvents();
	}

	document.addEventListener("keydown", function(event)
	{
		event.preventDefault();

		// Only listening when game has started

		if (!finish)
		{
			const currentTop = parseInt(window.getComputedStyle(player).top, 10);
			const current2pTop = parseInt(window.getComputedStyle(enemy).top, 10);
			const parentDiv = player.parentElement;
			const parentHeight = parentDiv.clientHeight;
			const rectangleHeight = player.clientHeight;
			const rectangle2pHeight = enemy.clientHeight;
			
			// Arrow up/down for player up/down
			if ((single || multi))
			{
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
			}

			// In case of multiplayer chosen enemy up/down

			if (multi)
			{
				if (event.key === "w")
				{
					let newTop2 = current2pTop - step;
					if (newTop2 < 0)
						newTop2 = 0;
					enemy.style.top = newTop2 + "px";
				}
				else if (event.key === "s")
				{
					let newTop2 = current2pTop + step;
					if (newTop2 > parentHeight - rectangle2pHeight)
						newTop2 = parentHeight - rectangle2pHeight;
					enemy.style.top = newTop2 + "px";
				}
			}
			else if (multi_online)
			{
				let newTop;
				if (event.key === "ArrowUp")
				{
					newTop = currentTop - step;
					if (newTop < 0)
						newTop = 0;
				}
				else if (event.key === "ArrowDown")
				{
					newTop = currentTop + step;
					if (newTop > parentHeight - rectangleHeight)
						newTop = parentHeight - rectangleHeight;
				}
				const matchData =
				{
					type: "match_update",
					matchId: matchId,
					hostId: player1Id,
					inviteeId: player2Id,
					player1Position: newTop
				};
				sendMessage(matchData)
			}
		}
	});
	let checkValue = setInterval(function()
	{
		setTimeout(startMovingSquare, 1000);
		clearInterval(checkValue);
	}, 100);
	document.getElementById('content').innerHTML = pongHTML();
}

function handlingSocketEvents()
{
	socket = getWebSocket();
	socket.addEventListener('message', async function(event)
	{
		const message = JSON.parse(event.data);
		if (message.type = "match_update")
		{
			if (message.player1Position !== undefined)
				player.style.top = message.player1Position + "px";
			if (message.player2Position !== undefined)
				enemy.style.top = message.player2Position + "px";
			if (message.ball_powered !== undefined)
			{
				if (message.player_used_ball_power !== undefined)
					player_used_ball_power = true;
				else
					enemy_used_ball_power = true;
			}
		}	
	});
}