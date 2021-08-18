console.log('start main script of final project');

// main game variables
////////////////////////////////////////////////////////////////////////////////

const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-button');
startButton.addEventListener('click', startGame);

////////////////////////////////////////////////////////////////////////////////


// maze variables
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


// define player attributes
////////////////////////////////////////////////////////////////////////////////

const player = {
    'sprite-paths': {
        'left': 'images/penguin-left.PNG',
        'right': 'images/penguin-right.PNG',
    },
    'width': 26,
    'height': 30,
    'speed': 4,
};

// player starts in centre of starting point
player['x'] = (cellWidth - player['width']) / 2;
player['y'] = (cellHeight - player['height']) / 2;

// for checking of collision with walls
let cellRowIndex = 0;
let cellColIndex = 0;

////////////////////////////////////////////////////////////////////////////////


// define snowballs
////////////////////////////////////////////////////////////////////////////////

const snowballs = [];

snowballs[0] = {
    'starting-point': {'x': 60, 'y': 260},
    'ending-point': {'x': 420, 'y': 260},
    'moves-vertically': false,
    'direction': 1, // 1 for forward, -1 for backwards
    'speed': 2,
    'radius': 6,
    'color': {'fill': 'white', 'stroke': 'white'},
    'handle': null, // for clearInterval()
};

snowballs[1] = {
    'starting-point': {'x': 140, 'y': 100},
    'ending-point': {'x': 340, 'y': 100},
    'moves-vertically': false,
    'direction': 1, // 1 for forward, -1 for backwards
    'speed': 1,
    'radius': 6,
    'color': {'fill': 'white', 'stroke': 'white'},
    'handle': null, // for clearInterval()
};

snowballs[2] = {
    'starting-point': {'x': 340, 'y': 20},
    'ending-point': {'x': 340, 'y': 180},
    'moves-vertically': true,
    'direction': 1, // 1 for forward, -1 for backwards
    'speed': 1,
    'radius': 6,
    'color': {'fill': 'white', 'stroke': 'white'},
    'handle': null, // for clearInterval()
};

for(let i = 0; i < snowballs.length; i++) {
    snowballs[i]['x'] = snowballs[i]['starting-point']['x'];
    snowballs[i]['y'] = snowballs[i]['starting-point']['y'];
}

////////////////////////////////////////////////////////////////////////////////


// timer variables 
////////////////////////////////////////////////////////////////////////////////

let timerMinutes = 0;
let timerSeconds = 0;

let gameTimerHandle = null;

const timerMinutesSpan = document.getElementById('timer-minutes');
const timerSecondsSpan = document.getElementById('timer-seconds');

////////////////////////////////////////////////////////////////////////////////


// initialize game graphics
////////////////////////////////////////////////////////////////////////////////

const gamePaper = Raphael(gameContainer, paperWidth, paperHeight);
const gameRect = gamePaper.rect(0, 0, paperWidth, paperHeight);

let cellType;
let cellSpritePath;

// maze
for (let i = 0; i < numRows; ++i) {
    for (let j = 0; j < numColumns; ++j) {
        cellType = maze[i][j]
        cellSpritePath = mazeSpritePaths[cellType];
        
        gamePaper.image(
            cellSpritePath,
            j * cellWidth,
            i * cellHeight,
            cellWidth,
            cellHeight,
        );
    }

}

//Paper.image(src, x, y, width, height)
player['sprite'] = gamePaper.image(
    player['sprite-paths']['right'],
    player['x'],
    player['y'],
    player['width'],
    player['height'],
);

for(let i = 0; i < snowballs.length; i++) {
    snowballs[i]['sprite'] = gamePaper.circle(
        snowballs[i]['x'],
        snowballs[i]['y'],
        snowballs[i]['radius'],
    );
    snowballs[i]['sprite'].attr(snowballs[i]['color']);
}

////////////////////////////////////////////////////////////////////////////////


// game functions
////////////////////////////////////////////////////////////////////////////////

/**
 * Starts the game
 */
function startGame() {
    // reset graphics
    startButton.innerHTML = 'Restart';

    player['x'] = (cellWidth - player['width']) / 2;
    player['y'] = (cellHeight - player['height']) / 2;

    player['sprite'].attr({
        'src': player['sprite-paths']['right'],
        'x': player['x'],
        'y': player['y'],
    });

    for(let i = 0; i < snowballs.length; i++) {
        snowballs[i]['x'] = snowballs[i]['starting-point']['x'];
        snowballs[i]['y'] = snowballs[i]['starting-point']['y'];

        snowballs[i]['sprite'].attr({
            'cx': snowballs[i]['x'],
            'cy': snowballs[i]['y'],
        });
    }

    // reset timer
    timerMinutes = 0;
    timerSeconds = 0;

    timerMinutesSpan.innerHTML = '0 min';
    timerSecondsSpan.innerHTML = '0 sec';

    // enable player movement
    document.addEventListener('keydown', movePlayer);

    // start timer
    if (gameTimerHandle != null) {
        clearInterval(gameTimerHandle);
    }
    gameTimerHandle = setInterval(updateTimer, 1000);

    // start moving snowballs
    for(let i = 0; i < snowballs.length; i++) {
        if (snowballs[i]['handle'] != null) {
            clearInterval(snowballs[i]['handle']);
        }
        snowballs[i]['handle'] = setInterval(moveSnowball, 20, snowballs[i]);
    }
}

function endGame(win) {
    // disable player movement
    document.removeEventListener('keydown', movePlayer);

    // stop timer
    clearInterval(gameTimerHandle);
    gameTimerHandle = null;

    // stop moving snowballs
    for(let i = 0; i < snowballs.length; i++) {
        clearInterval(snowballs[i]['handle']);
        snowballs[i]['handle'] = null;
    }

    //Conditional (ternary) operator
    const status = win ? 'Yay! Caught a fish in' : 'Ouch! Got bonked by a snowball at';  
    window.alert(`${status} ${timerMinutes} min ${timerSeconds} sec.`);

    // reset graphics
    startButton.innerHTML = 'Start';

    timerMinutes = 0;
    timerSeconds = 0;

    timerMinutesSpan.innerHTML = '0 min';
    timerSecondsSpan.innerHTML = '0 sec';

    player['x'] = (cellWidth - player['width']) / 2;
    player['y'] = (cellHeight - player['height']) / 2;

    player['sprite'].attr({
        'src': player['sprite-paths']['right'],
        'x': player['x'],
        'y': player['y'],
    });

    for(let i = 0; i < snowballs.length; i++) {
        snowballs[i]['x'] = snowballs[i]['starting-point']['x'];
        snowballs[i]['y'] = snowballs[i]['starting-point']['y'];

        snowballs[i]['sprite'].attr({
            'cx': snowballs[i]['x'],
            'cy': snowballs[i]['y'],
        });
    }
}

function updateTimer() {
    timerSeconds++;

    if (timerSeconds >= 60) {
        timerSeconds = 0;
        timerMinutes++;
    }

    timerMinutesSpan.innerHTML = timerMinutes + ` min`;
    timerSecondsSpan.innerHTML = timerSeconds.toString().padStart(2, '0') + ` sec`;
}

////////////////////////////////////////////////////////////////////////////////

// player-related functions
////////////////////////////////////////////////////////////////////////////////

/**
 * Move the player
 * @param {*} event keydown event
 */
function movePlayer(event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    switch (event.key) {
        case 'ArrowUp':
            // check top-left corner
            [cellRowIndex, cellColIndex] = getCellRowColIndices(
                player['x'],
                player['y'] - player['speed'],
            );

            // check collide with maze border or wall
            if (cellRowIndex < 0 || 
                maze[cellRowIndex][cellColIndex] == 'w') {
                return;
            }

            // check top-right corner
            [cellRowIndex, cellColIndex] = getCellRowColIndices(
                player['x'] + player['width'],
                player['y'] - player['speed'],
            );

            // check collide with maze border or wall
            if (cellRowIndex < 0 || 
                maze[cellRowIndex][cellColIndex] == 'w') {
                return;
            }

            player['y'] -= player['speed'];
            
            break;

        case 'ArrowDown':
            // check bottom-left corner
            [cellRowIndex, cellColIndex] = getCellRowColIndices(
                player['x'],
                player['y'] + player['height'] + player['speed'],
            );

            // check collide with maze border or wall
            if (cellRowIndex >= numRows || 
                maze[cellRowIndex][cellColIndex] == 'w') {
                return;
            }

            // check bottom-right corner
            [cellRowIndex, cellColIndex] = getCellRowColIndices(
                player['x'] + player['width'],
                player['y'] + player['height'] + player['speed'],
            );

            // check collide with maze border or wall
            if (cellRowIndex >= numRows || 
                maze[cellRowIndex][cellColIndex] == 'w') {
                return;
            }

            player['y'] += player['speed'];
            
            break;

        case 'ArrowLeft':
            // check top-left corner
            [cellRowIndex, cellColIndex] = getCellRowColIndices(
                player['x'] - player['speed'],
                player['y'],
            );

            // check collide with maze border or wall
            if (cellColIndex < 0 || 
                maze[cellRowIndex][cellColIndex] == 'w') {
                return;
            }

            // check bottom-left corner
            [cellRowIndex, cellColIndex] = getCellRowColIndices(
                player['x'] - player['speed'],
                player['y'] + player['height'],
            );

            // check collide with maze border or wall
            if (cellColIndex < 0 || 
                maze[cellRowIndex][cellColIndex] == 'w') {
                return;
            }

            player['x'] -= player['speed'];
            player['sprite'].attr({'src': player['sprite-paths']['left']});
                        
            break;

        case 'ArrowRight':
            // check top-right corner
            [cellRowIndex, cellColIndex] = getCellRowColIndices(
                player['x'] + player['width'] + player['speed'],
                player['y'],
            );

            // check collide with maze border or wall
            if (cellColIndex >= numColumns || 
                maze[cellRowIndex][cellColIndex] == 'w') {
                return;
            }

            // check bottom-right corner
            [cellRowIndex, cellColIndex] = getCellRowColIndices(
                player['x'] + player['width'] + player['speed'],
                player['y'] + player['height'],
            );

            // check collide with maze border or wall
            if (cellColIndex >= numColumns || 
                maze[cellRowIndex][cellColIndex] == 'w') {
                return;
            }

            player['x'] += player['speed'];
            player['sprite'].attr({'src': player['sprite-paths']['right']});
                        
            break;

        default:
            return; // Quit when this doesn't handle the key event.
    }

    // update player sprite position
    player['sprite'].attr({
        'x': player['x'],
        'y': player['y'],
    });

    // reach end of maze
    if (maze[cellRowIndex][cellColIndex] == 'e') {
        endGame(true);
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}

/**
 * Get the row and column indices of the cell, given the player position.
 * 
 * @param {number} playerX 
 * @param {number} playerY 
 * @returns [rowIndex, colIndex]
 */
function getCellRowColIndices(playerX, playerY) {
    // logic:
    // The index is essentially the number of cells up to that point.
    // Therefore, to get the index, 
    // just divide the row's pixel length by cell width.
    // Same thing for column / height.

    const colIndex = Math.floor(playerX / cellWidth);
    const rowIndex = Math.floor(playerY / cellHeight);

    return [rowIndex, colIndex]
}

////////////////////////////////////////////////////////////////////////////////


// snowball-related functions
////////////////////////////////////////////////////////////////////////////////

function moveSnowball(snowball) {
    if(snowball['moves-vertically']) {
        if(snowball['direction'] == 1 &&
        snowball['y'] == snowball['ending-point']['y']) {
            snowball['direction'] = -1;
        
        } else if(snowball['direction'] == -1 &&
        snowball['y'] == snowball['starting-point']['y']) {
            snowball['direction'] = 1;
        }

        snowball['y'] += (snowball['direction'] * snowball['speed']);

    } else {
        if(snowball['direction'] == 1 &&
        snowball['x'] == snowball['ending-point']['x']) {
            snowball['direction'] = -1;

        } else if(snowball['direction'] == -1 &&
        snowball['x'] == snowball['starting-point']['x']) {
            snowball['direction'] = 1;
        }

        snowball['x'] += (snowball['direction'] * snowball['speed']);
    }

    snowball['sprite'].attr({'cx': snowball['x'], 'cy': snowball['y']});

    // check collision with player
    if(collideCircleRect(snowball, player)) {
        endGame(false);
    }
}

/**
 * Check for collision between a circle and a rectangle 
 * reference: https://stackoverflow.com/a/21096179/9171260 
 * @param {*} circle 
 * @param {*} rect 
 * @returns true if collide, and false otherwise
 */
function collideCircleRect(circle, rect) {
    const distX = Math.abs(circle['x'] - rect['x'] - rect['width']/2);
    const distY = Math.abs(circle['y'] - rect['y'] - rect['height']/2);

    if (distX > (rect['width']/2 + circle.r) || 
    (distY > (rect['height']/2 + circle.r))) { 
        return false;
    }

    if(distX <= (rect['width']/2) && distY <= (rect['height']/2)) {
        console.log(`distX: ${distX}, distY: ${distY}`);
        return true;
    }
    
    const dx = distX - rect['width']/2;
    const dy = distY - rect['height']/2;

    return (dx*dx + dy*dy <= (circle['radius'] * circle['radius']));
}

////////////////////////////////////////////////////////////////////////////////