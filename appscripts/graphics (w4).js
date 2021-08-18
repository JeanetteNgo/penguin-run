console.log('start main script of final project');

const gameContainer = document.getElementById('game-container');

// initialise constants
////////////////////////////////////////////////////////////////////////////////

/**
 * 's' refers to starting point  
 * 'e' refers to ending point  
 * 'w' refers to wall  
 */
const maze = [
    [' ', ' ', ' ', ' ', ' ', ' ', 'w', ' ', ' ', ' ', ' '],
    ['w', ' ', 'w', 'w', 'w', ' ', 'w', 'w', ' ', 'w', ' '],
    ['w', ' ', 'w', ' ', ' ', ' ', ' ', ' ', ' ', 'w', 'w'],
    [' ', ' ', ' ', ' ', 'w', 'w', ' ', 'w', ' ', ' ', ' '],
    [' ', 'w', 'w', ' ', ' ', ' ', ' ', 'w', ' ', 'w', ' '],
    [' ', ' ', 'w', 'w', ' ', 'w', 'w', 'w', 'w', 'w', ' '],
    ['w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    ['w', 'w', ' ', ' ', 'w', 'w', ' ', 'w', 'w', ' ', 'e'],
];

const playerSpritePath = {
    'left': 'images/penguin-left.PNG',
    'right': 'images/penguin-right.PNG',
};

const mazeSpritePaths = {
    ' ': 'images/background.PNG',
    'e': 'images/fish.PNG',
    'w': 'images/ice-cube.PNG',
};

const numColumns = maze[0].length;
const numRows = maze.length;

const cellWidth = 40;
const cellHeight = 40;

const gameWidth = numColumns * cellWidth;
const gameHeight = numRows * cellHeight;

const paperWidth = gameWidth;
const paperHeight = gameHeight;

////////////////////////////////////////////////////////////////////////////////

// initialise game graphics
////////////////////////////////////////////////////////////////////////////////

const gamePaper = Raphael(gameContainer, paperWidth, paperHeight);
const gameRect = gamePaper.rect(0, 0, paperWidth, paperHeight);

// maze
for (let i = 0; i < numRows; ++i) {
    for (let j = 0; j < numColumns; ++j) {
        const cellType = maze[i][j]
        const cellSpritePath = mazeSpritePaths[cellType];

        gamePaper.image(
            cellSpritePath,
            j * cellWidth,
            i * cellHeight,
            cellWidth,
            cellHeight,
        );
    }

}

////////////////////////////////////////////////////////////////////////////////

// set up player
////////////////////////////////////////////////////////////////////////////////

// current cell
// set to starting point
let cellColIndex = 0;
let cellRowIndex = 0;

const playerSize = 25;

// player current position
// starts in centre of starting point
let playerX = (cellWidth - playerSize) / 2;
let playerY = (cellHeight - playerSize) / 2;

//Paper.image(src, x, y, width, height)
const player = gamePaper.image(
    playerSpritePath['right'],
    playerX,
    playerY,
    playerSize,
    playerSize,
);

// player's potential next position
let nextPlayerX = playerX;
let nextPlayerY = playerY;

// potential next cell
let nextCellColIndex = 0;
let nextCellRowIndex = 0;

const playerSpeed = 3;

////////////////////////////////////////////////////////////////////////////////

const startButton = document.getElementById('start-button');
startButton.addEventListener('click', startGame);

// game functions
////////////////////////////////////////////////////////////////////////////////

/**
 * Starts the game
 */
function startGame() {
    startButton.innerHTML = 'Restart';

    playerX = (cellWidth - playerSize) / 2;
    playerY = (cellHeight - playerSize) / 2;

    nextPlayerX = playerX;
    nextPlayerY = playerY;

    player.attr({
        'src': playerSpritePath['right'],
        'x': playerX,
        'y': playerY,
    });

    // player movement
    document.addEventListener('keydown', movePlayer);
}

function endGame() {
    startButton.innerHTML = 'Start';

    playerX = (cellWidth - playerSize) / 2;
    playerY = (cellHeight - playerSize) / 2;

    nextPlayerX = playerX;
    nextPlayerY = playerY;

    player.attr({
        'src': playerSpritePath['right'],
        'x': playerX,
        'y': playerY,
    });

    document.removeEventListener('keydown', movePlayer);

    window.alert('You win!');
}

////////////////////////////////////////////////////////////////////////////////

// player-related functions
////////////////////////////////////////////////////////////////////////////////

/**
 * Move the player
 * @param {*} event keydown event
 * @returns 
 */
function movePlayer(event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    switch (event.key) {
        case 'ArrowUp':
            nextPlayerY = playerY - playerSpeed;

            // need player size to make sure edge do not go in
            nextCellRowIndex = getCellRowIndex(nextPlayerY);

            if (nextCellRowIndex < 0) {
                nextCellRowIndex = 0;
                return;
            
            } else if (maze[nextCellRowIndex][cellColIndex] == 'w') {
                return
            }

            playerY = nextPlayerY;
            cellRowIndex = nextCellRowIndex;
            
            break;

        case 'ArrowDown':
            nextPlayerY = playerY + playerSpeed;

            // need player size to make sure edge do not go in
            nextCellRowIndex = getCellRowIndex(nextPlayerY + playerSize);

            if (nextCellRowIndex >= numRows) {
                nextCellRowIndex = numRows - 1;
                return;

            } else if (maze[nextCellRowIndex][cellColIndex] == 'w') {
                return;
            }

            playerY = nextPlayerY;
            cellRowIndex = nextCellRowIndex;
            
            break;

        case 'ArrowLeft':
            nextPlayerX = playerX - playerSpeed;

            // need player size to make sure edge do not go in
            nextCellColIndex = getCellColIndex(nextPlayerX);

            if (nextCellColIndex < 0) {
                nextCellColIndex = 0;
                return;

            } else if (maze[cellRowIndex][nextCellColIndex] == 'w') {
                return;
            }

            playerX = nextPlayerX;
            cellColIndex = nextCellColIndex;

            player.attr({'src': playerSpritePath['left']});
                        
            break;

        case 'ArrowRight':
            nextPlayerX = playerX + playerSpeed;

            // need player size to make sure edge do not go in
            nextCellColIndex = getCellColIndex(nextPlayerX + playerSize);

            if (nextCellColIndex >= numColumns) {
                nextCellColIndex = numColumns - 1;
                return;

            } else if (maze[cellRowIndex][nextCellColIndex] == 'w') {
                return;
            }

            playerX = nextPlayerX;
            cellColIndex = nextCellColIndex;

            player.attr({'src': playerSpritePath['right']});
                        
            break;

        default:
            return; // Quit when this doesn't handle the key event.
    }

    // update player sprite position
    player.attr({
        'x': playerX,
        'y': playerY,
    });

    // reach end of maze
    if (maze[cellRowIndex][cellColIndex] == 'e') {
        endGame();
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}

/**
 * Get the column index of the cell, if the player is in it.
 * 
 * @param {number} playerX 
 */
function getCellColIndex(playerX) {
    // logic:
    // The index is essentially the number of cells up to that point.
    // Therefore, to get the index, 
    // just divide the row's pixel length by cell width.
    // Need to subtract the margin to account for maze's offset on paper.

    return Math.floor(playerX / cellWidth);
}

/**
 * Get the row index of the cell, if the player is in it.
 * 
 * @param {number} playerY 
 */
 function getCellRowIndex(playerY) {
    // logic: same as with row index

    return Math.floor(playerY / cellHeight);
}

////////////////////////////////////////////////////////////////////////////////