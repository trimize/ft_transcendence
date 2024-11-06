import { fetchUserData, getUser, updateGame, createGame, fetchMatch, fetchUserById} from './fetchFunctions.js';
import { getWebSocket, sendMessage } from './singletonSocket.js';
import { getCurrentTime } from './utils.js';

let score_player = 0;
let score_enemy = 0;
let single = false;
let multi = false;
let multi_online = false;
let matchId;
let matchData;
let finish = false;
let socket;
//const usernameInput = document.getElementById('usernameInput');

let ai_ball_info;
let move_up = true;
let move_down = true;
let ball_acc = false;
let ball_step = 5;
let defaultBallSpeed;
let maxBallSpeed = 0;
let player1_max_consec_touch = 0;
let player2_max_consec_touch = 0;
let power = false;
let player_touch = 0;
let enemy_touch = 0;
let player_consec_touch = 4;
let enemy_consec_touch = 4;
let step = 20;
let enemy_step = 20;
let key_1_player_pressed = false;
let key_2_player_pressed = false;
let key_1_enemy_pressed = false;
let key_2_enemy_pressed = false;
let ball_powered = false;
let ball_power_player_touch = false;
let ball_power_enemy_touch = false;
let enemy_used_ball_power = false;
let player_used_ball_power = false;
let player1Id = 0;
let player2Id;
let margins;
let player1Position;
let player2Position;
let reset = false;
let data;
let hasValue;
let offline;
let userInfo;
let player1_info;
let player2_info;
let turn_ball = 1;


export const renderPong = async () =>
{
	document.getElementById('content').innerHTML = pongHTML();
	const urlParams = new URLSearchParams(window.location.search);
	if (!urlParams.has('matchId'))
	{
		offline = urlParams.get('offline') == 'true' ? true : false;
		ball_step = parseInt(urlParams.get('ballSpeed'), 10);
		power = urlParams.get('powers') == 'true' ? true : false;
		ball_acc = urlParams.get('ballAcc') == 'true' ? true : false;
		defaultBallSpeed = parseInt(urlParams.get('ballSpeed'), 10);
		multi = urlParams.get('type') == 'local_multiplayer' ? true : false;
		single = urlParams.get('type') == 'singleplayer' ? true : false;
	}
	else
	{
		matchId = urlParams.get('matchId');
		userInfo = await fetchUserData();
		matchData = await fetchMatch(matchId);
		if (matchData.end_time != null)
		{
			const errorParam = new URLSearchParams();
			errorParam.append('alert', 'match_finished');
			window.location = `/?${lobbyParams.toString()}`;
		}
		socket = await getWebSocket();
		if (matchData.match_type == "singleplayer")
			single = true;
		else if (matchData.match_type == "local_multiplayer")
			multi = true;
		else if (matchData.match_type == "online_multiplayer")
			multi_online = true;
	}
	if (!offline && multi_online)
	{
		player1Id = matchData.player1;
		player2Id = matchData.player2;
		player1_info = await fetchUserById(player1Id);
		player2_info = await fetchUserById(player2Id);
		ball_step = parseInt(matchData.ball_speed, 10);
		defaultBallSpeed = ball_step;
		ball_acc = matchData.ball_acc;
		power = matchData.powers;
	}

	const contentArea = document.getElementById('contentArea');
	const computedStyle = getComputedStyle(contentArea);
	const leftValue = computedStyle.left;
	margins = parseInt(leftValue, 10);

	document.addEventListener("keydown", function(event)
	{
		event.preventDefault();
		if (!finish)
		{
			const player = document.getElementById("player");
			const enemy = document.getElementById("enemy");
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
					let newTop2 = current2pTop - enemy_step;
					if (newTop2 < 0)
						newTop2 = 0;
					enemy.style.top = newTop2 + "px";
				}
				else if (event.key === "s")
				{
					let newTop2 = current2pTop + enemy_step;
					if (newTop2 > parentHeight - rectangle2pHeight)
						newTop2 = parentHeight - rectangle2pHeight;
					enemy.style.top = newTop2 + "px";
				}
			}
			else if (multi_online && (event.key === "ArrowUp" || event.key === "ArrowDown"))
			{
				if (userInfo.id == player1Id)
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
				else if (userInfo.id == player2Id)
				{
					let newTop;
					if (event.key === "ArrowUp")
					{
						newTop = current2pTop - step;
						if (newTop < 0)
							newTop = 0;
					}
					else if (event.key === "ArrowDown")
					{
						newTop = current2pTop + step;
						if (newTop > parentHeight - rectangle2pHeight)
							newTop = parentHeight - rectangle2pHeight;
					}
					console.log("I am trying to update my position");
					const matchData =
					{
						type: "match_update",
						matchId: matchId,
						hostId: player1Id,
						inviteeId: player2Id,
						player2Position: newTop
					};
					sendMessage(matchData)
				}
			}
		}
	});

	if (single || multi)
	{
		let checkValue = setInterval(function()
		{
			setTimeout(startMovingSquare, 1000);
			clearInterval(checkValue);
		}, 100);
	}

	if (!offline)
	{
		if (userInfo.pong_ball != 0)
		{
			const movingSquare = document.getElementById("moving-square");
			movingSquare.style.backgroundColor = "transparent";
			movingSquare.style.backgroundImage = `url(../Assets/ball${userInfo.pong_ball}.svg)`
			movingSquare.style.backgroundSize = "cover";
		}
		if (userInfo.pong_slider != 0 && userInfo.id == player1Id)
		{
			let expansion = "jpg";
			if (userInfo.pong_slider == 8)
				expansion = "gif";
			else if (userInfo.pong_slider == 9)
				expansion = "webp";
			const player = document.getElementById("player");
			player.style.backgroundColor = "transparent";
			player.style.backgroundImage = `url(../Assets/slider${userInfo.pong_slider}.${expansion})`
			player.style.backgroundSize = "cover";
		}
		else if (userInfo.pong_slider != 0 && multi_online && userInfo.id == player2Id)
		{
			let expansion = "jpg";
			if (userInfo.pong_slider == 8)
				expansion = "gif";
			else if (userInfo.pong_slider == 9)
				expansion = "webp";
			const enemy = document.getElementById("enemy");
			enemy.style.backgroundColor = "transparent";
			enemy.style.backgroundImage = `url(../Assets/slider${userInfo.pong_slider}.${expansion})`
			enemy.style.backgroundSize = "cover";
		}
	}

	if(!offline && multi_online)
	{
		if (userInfo.id == player2Id)
		{
			if (player1_info.pong_slider != 0)
			{
				let expansion = "jpg";
				if (player1_info.pong_slider == 8)
					expansion = "gif";
				else if (player1_info.pong_slider == 9)
					expansion = "webp";
				const player = document.getElementById("player");
				player.style.backgroundColor = "transparent";
				player.style.backgroundImage = `url(../Assets/slider${player1_info.pong_slider}.${expansion})`
				player.style.backgroundSize = "cover";
			}	
		}
		else if (userInfo.id == player1Id)
		{
			if (player2_info.pong_slider != 0)
			{
				let expansion = "jpg";
				if (player2_info.pong_slider == 8)
					expansion = "gif";
				else if (player2_info.pong_slider == 9)
					expansion = "webp";
				const enemy = document.getElementById("enemy");
				enemy.style.backgroundColor = "transparent";
				enemy.style.backgroundImage = `url(../Assets/slider${player2_info.pong_slider}.${expansion})`
				enemy.style.backgroundSize = "cover";
			}	
			let checkValue = setInterval(function()
			{
				setTimeout(startMovingSquare, 1000);
				clearInterval(checkValue);
			}, 100);
		}
	}

	if (!offline && !multi_online)
		document.getElementById('pongPlayer1').textContent = userInfo.username;

	if (!power)
	{
		document.getElementById('player_speed').style.display = 'none';
		document.getElementById('ball_speed').style.display = 'none';
		document.getElementById('enemy_speed').style.display = 'none';
		document.getElementById('enemy_ball_speed').style.display = 'none';
	}
	
	if(!offline && multi_online)
	{
		document.getElementById('pongPlayer1').textContent = player1_info.username;
		document.getElementById('pongPlayer2').textContent = player2_info.username;
		handlingSocketEvents();
		if (userInfo.id == player2Id)
			document.addEventListener("keydown", handleKeyDown);
	}
}

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
	const enemy = document.getElementById("enemy");
	let enemyY = parseInt(window.getComputedStyle(enemy).top, 10);
	const powerEnemySpeed = document.getElementById('enemy_speed');
	const powerEnemyBallSpeed = document.getElementById('enemy_ball_speed');

	// If AI is too far from the future Y of the ball it uses the speed power to get to it faster

	if (power && enemy_consec_touch >= 2)
	{
		powerEnemySpeed.style.backgroundColor = "red";
		powerEnemySpeed.style.color = "white";
		if (futureY - enemyY >= 150)
		{
			step = 60;
			powerEnemySpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
			powerEnemySpeed.style.color = "rgba(255, 255, 255, 0.3)";
			enemy_consec_touch = enemy_consec_touch - 2;
			setTimeout(() =>
			{
				step = 20;
			}, 10000);
		}
	}

	// Using the ball speed power for the AI but only when touched by the AI

	if (power && enemy_consec_touch >= 4)
	{
		powerEnemyBallSpeed.style.backgroundColor = "red";
		powerEnemyBallSpeed.style.color = "white";
		setTimeout(() => {
			powerEnemyBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
			powerEnemyBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
			ball_powered = true;
			enemy_consec_touch = enemy_consec_touch - 4;
			enemy_used_ball_power = true;
		}, 2000);
	}

	// If the player has lost consecutive touch points at any point reverts the power's styles back

	if (power && enemy_consec_touch < 4)
	{
		powerEnemyBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerEnemyBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
	if (power && enemy_consec_touch < 2)
	{
		powerEnemySpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerEnemySpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
}


function handlePlayer2Powers()
{
	const powerEnemySpeed = document.getElementById('enemy_speed');
	const powerEnemyBallSpeed = document.getElementById('enemy_ball_speed');

	// Using the speed player power for 10 seconds on key press

	if (enemy_consec_touch >= 2)
	{
		if (!key_1_enemy_pressed)
		{
			powerEnemySpeed.style.backgroundColor = "red";
			powerEnemySpeed.style.color = "white";
		}
		document.addEventListener("keydown", handleKeyDown);
		if (key_1_enemy_pressed)
		{
			enemy_consec_touch = enemy_consec_touch - 2;
			setTimeout(() =>
			{
				enemy_step = 20;
			}, 10000);
		}
		key_1_enemy_pressed = false
	}

	// Using the ball speed power on key press for the player but only when touched by the player

	if (enemy_consec_touch >= 4)
	{
		if (!key_2_enemy_pressed)
		{
			powerEnemyBallSpeed.style.backgroundColor = "red";
			powerEnemyBallSpeed.style.color = "white";
		}
		document.addEventListener("keydown", handleKeyDown);
		if (key_2_enemy_pressed)
		{
			enemy_consec_touch = enemy_consec_touch - 4;
			key_2_enemy_pressed = false;
		}
	}

	// If the player has lost consecutive touch points at any point reverts the power's styles back

	if (power && enemy_consec_touch < 4)
	{
		powerEnemyBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerEnemyBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
	if (power && enemy_consec_touch < 2)
	{
		powerEnemySpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerEnemySpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
}

function handlePlayerPowers()
{
	const powerPlayerSpeed = document.getElementById('player_speed');
	const powerPlayerBallSpeed = document.getElementById('ball_speed');

	// Using the speed player power for 10 seconds on key press

	if (player_consec_touch >= 2)
	{
		if (!key_1_player_pressed)
		{
			powerPlayerSpeed.style.backgroundColor = "red";
			powerPlayerSpeed.style.color = "white";
		}
		document.addEventListener("keydown", handleKeyDown);
		if (key_1_player_pressed)
		{
			player_consec_touch = player_consec_touch - 2;
			setTimeout(() =>
			{
				step = 20;
			}, 10000);
		}
		key_1_player_pressed = false
	}

	// Using the ball speed power on key press for the player but only when touched by the player

	if (player_consec_touch >= 4)
	{
		if (!key_2_player_pressed)
		{
			powerPlayerBallSpeed.style.backgroundColor = "red";
			powerPlayerBallSpeed.style.color = "white";
		}
		document.addEventListener("keydown", handleKeyDown);
		if (key_2_player_pressed)
		{
			player_consec_touch = player_consec_touch - 4;
			key_2_player_pressed = false;
		}
	}

	// If the player has lost consecutive touch points at any point reverts the power's styles back

	if (power && player_consec_touch < 4)
	{
		powerPlayerBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerPlayerBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
	if (power && player_consec_touch < 2)
	{
		powerPlayerSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerPlayerSpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
}

// Handling key pressing for powers

function handleKeyDown(event)
{
	const powerPlayerSpeed = document.getElementById('player_speed');
	const powerPlayerBallSpeed = document.getElementById('ball_speed');
	const powerEnemySpeed = document.getElementById('enemy_speed');
	const powerEnemyBallSpeed = document.getElementById('enemy_ball_speed');
	if (event.code === "Numpad1" && player_consec_touch >= 2)
	{
		key_1_player_pressed = true;
		if (single || multi)
		{
			step = 60;
			powerPlayerSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
			powerPlayerSpeed.style.color = "rgba(255, 255, 255, 0.3)";
		}
		else if (multi_online)
		{
			if (player1Id == userInfo.id)
			{
				step = 60;
				powerPlayerSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
				powerPlayerSpeed.style.color = "rgba(255, 255, 255, 0.3)";
				const matchData =
				{
					type: "match_update",
					matchId: matchId,
					hostId: player1Id,
					inviteeId: player2Id,
					player1UsedPower1: true
				};
				sendMessage(matchData)
			}
		}
	}
	if (event.code === "Numpad1" && enemy_consec_touch >= 2 && multi_online && userInfo.id == player2Id)
	{
		step = 60;

		setTimeout(() => {
			step = 20;
		}, "10000");

		powerEnemySpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerEnemySpeed.style.color = "rgba(255, 255, 255, 0.3)";
		const matchData =
		{
			type: "match_update",
			matchId: matchId,
			hostId: player1Id,
			inviteeId: player2Id,
			player2UsedPower1: true
		};
		sendMessage(matchData)
	}
	if (event.code === "Numpad2" && player_consec_touch >= 4)
	{
		player_used_ball_power = true;
		if (multi_online)
		{
			key_2_player_pressed = true;
			if (player1Id == userInfo.id)
			{
				player_used_ball_power = true;
				powerPlayerBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
				powerPlayerBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
				
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
		}
		else
		{
			ball_powered = true;
			key_2_player_pressed = true;
			powerPlayerBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
			powerPlayerBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
		}
	}
	if (event.code === "Numpad2" && enemy_consec_touch >= 4 && multi_online && userInfo.id == player2Id)
	{
		enemy_used_ball_power = true;
		powerEnemyBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerEnemyBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
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
	if (event.code === "Digit1" && enemy_consec_touch >= 2 && multi)
	{
		enemy_step = 60;
		key_1_enemy_pressed = true;
		powerEnemySpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerEnemySpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
	if (event.code === "Digit2" && enemy_consec_touch >= 4 && multi)
	{
		ball_powered = true;
		key_2_enemy_pressed = true;
		powerEnemyBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerEnemyBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
		enemy_used_ball_power = true;
	}
}

async function startMovingSquare()
{
	const player = document.getElementById("player");
	const enemy = document.getElementById("enemy");
	const movingSquare = document.getElementById("moving-square");
	let enemyY = parseInt(window.getComputedStyle(enemy).top, 10);
	//console.log(ball_step);
	const contentArea = player.parentElement;

	let bounce_bool = true;
	if (offline)
		document.getElementById("score").textContent = score_player + " : " + score_enemy;
	else
	{
		matchData = await fetchMatch(matchId);
		document.getElementById("score").textContent = matchData.player1_score + " : " + matchData.player2_score;
	}
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
	deltaX *= turn_ball;

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

		if (squareRect.bottom <= playerRect.bottom + 50 && squareRect.top + 50 >= playerRect.top && squareRect.left <= playerRect.right + 20 && bounce_bool && squareRect.left >= playerRect.right - 20)
		{
			if (ball_acc)
				ball_step += 1;
			deltaX *= -1;
			console.log(ball_step);
			player_touch++;
			player_consec_touch++;
			bounce_bool = false;
			bounce_X *= -1;
			if (ball_powered && !ball_power_player_touch && !enemy_used_ball_power && power && player_used_ball_power)
			{
				ball_step = ball_step + 4;
				ball_power_player_touch = true;
			}
			if (ball_powered && ball_power_enemy_touch && enemy_used_ball_power && power)
			{
				ball_step = ball_step - 4;
				ball_power_enemy_touch = false;
				ball_powered = false;
				enemy_used_ball_power = false;
			}
		}

		// Ball bounces if near enough to the enemy
		// Makes the ball slower again if the player used his power and touched the ball
		if (squareRect.bottom <= enemyRect.bottom + 50 && squareRect.top + 50 >= enemyRect.top && squareRect.right >= enemyRect.left - 20 && bounce_bool && squareRect.right <= enemyRect.left + 20)
		{
			deltaX *= -1;
			if (ball_acc && bounce_bool)
				ball_step += 1;
			enemy_touch++;
			enemy_consec_touch++;
			bounce_bool = false;
			bounce_X *= -1;
			if (ball_powered && ball_power_player_touch && player_used_ball_power && power)
			{
				ball_step = ball_step - 4;
				ball_power_player_touch = false;
				ball_powered = false;
				player_used_ball_power = false;
			}
			if (ball_powered && !ball_power_enemy_touch && power && enemy_used_ball_power)
			{
				console.log("player 2 used ball power");
				ball_step = ball_step + 4;
				ball_power_enemy_touch = true;
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
			if (power)
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

		if (power == true)
		{
			handlePlayerPowers();
			if (multi)
				handlePlayer2Powers();
			if (multi_online)
				enemyPowersRender();
		}
		// Checking if the ball is lost for player or enemy
		// Resets everything needed for another round
		//console.log(newLeftPosition);

		if (newLeftPosition + margins > (ParentRect.left - 10)  && newLeftPosition + margins < ParentRect.right - 50)
		{
			movingSquare.style.left = `${newLeftPosition}px`;
			movingSquare.style.top = `${newTopPosition}px`;
			if (multi_online)
			{
				const matchData =
				{
					type: "match_update",
					matchId: matchId,
					hostId: player1Id,
					inviteeId: player2Id,
					ball_left: parseInt(movingSquare.style.left, 10),
					ball_top: parseInt(movingSquare.style.top, 10),
					enemy_consec_touch: enemy_consec_touch,
					player_consec_touch: player_consec_touch
				};
				sendMessage(matchData)
			}
		}
		else
		{

			if (newLeftPosition + margins >= ParentRect.right - 50)
			{
				score_player++;
				console.log('Player 1 Scored !');
				enemy_consec_touch = 0;
				if (turn_ball == 1)
					turn_ball *= -1;
				if (multi_online)
				{
					const matchData =
					{
						type: "match_update",
						matchId: matchId,
						hostId: player1Id,
						inviteeId: player2Id,
						score_player1: score_player,
						enemy_consec_touch: enemy_consec_touch
					};
					sendMessage(matchData)
				}
			}
			else
			{
				player_consec_touch = 0;
				score_enemy++;
				if (turn_ball == -1)
					turn_ball *= -1;
				if (multi_online)
				{
					const matchData =
					{
						type: "match_update",
						matchId: matchId,
						hostId: player1Id,
						inviteeId: player2Id,
						score_player2: score_enemy,
						player_consec_touch: player_consec_touch
					};
					sendMessage(matchData)
				}
			}
			if (score_player >= 3 || score_enemy >= 3)
			{
				const endPongDiv = document.getElementById("endPongDiv");
				endPongDiv.style.display = 'block';
				let opacity = 0;
				let endDivAnim = setInterval(function()
				{
					endPongDiv.style.opacity = opacity;
					opacity += 0.008;
					if (opacity >= 1)
						clearInterval(endDivAnim);
				}, 5);
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
					if (multi_online)
					{
						const matchData =
						{
							type: "match_update",
							matchId: matchId,
							hostId: player1Id,
							inviteeId: player2Id,
							finish: "true"
						};
						sendMessage(matchData)
					}
				}
				finish = true;
				if (score_enemy == 3)
				{
					if (multi_online)
						document.getElementById('winnerPongPlayer').textContent = player2_info.username;
					else
						document.getElementById('winnerPongPlayer').textContent = "Player 2";
				}
				else if (score_player == 3)
				{
					if (multi_online)
						document.getElementById('winnerPongPlayer').textContent = player1_info.username;
					else if (!offline)
						document.getElementById('winnerPongPlayer').textContent = userInfo.username;
					else
						document.getElementById('winnerPongPlayer').textContent = "Player 1";
				}
				clearInterval(moveInterval);
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
			ball_power_player_touch = false;
			player_used_ball_power = false;
			enemy_used_ball_power = false;
			ball_power_enemy_touch = false;
			ball_power_player_touch = false;
			ball_powered = false;
			ball_step = defaultBallSpeed;
			setTimeout(startMovingSquare, 1000);
		}
	}, 10);
}

function pongHTML()
{
	return `
			<div id="pongPlayer1">Player 1</div>
			<div id="pongPlayer2">Player 2</div>
			<div id="contentArea">
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
			</div>
			<div id="endPongDiv">
				<div id="pongVictoryText">WINNER</div>
				<div id="winnerPongPlayer">Player</div>
				<a id="pongMainMenu" href="/">Go back home</a>
			</div>
			<div id="bg"></div>`
}

function enemyPowersRender()
{
	const powerEnemySpeed = document.getElementById('enemy_speed');
	const powerEnemyBallSpeed = document.getElementById('enemy_ball_speed');

	if (power && enemy_consec_touch >= 2)
	{
		powerEnemySpeed.style.backgroundColor = "red";
		powerEnemySpeed.style.color = "white";
	}
	if (power && enemy_consec_touch >= 4)
	{
		powerEnemyBallSpeed.style.backgroundColor = "red";
		powerEnemyBallSpeed.style.color = "white";
	}
	if (power && enemy_consec_touch < 4)
	{
		powerEnemyBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerEnemyBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
	if (power && enemy_consec_touch < 2)
	{
		powerEnemySpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerEnemySpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
}

async function handlingSocketEvents()
{
	const powerPlayerSpeed = document.getElementById('player_speed');
	const powerPlayerBallSpeed = document.getElementById('ball_speed');
	const powerEnemySpeed = document.getElementById('enemy_speed');
	const powerEnemyBallSpeed = document.getElementById('enemy_ball_speed');
	const player = document.getElementById("player");
	const enemy = document.getElementById("enemy");
	const movingSquare = document.getElementById("moving-square");
	if (userInfo.id  == player1Id)
	{
		powerEnemySpeed.style.backgroundColor = "red";
		powerEnemySpeed.style.color = "white";
		powerEnemyBallSpeed.style.backgroundColor = "red";
		powerEnemyBallSpeed.style.color = "white";
	}
	socket.addEventListener('message', async function(event)
	{
		const message = JSON.parse(event.data);
		if (message.type == "match_update")
		{
			if (message.player1Position !== undefined)
				player.style.top = message.player1Position + "px";
			if (message.player2Position !== undefined)
				enemy.style.top = message.player2Position + "px";
			if (userInfo.id == player2Id && message.ball_left !== undefined)
			{
				movingSquare.style.display = 'block';
				movingSquare.style.left = `${message.ball_left}px`;
				movingSquare.style.top = `${message.ball_top}px`;
				player_consec_touch = message.player_consec_touch;
				enemy_consec_touch = message.enemy_consec_touch;
				if (power && enemy_consec_touch >= 2)
				{
					powerEnemySpeed.style.backgroundColor = "red";
					powerEnemySpeed.style.color = "white";
				}
				if (power && enemy_consec_touch >= 4)
				{
					powerEnemyBallSpeed.style.backgroundColor = "red";
					powerEnemyBallSpeed.style.color = "white";
				}
				
				if (power && player_consec_touch >= 2)
				{
					powerPlayerSpeed.style.backgroundColor = "red";
					powerPlayerSpeed.style.color = "white";
				}
				if (power && player_consec_touch >= 4)
				{
					powerPlayerBallSpeed.style.backgroundColor = "red";
					powerPlayerBallSpeed.style.color = "white";
				}
				if (power && enemy_consec_touch < 4)
				{
					powerEnemyBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
					powerEnemyBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
				}
				if (power && enemy_consec_touch < 2)
				{
					powerEnemySpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
					powerEnemySpeed.style.color = "rgba(255, 255, 255, 0.3)";
				}
				if (power && player_consec_touch < 4)
				{
					powerPlayerBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
					powerPlayerBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
				}
				if (power && player_consec_touch < 2)
				{
					powerPlayerSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
					powerPlayerSpeed.style.color = "rgba(255, 255, 255, 0.3)";
				}
			}
			if (message.ball_powered !== undefined)
			{
				if (message.player_used_ball_power !== undefined)
				{
					player_used_ball_power = true;
					if (userInfo.id == player2Id)
					{
						powerPlayerBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
						powerPlayerBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
					}
				}
				else
				{
					enemy_used_ball_power = true;
					if (userInfo.id == player1Id)
					{
						powerEnemyBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
						powerEnemyBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
						enemy_consec_touch -= 4;
					}
				}
				ball_powered = true;
			}
			if (message.player2UsedPower1 !== undefined && userInfo.id == player1Id)
			{
				powerEnemySpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
				powerEnemySpeed.style.color = "rgba(255, 255, 255, 0.3)";
				enemy_consec_touch -= 2;
			}
			if (message.player1UsedPower1 !== undefined && userInfo.id == player2Id)
			{
				powerPlayerSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
				powerPlayerSpeed.style.color = "rgba(255, 255, 255, 0.3)";
			}
			if (message.score_player1 !== undefined && userInfo.id == player2Id)
			{
				score_player = message.score_player1;
				enemy_consec_touch = message.enemy_consec_touch;
				document.getElementById("score").textContent = score_player + " : " + score_enemy;
			}
			if (message.score_player2 !== undefined && userInfo.id == player2Id)
			{
				score_enemy = message.score_player2;
				player_consec_touch = message.player_consec_touch;
				document.getElementById("score").textContent = score_player + " : " + score_enemy;
			}
			if (message.finish !== undefined && userInfo.id == player2Id)
			{
				console.log('trying to finish game');
				matchData = await fetchMatch(matchId);
				document.getElementById('winnerPongPlayer').textContent = matchData.player1_score > matchData.player2_score ? player1_info.username : player2_info.username;
				finish = true;
				const endPongDiv = document.getElementById("endPongDiv");
				endPongDiv.style.display = 'block';
				let opacity = 0;
				let endDivAnim = setInterval(function()
				{
					endPongDiv.style.opacity = opacity;
					opacity += 0.008;
					if (opacity >= 1)
						clearInterval(endDivAnim);
				}, 5);
			}
		}
		else if (message.type == "friend_disconnected")
		{
			if (message.userId == player1Id || message.userId == player2Id)
			{
				const params = new URLSearchParams();
				params.append('matchId', matchId);
				params.append('host', player1Id);
				params.append('invitee', player2Id);
				params.append('game', 'pong');
				window.location.href = `/lobby?${params.toString()}`;
			}
		}
	});
}