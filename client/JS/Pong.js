import { fetchUserData, getUser, updateGame, createGame, fetchMatch, fetchUserById} from './fetchFunctions.js';
import { getWebSocket } from './singletonSocket.js';
import { getCurrentTime } from './utils.js';

let start = false;
let invited = false;
let score_player = 0;
let score_enemy = 0;
let single = false;
let multi = false;
let multi_online = false;
let matchId;
let finish = false;
let connected = false;
const usernameInput = document.getElementById('usernameInput');
const player = document.getElementById("player");
const enemy = document.getElementById("enemy");
const customization = document.getElementById("customizationModal");
const start_button = document.getElementById("start-button");
const enableBallAcceleration = document.getElementById('ballACC');
const ballSpeed = document.getElementById('ballSpeed');
const powersOption = document.getElementById('powers');
const powerPlayerSpeed = document.getElementById('player_speed');
const powerPlayerBallSpeed = document.getElementById('ball_speed');
const powerEnemySpeed = document.getElementById('enemy_speed');
const powerEnemyBallSpeed = document.getElementById('enemy_ball_speed');
const movingSquare = document.getElementById("moving-square");
const defaultBallLeft = parseInt(window.getComputedStyle(movingSquare).left, 10);
const defaultBallTop = parseInt(window.getComputedStyle(movingSquare).top, 10);
const retry_button = document.getElementById('retry-button');
const end_modal = document.getElementById('victoryModal');
const playerTitle = document.getElementById('waitingLabel');
const inviteButton = document.getElementById('inviteOnline');
const startOnlineButton = document.getElementById('startingGameOnline');
const notConnectedModal = document.getElementById('notConnectedModal');
const changeGMButoon = document.getElementById('changeGMbutton');
let enemyY = parseInt(window.getComputedStyle(enemy).top, 10);
let ai_ball_info;
let move_up = true;
let move_down = true;
let ball_acc = false;
let ball_step = 20;
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
let accessToken = localStorage.getItem('access');
let socket;
let data;
let hasValue

// Makes sure the enemy is placed well on resize for responsiveness

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

// This function is removing the game mode div when chosen
// It also shows the game settings and starts the game when start game button is clicked



function hideModal()
{
	$("#gameModeModal").modal("hide");
	start_button.addEventListener('click', async function()
	{
		$("#customizationModal").modal("hide");
		if (multi_online)
		{
			ball_step = parseInt(ballSpeed.value);
			if (enableBallAcceleration.checked)
				ball_acc = true;
			if (powersOption.checked)
				power = true;
			const matchData =
			{
				game: "pong",
				player1: player1Id,
				match_type: "online_multiplayer",
				ball_speed: ball_step,
				ball_acc: ball_acc,
				powers: power
			};
			matchId = await createGame(matchData);
			const onlineMatchData =
			{
				type: "new_match",
				game: "pong",
				matchId: matchId,
			};
			sendMessage(onlineMatchData);
			$("#inviteModal").modal("show");
			socket.addEventListener('message', async function(event)
			{
				const message = JSON.parse(event.data);
				console.log('Parsed message:', message);
				if (message.type = "match_update")
				{
					if (message.player1Position !== undefined)
						player.style.top = message.player1Position + "px";
					if (message.player2Position !== undefined)
						enemy.style.top = message.player2Position + "px";
				}
				if (message.type = "accept_invite")
				{
					const opponent = await fetchUserById(message.inviteeId);
					if (opponent.pong_slider >= 1 && opponent.pong_slider < 8)
					{
						enemy.style.backgroundImage = `url(../Assets/slider${opponent.pong_slider}.jpg)`;
						enemy.style.backgroundSize = "cover";
					}
					else if (opponent.pong_slider == 8)
					{
						enemy.style.background = "linear-gradient(270deg, #ff7e5f, #feb47b, #6a82fb, #fc5c7d, #ff7e5f)";
						enemy.style.backgroundSize = "800% 800%";
						enemy.style.animation = "gradient-animation 3s ease infinite";
					}
					player2Id = opponent.id;
					playerTitle.style.display = "none";
					const playerusername = document.getElementById('playerUsername');
					const opponentTitle = document.getElementById('opponentUsername');
					playerusername.textContent = "You : " + data.username;
					opponentTitle.textContent = "Opponent : " + opponent.username;
					startOnlineButton.display = 'block';
					startOnlineButton.addEventListener('click', async function()
					{
						const starting =
						{
							type: "match_update",
							hostId: player1Id,
							inviteeId: player2Id,
							matchId: matchId,
							match_start: "true"
						};
						sendMessage(starting);
						document.addEventListener("keydown", function(event)
						{
							event.preventDefault();
						
							// Only listening when game has started
						
							if (start && !finish)
							{
								const currentTop = parseInt(window.getComputedStyle(player).top, 10);
								const current2pTop = parseInt(window.getComputedStyle(enemy).top, 10);
								const parentDiv = player.parentElement;
								const parentHeight = parentDiv.clientHeight;
								const rectangleHeight = player.clientHeight;
								const rectangle2pHeight = enemy.clientHeight;
						
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
						});
						start = true;
						page.classList.remove('blur');
						clearInterval(startOnlineButton);
					});
				}
				
			});

			
			inviteButton.addEventListener('click', async function()
			{
				$("#inviteModal").modal("hide");
				let dataSecondUser = await getUser(usernameInput.value);
				if (dataSecondUser === "")
				{
					const errorText = document.getElementById('searchStatus');
					errorText.style.display = 'block';
					errorText.style.color = 'red';
					errorText.textContent = "User not found!";
				}
				else
				{
					console.log(dataSecondUser);
					const matchData =
					{
						type: "send_invite",
						matchId: matchId,
						inviteeId: dataSecondUser.id,
						hostId: player1Id,
						game: "pong",
						tournament: false
					};
					startOnlineButton.display = 'none';
					await sendMessage(matchData);
				}
			})
		}
		else
		{
			ball_step = parseInt(ballSpeed.value);
			if (enableBallAcceleration.checked)
				ball_acc = true;
			if (powersOption.checked)
				power = true;
			page.classList.remove('blur');
			if (connected)
			{
				const matchData =
				{
					game: "pong",
					player1: player1Id,
					match_type: "singleplayer",
					ball_speed: ball_step,
					ball_acc: ball_acc,
					powers: power
				};
				matchId = await createGame(matchData);
			}
			start = true;
			document.addEventListener("keydown", function(event)
			{
				event.preventDefault();
			
				// Only listening when game has started
			
				if (start && !finish)
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
			
					if (multi_online)
					{
						//console.log('yes');
						let newTop;
						if (event.key === "ArrowUp")
						{
							newTop = currentTop - step;
							if (newTop < 0)
								newTop = 0;
							//player.style.top = newTop + "px";
						}
						else if (event.key === "ArrowDown")
						{
							newTop = currentTop + step;
							if (newTop > parentHeight - rectangleHeight)
								newTop = parentHeight - rectangleHeight;
							//player.style.top = newTop + "px";
						}
						//if 
						console.log(matchId);
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
		}
		// Checking every 100ms if the settings have been chosen so that the game can start
		
		let checkValue = setInterval(function()
		{
			if (start && !finish)
			{
				setTimeout(startMovingSquare, 1000);
				clearInterval(checkValue);
			}
		}, 100);
		clearInterval(start_button);
	});
}

// function the AI uses to try and predict trajectories but a second late

function predictBallPosition(ballX, ballY, framesAhead, ball, deltaY, deltaX)
{
	let futureY = ballY;
	let futureDeltaY = deltaY;

	for (let i = 0; i < framesAhead; i++)
	{
		futureY += futureDeltaY;
		if (futureY <= 0 || futureY >= ball.parentElement.clientHeight)
			futureDeltaY = -futureDeltaY;
	}

	return { futureX: ballX + deltaX * framesAhead, futureY };
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
		step = 60;
		key_1_player_pressed = true;
		powerPlayerSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerPlayerSpeed.style.color = "rgba(255, 255, 255, 0.3)";
	}
	if (event.code === "Numpad2" && player_consec_touch >= 7)
	{
		key_2_player_pressed = true;
		powerPlayerBallSpeed.style.backgroundColor = "rgba(128, 128, 128, 0.3)";
		powerPlayerBallSpeed.style.color = "rgba(255, 255, 255, 0.3)";
		ball_powered = true;
	}
}


async function sendMessage(message)
{
	const socket = await getWebSocket();
	if (socket.readyState === WebSocket.OPEN)
	{
		let json_message = JSON.stringify(message);
		socket.send(json_message);
		console.log("message sent " + json_message);
	}
	else
	{
	    console.log('WebSocket is not open.');
	}
}
// Function that moves the ball, does the AI, and makes the ball bounce

async function retry()
{
	start = false;
	finish = false;
	score_enemy = 0;
	score_player = 0;
	enemy_step = 20;
	step = 20;
	end_modal.classList.remove('show');
	end_modal.style.display = 'none';
	movingSquare.style.top = `${defaultBallTop}px`;
	movingSquare.style.left = `${defaultBallLeft}px`;
	var gameModeModal = document.getElementById('gameModeModal');
        var page = document.getElementById('page');
        
	// Showing game modes

	gameModeModal.classList.add('show');
        gameModeModal.style.display = 'block';
        gameModeModal.setAttribute('aria-modal', 'true');
        gameModeModal.setAttribute('role', 'dialog');
        page.classList.add('blur'); // Add blur effect to the background

        var singleplayerBtn = document.getElementById('singleplayer-btn');
        var multiplayerBtn = document.getElementById('multiplayer-btn');
	var multiplayerOnlineBtn = document.getElementById('multiplayer_online-btn');

	// Saving the gamemode and launching settings

	singleplayerBtn.addEventListener('click', async function ()
	{
		single = true;
		hideModal();
		clearInterval(singleplayerBtn);
	});
	multiplayerBtn.addEventListener('click', async function()
	{
		multi = true;
		hideModal();
		clearInterval(multiplayerBtn);
	});
	multiplayerOnlineBtn.addEventListener('click', async function()
	{
		if (!connected)
		{
			gameModeModal.classList.remove('show');
			gameModeModal.style.display = 'none';
			notConnectedModal.classList.add('show');
			notConnectedModal.style.display = "block";
			clearInterval(multiplayerOnlineBtn);
			changeGMButoon.addEventListener('click', function()
			{
				notConnectedModal.classList.remove('show');
				notConnectedModal.style.display = "none";
				clearInterval(changeGMButoon);
				retry();
			})
		}
		else
		{
			multi_online = true;
			hideModal();
			clearInterval(multiplayerOnlineBtn);
		}
	});
	let checkValue = setInterval(function()
	{
		if (start && !finish)
		{
			setTimeout(startMovingSquare, 1000);
			clearInterval(checkValue);
		}
		if (reset)
			clearInterval(checkValue);
	}, 100);
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

	if (single)
	{
		const ai_info = setInterval(() =>
		{
			if (!finish)
				ai_ball_info = deltaY;
			else
				clearInterval(ai_info);
		}, 1000);
	}

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

			// The AI has 9 frames in advance to try and predict the ball direction

			let frames_ahead = 6;
			const predictedPosition = predictBallPosition(leftPosition, topPosition, frames_ahead, movingSquare, ai_ball_info, deltaX);

			// Self-explanatory, handles the ai's powers
			
			handleAIPowers(predictBallPosition.futureY);

			// AI moves down here, also move_up is a boolean that makes sure the AI doesn't go up
			// and down frenetically

			if (predictedPosition.futureY > enemyRect.top + enemyRect.height / 2 && move_down)
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

			else if (predictedPosition.futureY < enemyRect.top + enemyRect.height / 2 && move_up)
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
				if (connected && !hasValue)
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
				end_modal.style.display = 'block';
				end_modal.classList.add('show');
				if (score_enemy == 3)
				{
					document.getElementById('victorytitle').textContent = "You lose";
					document.getElementById('endScore').textContent = score_player + " : " + score_enemy;
				}
				else if (score_player == 3)
				{
					document.getElementById('victorytitle').textContent = "Victory!";
					document.getElementById('endScore').textContent = score_player + " : " + score_enemy;
				}
				clearInterval(moveInterval);
				const retryButton = document.getElementById('retry-button');
				retryButton.addEventListener('click', function()
				{
					clearInterval(retryButton);
					retry();
					//reset = true;
				});
				return ;
			}
			if (connected && !hasValue)
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
			ball_step = parseInt(ballSpeed.value);
			setTimeout(startMovingSquare, 1000);
		}
	}, 50);
}

// This is called after the components have been loaded

document.addEventListener("DOMContentLoaded", async function()
{
	const path = window.location.pathname;
	const pathSegments = path.split('/');
	hasValue = pathSegments[2] && pathSegments[2] !== "";
	if (hasValue)
	{
		data = await fetchUserData();
		if (data !== "")
		{
			if (data.pong_ball >= 1 && data.pong_ball <= 8)
			{
				movingSquare.style.backgroundImage = `url(../Assets/ball${data.pong_ball}.svg)`;
				movingSquare.style.backgroundSize = "contain";
				movingSquare.style.backgroundColor = "transparent"
			}
			if (data.pong_slider >= 1 && data.pong_slider < 8)
			{
				enemy.style.backgroundImage = `url(../Assets/slider${data.pong_slider}.jpg)`;
				enemy.style.backgroundSize = "cover";
			}
			else if (data.pong_slider == 8)
			{
				enemy.style.background = "linear-gradient(270deg, #ff7e5f, #feb47b, #6a82fb, #fc5c7d, #ff7e5f)";
				enemy.style.backgroundSize = "800% 800%";
				enemy.style.animation = "gradient-animation 3s ease infinite";
			}
			player2Id = data.id;
			connected = true;
		}
		if (connected)
		{
			// socket = await getWebSocket();
			const value = pathSegments[2];
			const numberValue = parseInt(value, 10);
			console.log(`The value in the URL is: ${pathSegments[2]}`);
			let gameValues = await fetchMatch(numberValue);
			if (gameValues.match_type == "online_multiplayer")
			{
				const opponent = await fetchUserById(gameValues.player1);
				if (opponent.pong_ball >= 1 && opponent.pong_ball <= 8)
				{
					movingSquare.style.backgroundImage = `url(../Assets/ball${opponent.pong_ball}.svg)`;
					movingSquare.style.backgroundSize = "contain";
					movingSquare.style.backgroundColor = "transparent"
				}
				if (opponent.pong_slider >= 1 && opponent.pong_slider < 8)
				{
					player.style.backgroundImage = `url(../Assets/slider${opponent.pong_slider}.jpg)`;
					player.style.backgroundSize = "cover";
				}
				else if (opponent.pong_slider == 8)
				{
					player.style.background = "linear-gradient(270deg, #ff7e5f, #feb47b, #6a82fb, #fc5c7d, #ff7e5f)";
					player.style.backgroundSize = "800% 800%";
					player.style.animation = "gradient-animation 3s ease infinite";
				}
				ball_step = gameValues.ball_speed;
				ball_acc = gameValues.ball_acc;
				power = gameValues.powers;
				player1Id = opponent.id;
				playerTitle.style.display = "none";
				const playerusername = document.getElementById('playerUsername');
				const opponentTitle = document.getElementById('opponentUsername');
				playerusername.textContent = "You : " + data.username;
				opponentTitle.textContent = "Opponent : " + opponent.username;
				startOnlineButton.style.display = 'none';
				var page = document.getElementById('page');
				page.classList.add('blur');
				$("#waitingModal").modal("show");
				socket.addEventListener('message', async function(event)
				{
					const message = JSON.parse(event.data);
					console.log('Parsed message:', message);
					if (message.type == "match_update")
					{
						if (message.player1Position !== undefined)
							player.style.top = message.player1Position + "px";
						if (message.player2Position !== undefined)
							enemy.style.top = message.player2Position + "px";
						if (message.match_start == "true")
						{
							document.addEventListener("keydown", function(event)
							{
								event.preventDefault();
							
								// Only listening when game has started
							
								if (start && !finish)
								{
									const currentTop = parseInt(window.getComputedStyle(enemy).top, 10);
									const parentDiv = enemy.parentElement;
									const parentHeight = parentDiv.clientHeight;
									const rectangleHeight = enemy.clientHeight;
							
									let newTop;
									if (event.key === "ArrowUp")
									{
										newTop = currentTop - enemy_step;
										if (newTop < 0)
											newTop = 0;
									}
									else if (event.key === "ArrowDown")
									{
										newTop = currentTop + enemy_step;
										if (newTop > parentHeight - rectangleHeight)
											newTop = parentHeight - rectangleHeight;
									}
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
							});
							start = true;
							$("#waitingModal").modal("hide");
							page.classList.remove('blur');
							let checkValue = setInterval(function()
							{
								if (start && !finish)
								{
									setTimeout(startMovingSquare, 1000);
									clearInterval(checkValue);
								}
							}, 100);
						}
					}
				});
			}
		}
	}
	else
	{
		console.log("No value found in the URL after '/pong/'.");
		data = await fetchUserData();
		if (data !== "")
		{
			if (data.pong_ball >= 1 && data.pong_ball <= 8)
			{
				movingSquare.style.backgroundImage = `url(../Assets/ball${data.pong_ball}.svg)`;
				movingSquare.style.backgroundSize = "contain";
				movingSquare.style.backgroundColor = "transparent"
			}
			if (data.pong_slider >= 1 && data.pong_slider < 8)
			{
				player.style.backgroundImage = `url(../Assets/slider${data.pong_slider}.jpg)`;
				player.style.backgroundSize = "cover";
			}
			else if (data.pong_slider == 8)
			{
				player.style.background = "linear-gradient(270deg, #ff7e5f, #feb47b, #6a82fb, #fc5c7d, #ff7e5f)";
				player.style.backgroundSize = "800% 800%";
				player.style.animation = "gradient-animation 3s ease infinite";
			}
			player1Id = data.id;
			connected = true;
		}
		if (connected)
			// socket = await getWebSocket();
		var page = document.getElementById('page');
		$("#gameModeModal").modal("show");
		page.classList.add('blur');
	
		var singleplayerBtn = document.getElementById('singleplayer-btn');
		var multiplayerBtn = document.getElementById('multiplayer-btn');
		var multiplayerOnlineBtn = document.getElementById('multiplayer_online-btn');
	
		singleplayerBtn.addEventListener('click', async function ()
		{
			single = true;
			hideModal();
			clearInterval(singleplayerBtn);
		});
		multiplayerBtn.addEventListener('click', async function()
		{
			multi = true;
			hideModal();
			clearInterval(multiplayerBtn);
		});
		multiplayerOnlineBtn.addEventListener('click', async function()
		{
			if (!connected)
			{
				notConnectedModal.classList.add('show');
				notConnectedModal.style.display = "block";
				clearInterval(multiplayerOnlineBtn);
				changeGMButoon.addEventListener('click', function()
				{
					notConnectedModal.classList.remove('show');
					notConnectedModal.style.display = "none";
					reset = true;
					retry();
					clearInterval(changeGMButoon);
				})
			}
			else
			{
				multi_online = true;
				hideModal();
				clearInterval(multiplayerOnlineBtn);
			}
		});
	}
});
