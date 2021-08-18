console.log('start main script of final project');

const gameContainer = document.getElementById('game-container');



// initialise constants

/**
 * 's' refers to starting point  
 * 'e' refers to ending point  
 * 'w' refers to wall  
 */
const maze = [
    ['s', ' ', ' ', ' ', ' ', ' ', 'w', ' ', ' ', ' ', ' '],
    [' ', ' ', 'w', 'w', 'w', ' ', 'w', 'w', ' ', 'w', ' '],
    ['w', ' ', 'w', ' ', ' ', ' ', ' ', ' ', ' ', 'w', 'w'],
    [' ', ' ', ' ', ' ', 'w', 'w', ' ', 'w', ' ', ' ', ' '],
    [' ', 'w', 'w', ' ', ' ', ' ', ' ', 'w', ' ', 'w', ' '],
    [' ', ' ', 'w', 'w', ' ', 'w', 'w', 'w', 'w', 'w', ' '],
    ['w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    ['w', 'w', ' ', ' ', 'w', 'w', ' ', 'w', 'w', ' ', 'e'],
];

const mazeColors = {
    ' ': 'white',
    's': 'red',
    'e': 'red',
    'w': 'gray',
};

const numColumns = maze[0].length;
const numRows = maze.length;

const cellWidth = 30;
const cellHeight = 30;

const gameWidth = numColumns * cellWidth;
const gameHeight = numRows * cellHeight;

const horizontalMargin = 30;
const verticalMargin = 30;

const paperWidth = gameWidth + 2 * horizontalMargin;
const paperHeight = 2 * gameHeight + 3 * horizontalMargin;

// done initialising constants



// start setting up game background

const gamePaper = Raphael(gameContainer, paperWidth, paperHeight);

const gameRect = gamePaper.rect(0, 0, paperWidth, paperHeight);
gameRect.attr({
    'fill': 'black',
    'stroke': 'gray',
    'stroke-width': 8,
});

// done setting up game background



// start creating maze graphics

for (let i = 0; i < numRows; ++i) {
    for (let j = 0; j < numColumns; ++j) {
        const cellType = maze[i][j]
        const cellColor = mazeColors[cellType];

        const cellRect = gamePaper.rect(
            horizontalMargin + j * cellWidth,
            verticalMargin + i * cellHeight,
            cellWidth,
            cellHeight,
        );
        cellRect.attr({
            'fill': cellColor,
        })

    }

}

// done creating maze graphics



// start setting up player

// player current position
// starts in centre of starting point
let playerX = horizontalMargin + cellWidth / 2;
let playerY = verticalMargin + cellHeight / 2;

// current cell
// set to starting point
let cellColIndex = 0;
let cellRowIndex = 0;

const playerSize = 5;

const playerCircle = gamePaper.circle(playerX, playerY, playerSize);
playerCircle.attr({
    'fill': 'cyan',
    'stroke': 'cyan',
});

// player's potential next position
let nextPlayerX = playerX;
let nextPlayerY = playerY;

// potential next cell
let nextCellColIndex = 0;
let nextCellRowIndex = 0;

const playerSpeed = 3;

// player movement
// https://stackoverflow.com/a/40648033/9171260
document.addEventListener('keydown', function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    switch (event.key) {
        case 'ArrowUp':
            nextPlayerY = playerY - playerSpeed;

            // need player size to make sure edge do not go in
            nextCellRowIndex = getCellRowIndex(nextPlayerY - playerSize);

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
            nextCellColIndex = getCellColIndex(nextPlayerX - playerSize);

            if (nextCellColIndex < 0) {
                nextCellColIndex = 0;
                return;

            } else if (maze[cellRowIndex][nextCellColIndex] == 'w') {
                return;
            }

            playerX = nextPlayerX;
            cellColIndex = nextCellColIndex;
                        
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
                        
            break;

        default:
            return; // Quit when this doesn't handle the key event.
    }

    playerCircle.attr({
        'cx': playerX,
        'cy': playerY,
    });

    console.log(`player at x=${playerX}, y=${playerY}`);
    console.log(`current cell is col=${cellColIndex}, row=${cellRowIndex}`);

    if (maze[cellRowIndex][cellColIndex] == 'e') {
        window.alert('You win!');
        // code to reset game
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true); // dispatch the event to the listener first,

// done setting up player



// maze-related functions

/**
 * Get the column index of the cell, if the player is in it.
 * 
 * @param {number} playerX 
 */
function getCellColIndex(playerX) {
    // logic:
    // The index is essentially the number of cells up to that point.
    // Therefore, to get the index, just divide the row's pixel length by cell width.
    // Need to subtract the margin to account for maze's offset on paper.

    return Math.floor((playerX - horizontalMargin) / cellWidth);
}

/**
 * Get the row index of the cell, if the player is in it.
 * 
 * @param {number} playerY 
 */
 function getCellRowIndex(playerY) {
    // logic: same as with row index

    return Math.floor((playerY - verticalMargin) / cellHeight);
}

// player-related functions



// start setting up minigame

// mini game on bottom half
const miniGameRect = gamePaper.rect(
    horizontalMargin,
    gameHeight + 2 * verticalMargin,
    gameWidth,
    gameHeight,
);
miniGameRect.attr({
    'fill': 'gray',
});

// done setting up minigame
