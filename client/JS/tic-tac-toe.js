const cells = document.querySelectorAll('.cell');
const resetButton = document.getElementById('reset');
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const ai = true;
let firstMove = true;

let currentPlayer = 'X';
let gameState = Array(9).fill(null);
let draggedCellIndex = null;
let player1hasSwitch = true;
let player2hasSwitch = true;

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

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
    cell.addEventListener('dragstart', handleDragStart);
    cell.addEventListener('dragover', handleDragOver);
    cell.addEventListener('drop', handleDrop);
});

resetButton.addEventListener('click', resetGame);

function handleCellClick(event) {
    const cell = event.target.closest('.cell');
    let index = cell.getAttribute('data-index');

    if (gameState[index] || checkWinner()) {
        return;
    }
    
    placeCell(index, currentPlayer);
    checkers();

    if (currentPlayer === 'O' && ai) {
        setTimeout(makeAIMove_hard, 500);
    }
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

function checkers() {
    const gameMessageElement = document.getElementById('game-message');

    if (checkWinner()) {
        gameMessageElement.textContent = `${currentPlayer} wins!`;
        gameMessageElement.style.display = 'block';
    } else if (gameState.every(cell => cell)) {
        gameMessageElement.textContent = 'Draw!';
        gameMessageElement.style.display = 'block';
    } else {
        if (firstMove) {
            firstMove = false;
        }
        changeTurn();
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
    checkers();
}

function makeAIMove_hard() {
    // let index;
    const availableCells = gameState.reduce((acc, cell, index) => {
        if (!cell) {
            acc.push(index);
        }

        return acc;
    }, []);
    
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
            checkers();
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
            checkers();
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
        checkers();
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
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return gameState[index] === currentPlayer;
        });
    });
}

function resetGame() {
    gameState.fill(null);
    cells.forEach(cell => {
        // cell.textContent = '';
        cell.querySelector('.front').textContent = '';
        cell.querySelector('.back').textContent = '';
    });
    currentPlayer = 'X';
	player1.classList.add('flame');
	player2.classList.remove('flame');
	firstMove = true;
	player1hasSwitch = true;
	player2hasSwitch = true;
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

// Initialize flame effect for Player 1
changeTurn();