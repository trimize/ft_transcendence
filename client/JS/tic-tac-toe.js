import { getWebSocket } from "./singletonSocket.js";
import { fetchUserData, fetchMatch, updateGame } from "./fetchFunctions.js";

let socket;
let firstMove = true;
let currentPlayer = 'X';
let gameState = Array(9).fill(null);
let draggedCellIndex = null;
let player1hasSwitch = true;
let player2hasSwitch = true;
let ai = false;
let actualUser;
let matchData;

let player1score = 0;
let player2score = 0;

let matchId;
let host;
let invitee;
let hasPowers;
let isOffline;
let type;
let AIDifficulty;

let cells;
let resetButton;
let player1;
let player2;

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellClick(event) {
    const cell = event.target.closest('.cell');
    let index = cell.getAttribute('data-index');

    if (gameState[index] || checkWinner()) {
        return;
    }
    
    placeCell(index, currentPlayer);
    checkers(true);

    if (currentPlayer === 'O' && ai) {
        if (AIDifficulty === 'easy') {
            setTimeout(makeAIMove_easy, 500);
        } else {
            setTimeout(makeAIMove_hard, 500);
        }
    }
}

function handleCellClickOnline(event) {
    const cell = event.target.closest('.cell');
    let index = cell.getAttribute('data-index');

    if (gameState[index] || checkWinner() || (currentPlayer === 'X' && actualUser.id != host) || (currentPlayer === 'O' && actualUser.id != invitee)) {
        return;
    }
    
    const game_update_message = {
        type: 'match_update',
        game: 'tic-tac-toe',
        movement: 'place',
        index: index,
        player: currentPlayer,
        matchId: matchId,
        hostId: host,
        inviteeId: invitee
    };

    socket.send(JSON.stringify(game_update_message));
}

function placeCell(index, value) {
    let cell = cells[index];

    let backElement = cell.querySelector('.back');
    const frontElement = cell.querySelector('.front');
    if (backElement === null) {
        cell = cell.parentElement;
        backElement = cell.querySelector('.back');
    }
    backElement.textContent = value;
    cell.classList.add('flip');

    cell.addEventListener('animationend', () => {
        cell.classList.remove('flip');
        cell.classList.add('cell');
        frontElement.textContent = value;
        backElement.textContent = '';
        // cell.textContent = backElement.textContent;
    }, { once: true });

    gameState[index] = value;
}

function endGame() {
    window.location.href = '/';
}

function checkers(change) {
    const gameMessageElement = document.getElementById('game-message');
    const scoreDiv = document.getElementById('score');

    const winner = checkWinner();

    if (winner && winner !== 'D') {
        gameMessageElement.textContent = `${winner} wins!`;
        gameMessageElement.style.display = 'block';
        if (winner === 'X') {
            player1score++;
        } else {
            player2score++;
        }

        scoreDiv.textContent = `${player1score}:${player2score}`;

        const isEnd = (player1score >= 3 || player2score >= 3);

        if (actualUser.id == host && !isOffline) {
            console.log('Updating game');
            const game_update_body = {
                id: matchId,
                player1_score: player1score,
                player2_score: player2score,
                end_time: (isEnd ? new Date() : null)
            };

            updateGame(game_update_body);
        }

        if (isEnd) {
            setTimeout(endGame, 5000);
        } else {
            setTimeout(resetGame, 2000);
        }

    } else if (winner === 'D' || gameState.every(cell => cell)) {
        gameMessageElement.textContent = 'Draw!';
        gameMessageElement.style.display = 'block';
        setTimeout(resetGame, 2000);
    } else {
        if (firstMove) {
            firstMove = false;
        }
        if (change) {
            changeTurn();
        }
    }
}

function makeAIMove_easy() {
    let index;
    const availableCells = gameState.reduce((acc, cell, index) => {
        if (!cell) {
            acc.push(index);
        }
        return acc;
    }, []);
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    index = availableCells[randomIndex];
    placeCell(index, currentPlayer);
    checkers(true);
}

function makeAIMove_hard() {
    // let index;
    const availableCells = gameState.reduce((acc, cell, index) => {
        if (!cell) {
            acc.push(index);
        }

        return acc;
    }, []);

    if (availableCells.includes(4)) {
        placeCell(4, currentPlayer);
        checkers(true);
        return;
    }
    
    const AI_almostWinningCombinations = winningCombinations.filter(combination => {
        const cells = combination.map(index => gameState[index]);
        const oCount = cells.filter(cell => cell === 'O').length;
        return oCount === 2;
    }, []);
    
    for (let i = 0; i < AI_almostWinningCombinations.length; i++) {

        const combination = AI_almostWinningCombinations[i];
        let targetIndex = combination.find(index => gameState[index] === null);
        if (targetIndex !== undefined) {
            placeCell(targetIndex, currentPlayer);
            checkers(true);
            return;
        }
        if (player2hasSwitch) {
            targetIndex = combination.find(index => gameState[index] === 'X');
            if (targetIndex !== undefined) {
                const myCells = gameState.reduce((acc, cell, index) => {
                    if (cell === 'O') {
                        acc.push(index);
                    }
                    return acc;
                }, []);
                for (let j = 0; j < myCells.length; j++) {
                    if (!combination.includes(myCells[j])) {
                        console.log(`Index of 'O' not in combination: ${myCells[j]}`);
                        switchCells(myCells[j], targetIndex);
                        return;
                    }
                }
                break;
            }
        }
    }

    const player1_almostWinningCombinations = winningCombinations.filter(combination => {
        const cells = combination.map(index => gameState[index]);
        const xCount = cells.filter(cell => cell === 'X').length;
        return xCount === 2;
    }, []);

    if (player1_almostWinningCombinations.length >= 2 && player2hasSwitch) {
        const playerAlmostWinningWithEmptyCells = player1_almostWinningCombinations.filter(combination => {
            return combination.some(index => gameState[index] === null);
        });
        if (playerAlmostWinningWithEmptyCells.length === 2) {
            const targetIndex = playerAlmostWinningWithEmptyCells[0].find(index => playerAlmostWinningWithEmptyCells[1].includes(index));
            const myIndex = gameState.findIndex((cell, index) => 
                cell === 'O' && player1_almostWinningCombinations.every(combination => !combination.includes(index))
            );
            if (targetIndex !== undefined) {
                switchCells(myIndex, targetIndex);
                return
            }
        }
    }

    for (let i = 0; i < player1_almostWinningCombinations.length; i++) {
        const combination = player1_almostWinningCombinations[i];
        const targetIndex = combination.find(index => gameState[index] === null);
        if (targetIndex !== undefined) {
            placeCell(targetIndex, currentPlayer);
            checkers(true);
            return;
        }
    }

    makeAIMove_easy();
}

function handleDragStart(event) {
    const cell = event.target.closest('.cell');
    draggedCellIndex = cell.getAttribute('data-index');
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    if (!hasPowers) {
        alert('Powers are not enabled for this match!');
        return;
    }
	if ((currentPlayer === 'X' && !player1hasSwitch) || (currentPlayer === 'O' && !player2hasSwitch)) {
		alert('You have already switched on this match!');
		return;
	}
    const cell = event.target.closest('.cell');
    const targetCellIndex = cell.getAttribute('data-index');
    switchCells(draggedCellIndex, targetCellIndex);
    if (currentPlayer === 'O' && ai) {
        setTimeout(makeAIMove_hard, 500);
    }
}

function handleDropOnline(event) {
    if (!hasPowers) {
        alert('Powers are not enabled for this match!');
        return;
    }
	if ((currentPlayer === 'X' && !player1hasSwitch) || (currentPlayer === 'O' && !player2hasSwitch)) {
		alert('You have already switched on this match!');
		return;
	}

    const cell = event.target.closest('.cell');
    const targetCellIndex = cell.getAttribute('data-index');

    const game_update_message = {
        type: 'match_update',
        game: 'tic-tac-toe',
        movement: 'switch',
        index1: draggedCellIndex,
        index2: targetCellIndex,
        player: currentPlayer,
        matchId: matchId,
        hostId: host,
        inviteeId: invitee
    };
    socket.send(JSON.stringify(game_update_message));
}

function switchCells(currentCellIndex, targetCellIndex) {
    if (currentCellIndex !== null && targetCellIndex !== null && gameState[targetCellIndex] !== null) {
		if ((gameState[targetCellIndex] === 'X' && gameState[currentCellIndex] === 'X') || (gameState[targetCellIndex] === 'O' && gameState[currentCellIndex] === 'O')) {
			return;
		}
        swapCells(currentCellIndex, targetCellIndex);
		if (currentPlayer === 'X') {
            player1hasSwitch = false;
		} else {
            player2hasSwitch = false;
		}
        if (currentPlayer === 'O') {
            checkers(false);
        } else {
            checkers(true);
        }
    }
}

function swapCells(index1, index2) {
    const temp = gameState[index2];
    // gameState[index1] = gameState[index2];
    // gameState[index2] = temp;

    // cells[index1].textContent = gameState[index1];
    // cells[index2].textContent = gameState[index2];
    placeCell(index2, gameState[index1]);
    placeCell(index1, temp);
}

function checkWinner() {
    const players = ['X', 'O'];
    let winners = [];

    players.forEach(player => {
        const isWinner = winningCombinations.some(combination => {
            return combination.every(index => {
                return gameState[index] === player;
            });
        });
        if (isWinner) {
            winners.push(player);
        }
    });

    if (winners.length === 2) {
        return 'D'; // Draw
    } else if (winners.length === 1) {
        return winners[0]; // Return the winner ('X' or 'O')
    } else {
        return null; // No winners
    }
}

function resetGame() {
    const gameMessageElement = document.getElementById('game-message');

    gameMessageElement.style.display = 'none';
    gameState.fill(null);
    cells.forEach(cell => {
        cell.querySelector('.front').textContent = '';
        cell.querySelector('.back').textContent = '';
    });
    currentPlayer = 'X';
	player1.classList.add('flame');
	player2.classList.remove('flame');
	firstMove = true;
    if (hasPowers) {
        player1hasSwitch = true;
        player2hasSwitch = true;
    }
}

function changeTurn() {
	if (!firstMove) {
		currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
		if (currentPlayer === 'X') {
			player1.classList.add('flame');
			player2.classList.remove('flame');
		} else {
			player1.classList.remove('flame');
			player2.classList.add('flame');
		}
	} else {
		player1.classList.add('flame');
	}
}

function tttHtml()
{
	return `
            <div class="container">
                <div class="player" id="player1">Player 1</div>
                <div class="grid">
                    <div id="score" class="score">0:0</div>
                    <div id="game-message" class="game-message"></div>
                    <div class="cell" data-index="0" draggable="true">
                        <div class="front"></div>
                        <div class="back"></div>
                    </div>
                    <div class="cell" data-index="1" draggable="true">
                        <div class="front"></div>
                        <div class="back"></div>
                    </div>
                    <div class="cell" data-index="2" draggable="true">
                        <div class="front"></div>
                        <div class="back"></div>
                    </div>
                    <div class="cell" data-index="3" draggable="true">
                        <div class="front"></div>
                        <div class="back"></div>
                    </div>
                    <div class="cell" data-index="4" draggable="true">
                        <div class="front"></div>
                        <div class="back"></div>
                    </div>
                    <div class="cell" data-index="5" draggable="true">
                        <div class="front"></div>
                        <div class="back"></div>
                    </div>
                    <div class="cell" data-index="6" draggable="true">
                        <div class="front"></div>
                        <div class="back"></div>
                    </div>
                    <div class="cell" data-index="7" draggable="true">
                        <div class="front"></div>
                        <div class="back"></div>
                    </div>
                    <div class="cell" data-index="8" draggable="true">
                        <div class="front"></div>
                        <div class="back"></div>
                    </div>
                </div>
                <div class="player" id="player2">Player 2</div>
            </div>
            <div id="bg"></div>
	`;
}

export const renderTTT = async () => {
    socket = await getWebSocket();
    actualUser = await fetchUserData();
    const urlParams = new URLSearchParams(window.location.search);
    host = urlParams.get('host');
    invitee = urlParams.get('invitee');
    hasPowers = urlParams.get('powers');
    isOffline = urlParams.get('offline');
    type = urlParams.get('type');
    AIDifficulty = urlParams.get('ai');
    matchId = urlParams.get('matchId');
    if (AIDifficulty === 'easy' || AIDifficulty === 'hard') {
        ai = true;
    }
	document.getElementById('content').innerHTML = tttHtml();
    cells = document.querySelectorAll('.cell');
    resetButton = document.getElementById('reset');
    player1 = document.getElementById('player1');
    player2 = document.getElementById('player2');


    if (isOffline || (type === 'multi' || type === 'single')) {
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('dragstart', handleDragStart);
            cell.addEventListener('dragover', handleDragOver);
            cell.addEventListener('drop', handleDrop);
        });
    } else {
        matchData = await fetchMatch(matchId);
        console.log('Match data:');
        console.log(matchData);

        player1score = matchData.player1_score;
        player2score = matchData.player2_score;

        hasPowers = matchData.powers;

        const scoreDiv = document.getElementById('score');
        scoreDiv.textContent = `${player1score}:${player2score}`;

        if (!actualUser) {
            alert('You are not logged in!');
            document.getElementById('content').innerHTML = '';
            return;
        }

        console.log('Actual user:');
        console.log(actualUser);
        console.log('Match data:');
        console.log(matchData);

        if (actualUser.id != host && actualUser.id != invitee) {
            alert('You are not part of this match!');
            document.getElementById('content').innerHTML = '';
            return;
        } else if (actualUser.id != matchData.player1 && actualUser.id != matchData.player2) {
            alert('You are not part of this match!');
            document.getElementById('content').innerHTML = '';
            return;
        }

        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClickOnline);
            cell.addEventListener('dragstart', handleDragStart);
            cell.addEventListener('dragover', handleDragOver);
            cell.addEventListener('drop', handleDropOnline);
        });
        socket.addEventListener('message', function(event) {
            const message = JSON.parse(event.data);
            if (message.type === 'match_update') {
                if (message.movement === 'place') {
                    placeCell(message.index, message.player);
                    checkers(true);
                } else if (message.movement === 'switch') {
                    switchCells(message.index1, message.index2);
                }
            } else if (message.type === 'friend_disconnected') {
                if (message.userId == host || message.userId == invitee) {
                    const lobbyParams = new URLSearchParams();
                    lobbyParams.append('matchId', matchId);
                    lobbyParams.append('host', host);
                    lobbyParams.append('invitee', invitee);
                    lobbyParams.append('powers', hasPowers);
                    lobbyParams.append('game', 'ttt');
                    window.location.href = `/lobby?${lobbyParams.toString()}`;
                }
            }
        });
    }

    changeTurn();
};
