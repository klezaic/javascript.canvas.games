const pixelPerPiece = 30;
const scoreForRow = 100;
const keyCodes = {
    'Space': 'pause',
    'KeyR': 'restart',
    'ArrowLeft': 'left',
    'ArrowDown': 'down',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
};
function handleKeyPress (event) {
    if(keyCodes[event.code]) {
        input = keyCodes[event.code];
    }
    if(event.code === 'Space') {
        event.preventDefault();
    }
    event.stopPropagation();
}
function init(mainScreenID) {
    window.addEventListener('keydown', handleKeyPress);
    pauseButton = document.getElementById('pause_button');
    pauseButton.addEventListener('click', () => { input = 'pause';});
    restartButton = document.getElementById('restart_button');
    restartButton.addEventListener('click', () => { input = 'restart';});
    leftButton = document.getElementById('left_button');
    leftButton.addEventListener('click', () => { input = 'left';});
    upButton = document.getElementById('up_button');
    upButton.addEventListener('click', () => { input = 'up';});
    downButton = document.getElementById('down_button');
    downButton.addEventListener('click', () => { input = 'down';});
    rightButton = document.getElementById('right_button');
    rightButton.addEventListener('click', () => { input = 'right';});
    nextPieceCanvas = document.getElementById('next_piece_canvas');
    nextPieceCanvas2dContext = nextPieceCanvas.getContext("2d");
    mainScreenCanvas = document.getElementById('main_screen_canvas');
    mainScreenCanvas2dContest = mainScreenCanvas.getContext("2d");

    scoreLabelValue = document.getElementById('score_value');
    rowsLabelValue = document.getElementById('rows_value');
    gameSpeedSlider = document.getElementById('game_speed_slider');
    currentSpeedLabel = document.getElementById('current_speed');
    tickDuration = 200;
    gameSpeedSlider.value = 200;

    initGameElements();

    //console.log("Init done");

    //Start main loop
    main();
}

function initGameElements() {
    toggleElementActiveState(restartButton, false);
    toggleElementActiveState(pauseButton, false);
    toggleElementActiveState(leftButton, false);
    toggleElementActiveState(upButton, false);
    toggleElementActiveState(rightButton, false);
    toggleElementActiveState(downButton, false);

    mainScreenArray = new Array(24).fill(0).map(
        () => new Array(10).fill(0));
    currentPiece = null;
    score = 0;
    rowsTerminated = 0;
    gameRunning = true;
    gameOver = false;
    input = null;
    currentPiece = null;
    pieceRotation = null;
    currentPieceX = null;
    currentPieceY = null;
    nextPiece = null;

    updateUI();
}

var rowsLabelValue;
var scoreLabelValue;
var gameSpeedSlider;
var currentSpeedLabel;
var tickDuration = 200;
var pauseButton;
var restartButton;
var leftButton;
var rightButton;
var upButton;
var downButton;
var nextPieceCanvas;
var nextPieceCanvas2dContext;
var mainScreenCanvas;
var mainScreenCanvas2dContest;
var input;
var currentPiece;
var pieceRotation;
var currentPieceX;
var currentPieceY;
var nextPiece;
var mainScreenArray;
var score;
var rowsTerminated;
var gameRunning;
var gameOver;
function main() {
    handleUserInputs();
    if(gameRunning === true && gameOver === false){
        score++;
        handleGameLogic();
        redraw();
    }
    clearUserInputs();
    updateUI();

    setTimeout(() => {  main(); }, tickDuration);
}

function updateUI() {
    rowsLabelValue.textContent = rowsTerminated;
    scoreLabelValue.textContent = score;
    currentSpeedLabel.textContent = tickDuration;
}

function handleUserInputs() {
    toggleElementActiveState(leftButton, false);
    toggleElementActiveState(rightButton, false);
    toggleElementActiveState(upButton, false);
    toggleElementActiveState(downButton, false);

    if(input === 'pause') {
        if(gameOver === false) {
            if(gameRunning === true) {
                gameRunning = false;
                toggleElementActiveState(pauseButton, true);
            }
            else {
                gameRunning = true;
                toggleElementActiveState(pauseButton, false);
            }
        }
    }
    if(input === 'restart') {
        initGameElements();
    }
    tickDuration = gameSpeedSlider.value;
}

function clearUserInputs() {
    input = null;
}

function handleGameLogic() {
    if(currentPiece === null) {
        //Check for rows to explode
        var fullRows = handleFullRows();
        switch (true) {
            case fullRows === 1:
                score += fullRows*scoreForRow;
                break;
            case fullRows === 2:
                score += fullRows*scoreForRow * 4;
                break;
            case fullRows === 3:
                score += fullRows*scoreForRow * 8;
                break;
            case fullRows === 4:
                score += fullRows*scoreForRow * 16;
                break;
        }
        rowsTerminated += fullRows;


        if(nextPiece === null) {
            generateNextPiece();
        }
        currentPiece = nextPiece;
        pieceRotation = 0;
        currentPieceX = 2;
        currentPieceY = 0;
        generateNextPiece();
    }

    var currentPosition = getPosition(currentPieceX, currentPieceY, pieceRotation);
    var nextPieceX = null;
    if(input === 'up') {
        pieceRotation++;
        toggleElementActiveState(upButton, true);
    }
    if(input === 'left') {
        nextPieceX = currentPieceX - 1;
        toggleElementActiveState(leftButton, true);
    } else if (input === 'right') {
        nextPieceX = currentPieceX + 1;
        toggleElementActiveState(rightButton, true);
    } else {
        nextPieceX = currentPieceX;
    }
    if(input === 'down') {
        forceGravityTicks(currentPosition, nextPieceX);
        toggleElementActiveState(downButton, true);
    }
    else {
        handleGravityTick(currentPosition, nextPieceX, input);
    }
}

function forceGravityTicks(currentPosition) {

    var collisionWithAnotherObject = false;
    do{
        var nextPieceY = currentPieceY + 1;
        var nextPosition = getPosition(currentPieceX, nextPieceY);
        collisionWithAnotherObject = willNextTickBeCollisionWithObject(currentPosition, nextPosition);
        currentPieceY = nextPieceY;
    } while (collisionWithAnotherObject === false);

    //Revert one step back from collision step
    nextPosition = getPosition(currentPieceX, nextPieceY - 1);

    updateMainScreenArray(currentPosition, nextPosition, true);
    currentPiece = null;
}

function handleGravityTick(currentPosition, nextPieceX) {

    var nextPieceY = currentPieceY + 1;
    var nextPosition = getPosition(nextPieceX, nextPieceY);
    var collisionWithWall = willNextTickBeCollisionWithWall(currentPosition, nextPosition);
    if(collisionWithWall === true) {
        nextPieceX = currentPieceX;
        nextPosition = getPosition(nextPieceX, nextPieceY);
    }

    var collisionWithAnotherObject = willNextTickBeCollisionWithObject(currentPosition, nextPosition);

    if(collisionWithAnotherObject === true) {
        updateMainScreenArray(currentPosition, currentPosition, false);
        currentPiece = null;
    } else {
        updateMainScreenArray(currentPosition, nextPosition, true);
    }
    currentPieceX = nextPieceX;
    currentPieceY = nextPieceY;
}

function getPosition(offsetX, offsetY) {
    var piece = availablePieces[currentPiece];
    if(pieceRotation !== 0) {
        if(currentPiece !== null) {
            var rotation = (pieceRotation)%piecesRotationsAllowed[currentPiece];
            pieceRotation = rotation;
            //console.log(rotation);
            for(var r = 0; r < rotation; r++) {
                piece = rotateMatrix(piece);
            }
        }
    }

    var pieceCoords = [];
    for (var x = 0; x < 4; x++) {
        for (var y = 0; y < 4; y++) {
            if(piece[x][y] !== 0) {
                pieceCoords.push({'x': offsetX+x, 'y': offsetY+y});
            }
        }
    }
    return pieceCoords;
}

function willNextTickBeCollisionWithWall(currentPosition, nextPosition) {
    var collision = false;
    nextPosition.forEach((coord) => {
        if(coord.x < 0 || coord.x > 9) {
            collision = true;
        }
    });
    return collision;
}

function willNextTickBeCollisionWithObject(currentPosition, nextPosition) {
    //JS uses equal to pass by reference, slice will get us a copy
    var mainScreenArrayCopy = mainScreenArray.slice();

    //remove the old piece
    currentPosition.forEach(
        (coord) => {
            mainScreenArrayCopy[coord.y][coord.x] = 0;
        });

    var collision = false;
    //Check if piece already occupies slot
    nextPosition.forEach((coord) => {
        if(coord.y > 23) {
            collision = true;
        }
        else {
            if(mainScreenArrayCopy[coord.y][coord.x] !== 0) {
                collision = true;
            }
        }
    });

    //Check for game over
    if(collision) {
        for(var x = 0; x < 10; x ++) {
            if(mainScreenArrayCopy[5][x] !== 0) {
                triggerGameOver();
            }
        }
    }

    return collision;
}

function updateMainScreenArray(currentPosition, nextPosition, removeCurrent) {
    if(removeCurrent === true) {
        currentPosition.forEach((coord) => {
            if(coord.x < 0 || coord.x > 9 || coord.y < 0 || coord.y > 23) return;
            mainScreenArray[coord.y][coord.x] = 0;
        });
    }
    nextPosition.forEach((coord) => {
        if(coord.x < 0 || coord.x > 9 || coord.y < 0 || coord.y > 23) return;
        mainScreenArray[coord.y][coord.x] = currentPiece;
    });
}

function handleFullRows() {
    var fullRowIndexList = [];
    for(var y = 0; y < 24; y++) {
        var rowIsFull = true;
        for(var x = 0; x < 10; x ++) {
            if(mainScreenArray[y][x] === 0) {
                rowIsFull = false;
            }
        }
        if(rowIsFull === true) {
            fullRowIndexList.push(y);
        }
    }

    fullRowIndexList.forEach((rowIndex) => {
        //console.log("ShoudRemoveRow" + rowIndex)
        //console.log(mainScreenArray);
        var mainScreenArrayCopy = mainScreenArray.slice();
        for(var y = 23; y >= 0; y--) {
            if(y > rowIndex) {
                mainScreenArrayCopy[y] = mainScreenArray[y].slice();
            }
            if(y <= rowIndex && y > 0) {
                mainScreenArrayCopy[y] = mainScreenArray[y-1].slice();
            }
        }
        mainScreenArrayCopy[0] = new Array(10).fill(0);
        mainScreenArray = mainScreenArrayCopy;
        //console.log("NewState");
        //console.log(mainScreenArray);
    });

    return fullRowIndexList.length;
}


function redraw() {
    redrawNextPiece();
    redrawMainScreen();
}

function redrawNextPiece() {
    clearNextPieceScreen();
    var pieceToDraw = availablePieces[nextPiece];
    for (var x = 0; x < nextPieceCanvas.width/pixelPerPiece; x++) {
        for (var y = 0; y < nextPieceCanvas.height/pixelPerPiece; y++) {
            if(pieceToDraw[y][x] !== 0) {
                nextPieceCanvas2dContext.fillStyle = 'lawngreen';
                nextPieceCanvas2dContext.fillRect(x*pixelPerPiece,y*pixelPerPiece, pixelPerPiece, pixelPerPiece);
                nextPieceCanvas2dContext.strokeRect(x*pixelPerPiece,y*pixelPerPiece, pixelPerPiece, pixelPerPiece);
            }
        }
    }
}


function redrawMainScreen() {
    clearMainScreen();
    for (var x = 0; x < mainScreenCanvas.width/pixelPerPiece; x++) {
        for (var y = 0; y < mainScreenCanvas.height/pixelPerPiece; y++) {
            if(mainScreenArray[y][x] !== 0) {
                mainScreenCanvas2dContest.fillStyle = 'lawngreen';
                mainScreenCanvas2dContest.fillRect(x*pixelPerPiece,y*pixelPerPiece, pixelPerPiece, pixelPerPiece);
                mainScreenCanvas2dContest.strokeRect(x*pixelPerPiece,y*pixelPerPiece, pixelPerPiece, pixelPerPiece);
            }
        }
    }
}

function triggerGameOver() {
    gameRunning = false;
    gameOver = true;

    //Do Fun!
    toggleElementActiveState(restartButton, true)
}

function clearNextPieceScreen() {
    nextPieceCanvas2dContext.fillStyle = 'black';
    nextPieceCanvas2dContext.clearRect(0,0,nextPieceCanvas.width, nextPieceCanvas.height);
}

function clearMainScreen() {
    mainScreenCanvas2dContest.fillStyle = 'black';
    mainScreenCanvas2dContest.clearRect(0, 0, mainScreenCanvas.width, mainScreenCanvas.height);

    //Draw game over line
    mainScreenCanvas2dContest.fillStyle = 'lawngreen';
    mainScreenCanvas2dContest.fillRect(0,5*pixelPerPiece,
        10*pixelPerPiece, 2);


}


var piecesRotationsAllowed = {
    'T': 4,
    'I': 2,
    'Z': 2,
    'S': 2,
    'C': 1,
    'L': 4,
    'J': 4
};

var availablePieces = {
    'T': [[0,  0,  0,  0],
          [0,  0,  0,  0],
          [0,'T','T','T'],
          [0,  0,'T',  0]],
    'I': [[0,  0,  0,'I'],
          [0,  0,  0,'I'],
          [0,  0,  0,'I'],
          [0,  0,  0,'I']],
    'Z': [[0,  0,  0,  0],
          [0,  0,  0,  0],
          [0,'Z', 'Z', 0],
          [0,  0, 'Z','Z']],
    'S': [[0,  0,  0,  0],
          [0,  0,  0,  0],
          [0,  0, 'S', 'S'],
          [0,'S', 'S', 0]],
    'C': [[0,  0,  0,  0],
          [0,  0,  0,  0],
          [0,  0, 'C', 'C'],
          [0,  0, 'C', 'C']],
    'L': [[0,  0,  0,  0],
          [0,  0,'L',  0],
          [0,  0,'L',  0],
          [0,  0,'L','L']],
    'J': [[0,  0,  0,  0],
          [0,  0,  0,'J'],
          [0,  0,  0,'J'],
          [0,  0,'J','J']],
};

function generateNextPiece() {
    var pieces = Object.keys(availablePieces);
    var randomPiece = Math.floor(Math.random() * pieces.length);
    nextPiece = pieces[randomPiece];
}


function rotateMatrix(matrix) {
    return matrix[0].map((val, index) => matrix.map(row => row[index]).reverse());
}

function toggleElementActiveState(element, state) {
    if (state === true){
        element.classList.add("active");
    }
    if(state === false) {
        if(element.classList.contains("active")) {
            element.classList.remove("active");
        }
    }
}