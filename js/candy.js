//DONG KI, SIN & Harry - Candy Crush Game
document.addEventListener("DOMContentLoaded", function () {
    // Initialize the game
    createBoard();
    board = initializeBoard();
    get_ready();
    show();
    setupControls();
});

// Audio setup
var audio = new Audio("/mp3/Puzzle.mp3");
var bomb_audio = new Audio("/mp3/bomb.mp3");
var swap_audio = new Audio("/mp3/swap.mp3");
var drop_audio = new Audio("/mp3/drop.mp3");
var big_audio = new Audio("/mp3/bigBomb.mp3");
drop_audio.volume = 0;
swap_audio.volume = 0;
bomb_audio.volume = 0;
big_audio.volume = 0;

// Game constants
const ROWS = 10;
const COLS = 5;
const suits = {
    1: "🍬",
    2: "🍭",
    3: "🍩",
    4: "🍫",
    5: "🍒",
    6: "🍉",
    7: "💣",
    8: "🧨",
    9: "🎆",
};

// Score system
let score = 0;
let combo = 0;
let hint_num = 3;
let board;
let selectedButton = null;
let timer;
let ready_flag = false;

// Score points
const POINTS = {
    MATCH_3: 100,
    MATCH_4: 200,
    MATCH_5: 500,
    BOMB: 300,
    COMBO_MULTIPLIER: 1.5
};

// Create game board dynamically
function createBoard() {
    const gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = "";
    
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const button = document.createElement("button");
            button.type = "button";
            button.id = `button-${i}-${j}`;
            button.className = "candy-btn";
            button.dataset.row = i;
            button.dataset.col = j;
            button.addEventListener("click", () => handleClick(button));
            gameBoard.appendChild(button);
        }
    }
}

// Setup control buttons
function setupControls() {
    document.getElementById("sound-on").addEventListener("click", () => {
        audio.play();
        audio.loop = true;
        big_audio.volume = 1;
        swap_audio.volume = 1;
        bomb_audio.volume = 1;
        drop_audio.volume = 1;
    });
    
    document.getElementById("sound-off").addEventListener("click", () => {
        audio.pause();
        big_audio.volume = 0;
        drop_audio.volume = 0;
        swap_audio.volume = 0;
        bomb_audio.volume = 0;
        audio.currentTime = 0;
    });
    
    document.getElementById("hint-btn").addEventListener("click", () => {
        if (hint_num > 0) {
            hint_num--;
            document.getElementById("hint-count").textContent = hint_num;
            let hint = check_gameover();
            hint_delay(hint);
            
            if (hint_num === 0) {
                document.getElementById("hint-btn").disabled = true;
            }
        }
    });
}

// Initialize board
function initializeBoard() {
    const newBoard = [];
    for (let i = 0; i < ROWS; i++) {
        const row = Array.from({ length: COLS }, () => getRandomSuit());
        newBoard.push(row);
    }
    return newBoard;
}

// Get a random suit
function getRandomSuit() {
    const randomSuitIndex = Math.floor(Math.random() * 6) + 1;
    return suits[randomSuitIndex];
}

// Show board
function show() {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const buttonId = `button-${i}-${j}`;
            const myButton = document.getElementById(buttonId);
            if (myButton) {
                myButton.textContent = board[i][j];
            }
        }
    }
}

// Update score display
function updateScore(points) {
    const comboMultiplier = combo > 1 ? Math.pow(POINTS.COMBO_MULTIPLIER, combo - 1) : 1;
    const earnedPoints = Math.floor(points * comboMultiplier);
    score += earnedPoints;
    
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = score.toLocaleString();
    scoreElement.classList.add("pop");
    setTimeout(() => scoreElement.classList.remove("pop"), 300);
}

// Calculate match score
function calculateMatchScore(matchSize) {
    if (matchSize >= 5) return POINTS.MATCH_5;
    if (matchSize >= 4) return POINTS.MATCH_4;
    return POINTS.MATCH_3;
}

// Swap values
function swapValues(selectedRow, selectedCol, clickedRow, clickedCol) {
    const temp = board[selectedRow][selectedCol];
    board[selectedRow][selectedCol] = board[clickedRow][clickedCol];
    board[clickedRow][clickedCol] = temp;
}

// Check if two cards are adjacent
function areAdjacent(row1, col1, row2, col2) {
    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
}

async function handleClick(button) {
    clearTimeout(timer);
    var stopFunc = function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    if (selectedButton === null) {
        selectedButton = button;
        let selectedRow = parseInt(selectedButton.getAttribute("data-row"));
        let selectedCol = parseInt(selectedButton.getAttribute("data-col"));
        
        // Small bomb (🧨)
        if (board[selectedRow][selectedCol] === suits[8]) {
            let crush_set = small_bomb(selectedRow, selectedCol, new Set());
            let small_bomb_flag = true;
            disableClicks(stopFunc);
            
            while (crush_set.size > 0) {
                for (let i = 0; i < 2; i++) {
                    setMatchingState(crush_set, true);
                    await sleep(300);
                    setMatchingState(crush_set, false);
                    await sleep(300);
                }
                setMatchingState(crush_set, true);
                
                // Score for bomb
                combo++;
                updateScore(POINTS.BOMB + (crush_set.size * 10));
                
                crush(crush_set);
                if (small_bomb_flag) {
                    big_audio.play();
                    small_bomb_flag = false;
                } else {
                    bomb_audio.play();
                }
                show();
                await sleep(500);
                setMatchingState(crush_set, false);
                await new_drop();
                show();
                crush_set = re_expand();
            }
            combo = 0;
            selectedButton = null;
            button.classList.remove("selected");
            enableClicks(stopFunc);
            return;
        }
        
        // Big bomb (💣)
        if (board[selectedRow][selectedCol] === suits[7]) {
            disableClicks(stopFunc);
            let crush_set = bomb(selectedRow, selectedCol, new Set());
            let big_bomb = true;
            
            while (crush_set.size > 0) {
                for (let i = 0; i < 2; i++) {
                    setMatchingState(crush_set, true);
                    await sleep(300);
                    setMatchingState(crush_set, false);
                    await sleep(300);
                }
                setMatchingState(crush_set, true);
                
                // Score for bomb
                combo++;
                updateScore(POINTS.BOMB * 2 + (crush_set.size * 10));
                
                crush(crush_set);
                if (big_bomb) {
                    big_audio.play();
                    big_bomb = false;
                } else {
                    bomb_audio.play();
                }
                show();
                await sleep(500);
                setMatchingState(crush_set, false);
                await new_drop();
                show();
                crush_set = re_expand();
            }
            combo = 0;
            selectedButton = null;
            button.classList.remove("selected");
            enableClicks(stopFunc);
            return;
        }
        
        button.classList.add("selected");
    } else {
        const selectedRow = parseInt(selectedButton.getAttribute("data-row"));
        const selectedCol = parseInt(selectedButton.getAttribute("data-col"));
        const clickedRow = parseInt(button.getAttribute("data-row"));
        const clickedCol = parseInt(button.getAttribute("data-col"));
        selectedButton.classList.remove("selected");
        const prevSelected = selectedButton;
        selectedButton = null;
        
        if (areAdjacent(selectedRow, selectedCol, clickedRow, clickedCol)) {
            swapValues(selectedRow, selectedCol, clickedRow, clickedCol);
            let crush_set = new Set();
            let first = expand(selectedRow, selectedCol);
            let second = expand(clickedRow, clickedCol);
            
            if (first.size === 0 && second.size === 0) {
                swapValues(selectedRow, selectedCol, clickedRow, clickedCol);
                return;
            }
            
            if (swap_audio.volume != 0) {
                swap_audio.play();
            }
            show();
            disableClicks(stopFunc);
            await sleep(500);

            if (first) {
                first.forEach((item) => {
                    crush_set.add(item);
                });
            }
            if (second) {
                second.forEach((item) => {
                    crush_set.add(item);
                });
            }
            
            while (crush_set.size > 0) {
                for (let i = 0; i < 2; i++) {
                    setMatchingState(crush_set, true);
                    await sleep(300);
                    setMatchingState(crush_set, false);
                    await sleep(300);
                }
                setMatchingState(crush_set, true);
                
                // Calculate and update score
                combo++;
                const matchScore = calculateMatchScore(crush_set.size);
                updateScore(matchScore);
                
                crush(crush_set);
                bomb_audio.play();
                show();
                await sleep(500);
                setMatchingState(crush_set, false);
                await new_drop();
                show();
                crush_set = re_expand();
            }
            
            combo = 0;
            let hint = check_gameover();
            if (hint.size === 0) {
                alert("Game Over! Final Score: " + score.toLocaleString());
            }
            enableClicks(stopFunc);
            await startTimer(hint);
        }
    }
}

// Helper functions for click handling
function disableClicks(stopFunc) {
    document.querySelectorAll("*").forEach((el) => {
        if (el.addEventListener) {
            el.addEventListener("click", stopFunc, true);
        }
    });
}

function enableClicks(stopFunc) {
    document.querySelectorAll("*").forEach((el) => {
        if (el.removeEventListener) {
            el.removeEventListener("click", stopFunc, true);
        }
    });
}

// Set matching animation state
function setMatchingState(crushSet, isMatching) {
    crushSet.forEach((coordinate) => {
        const [r, c] = coordinate.split("-").map(Number);
        const buttonId = `button-${r}-${c}`;
        const myButton = document.getElementById(buttonId);
        if (myButton) {
            if (isMatching) {
                myButton.classList.add("matching");
            } else {
                myButton.classList.remove("matching");
            }
        }
    });
}

async function hint_delay(hint) {
    let hint_array = give_hint(hint);
    if (!hint_array) return;
    
    for (let i = 0; i < 3; i++) {
        setHintState(hint_array, true);
        await sleep(400);
        setHintState(hint_array, false);
        await sleep(400);
    }
}

function setHintState(hint_array, isHint) {
    hint_array.forEach((coordinate) => {
        const [row, col] = coordinate.split("-").map(Number);
        const buttonId = `button-${row}-${col}`;
        const myButton = document.getElementById(buttonId);
        if (myButton) {
            if (isHint) {
                myButton.classList.add("hint");
            } else {
                myButton.classList.remove("hint");
            }
        }
    });
}

async function startTimer(hint) {
    timer = setTimeout(function () {
        hint_delay(hint);
    }, 15000);
}

function give_hint(hint) {
    const hint_array = Array.from(hint);
    if (hint_array.length === 0) return null;
    const randomSuitIndex = Math.floor(Math.random() * hint_array.length);
    return hint_array[randomSuitIndex];
}

function small_bomb(dr, dc, crush_set) {
    if (crush_set.has(`${dr}-${dc}`)) {
        return crush_set;
    }
    crush_set.add(`${dr}-${dc}`);
    
    const directions = [
        [1, 1], [1, -1], [-1, -1], [-1, 1],
        [1, 0], [-1, 0], [0, 1], [0, -1]
    ];
    
    directions.forEach(([dRow, dCol]) => {
        const newRow = dr + dRow;
        const newCol = dc + dCol;
        if (newRow >= 0 && newRow < board.length && 
            newCol >= 0 && newCol < board[0].length &&
            !crush_set.has(`${newRow}-${newCol}`)) {
            if (board[newRow][newCol] === suits[8]) {
                small_bomb(newRow, newCol, crush_set);
            }
            if (board[newRow][newCol] === suits[7]) {
                let big_bomb_set = bomb(newRow, newCol, crush_set);
                big_bomb_set.forEach((item) => crush_set.add(item));
            }
            crush_set.add(`${newRow}-${newCol}`);
        }
    });
    
    return crush_set;
}

function bomb(dr, dc, crush_set) {
    if (crush_set.has(`${dr}-${dc}`)) {
        return crush_set;
    }
    crush_set.add(`${dr}-${dc}`);
    
    // Vertical line
    for (let r = 0; r < board.length; r++) {
        if (board[r][dc] === suits[7] && !crush_set.has(`${r}-${dc}`)) {
            bomb(r, dc, crush_set);
        }
        if (board[r][dc] === suits[8] && !crush_set.has(`${r}-${dc}`)) {
            let sm_bomb = small_bomb(r, dc, crush_set);
            sm_bomb.forEach((item) => crush_set.add(item));
        }
        crush_set.add(`${r}-${dc}`);
    }

    // Horizontal line
    for (let c = 0; c < board[0].length; c++) {
        if (board[dr][c] === suits[7] && !crush_set.has(`${dr}-${c}`)) {
            bomb(dr, c, crush_set);
        }
        if (board[dr][c] === suits[8] && !crush_set.has(`${dr}-${c}`)) {
            let sm_bomb = small_bomb(dr, c, crush_set);
            sm_bomb.forEach((item) => crush_set.add(item));
        }
        crush_set.add(`${dr}-${c}`);
    }
    return crush_set;
}

function expand(r, c) {
    let left = c;
    let right = c;
    let up = r;
    let down = r;
    const upDown = new Set();
    const leftRight = new Set();
    const crush = new Set();
    let upDownFlag = false;
    let leftRightFlag = false;
    
    if (board[r][c] !== suits[7] && board[r][c] !== suits[8]) {
        upDown.add(`${up}-${c}`);
        leftRight.add(`${r}-${right}`);
        
        while (up + 1 < board.length && board[up][c] === board[up + 1][c]) {
            upDown.add(`${up + 1}-${c}`);
            up++;
        }
        while (down - 1 >= 0 && board[down][c] === board[down - 1][c]) {
            upDown.add(`${down - 1}-${c}`);
            down--;
        }
        while (right + 1 < board[0].length && board[r][right] === board[r][right + 1]) {
            leftRight.add(`${r}-${right + 1}`);
            right++;
        }
        while (left - 1 >= 0 && board[r][left] === board[r][left - 1]) {
            leftRight.add(`${r}-${left - 1}`);
            left--;
        }

        if (upDown.size >= 3) upDownFlag = true;
        if (leftRight.size >= 3) leftRightFlag = true;

        if (upDownFlag) upDown.forEach((item) => crush.add(item));
        if (leftRightFlag) leftRight.forEach((item) => crush.add(item));
    }
    return crush;
}

function re_expand() {
    const crushSet = new Set();
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[0].length; c++) {
            const upDown = new Set();
            const leftRight = new Set();
            let left = c;
            let right = c;
            let up = r;
            let down = r;
            let upDownFlag = false;
            let leftRightFlag = false;
            upDown.add(`${up}-${c}`);
            leftRight.add(`${r}-${right}`);
            
            if (board[r][c] !== suits[7] && board[r][c] !== suits[8]) {
                while (up + 1 < board.length && board[up][c] === board[up + 1][c]) {
                    upDown.add(`${up + 1}-${c}`);
                    up++;
                }
                while (down - 1 >= 0 && board[down][c] === board[down - 1][c]) {
                    upDown.add(`${down - 1}-${c}`);
                    down--;
                }
                while (right + 1 < board[0].length && board[r][right] === board[r][right + 1]) {
                    leftRight.add(`${r}-${right + 1}`);
                    right++;
                }
                while (left - 1 >= 0 && board[r][left] === board[r][left - 1]) {
                    leftRight.add(`${r}-${left - 1}`);
                    left--;
                }

                if (upDown.size >= 3) upDownFlag = true;
                if (leftRight.size >= 3) leftRightFlag = true;

                if (upDownFlag) upDown.forEach((item) => crushSet.add(item));
                if (leftRightFlag) leftRight.forEach((item) => crushSet.add(item));
            }
        }
    }
    return crushSet;
}

async function crush(crushSet) {
    crushSet.forEach((coordinate) => {
        const [r, c] = coordinate.split("-").map(Number);
        board[r][c] = suits[9];
    });
}

async function new_drop() {
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[0].length; c++) {
            if (board[r][c] === suits[9]) {
                board[r][c] = "";
            }
        }
    }

    show();
    if (ready_flag) {
        await sleep(400);
    }
    
    for (let r = 0; r < board.length; r++) {
        let drop = false;
        for (let c = 0; c < board[0].length; c++) {
            if (board[r][c] === "") {
                drop = true;
                let row = r;
                while (row - 1 >= 0) {
                    board[row][c] = board[--row][c];
                }
                const random_number = Math.floor(Math.random() * 6) + 1;
                const special_bomb_number_random = Math.floor(Math.random() * 10) + 1;
                const special_bomb_number_random_match = Math.floor(Math.random() * 4) + 1;
                
                if (special_bomb_number_random === 7 && special_bomb_number_random_match === 1) {
                    board[0][c] = suits[7];
                } else if (special_bomb_number_random === 8 && special_bomb_number_random_match === 1) {
                    board[0][c] = suits[8];
                } else {
                    board[0][c] = suits[random_number];
                }
            }
        }
        if (drop) {
            show();
            if (drop_audio.volume != 0) {
                drop_audio.play();
            }
            if (ready_flag) {
                await sleep(400);
            }
        }
    }
}

function check_gameover() {
    const bomb_set = new Set();
    const pairs = new Set();

    function checkPattern(...cells) {
        const isSame = cells.every(
            ([r, c]) => board[r][c] === board[cells[0][0]][cells[0][1]]
        );
        return isSame ? cells : null;
    }

    function checkPairs(...cells) {
        const pair = checkPattern(...cells);
        if (pair) {
            pairs.add(pair.map(([r, c]) => `${r}-${c}`));
        }
    }

    function checkBomb(...cells) {
        const bomb = checkPattern(...cells);
        if (bomb) {
            bomb_set.add(bomb.map(([r, c]) => `${r}-${c}`));
        }
    }

    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[0].length; c++) {
            if (board[r][c] === suits[7] || board[r][c] === suits[8]) {
                checkBomb([r, c]);
            } else {
                if (c >= 2 && c < board[0].length - 1) {
                    checkPairs([r, c - 2], [r, c], [r, c + 1]);
                }
                if (c < board[0].length - 3) {
                    checkPairs([r, c], [r, c + 1], [r, c + 3]);
                }
                if (r >= 2 && r < board.length - 1) {
                    checkPairs([r - 2, c], [r, c], [r + 1, c]);
                }
                if (r < board.length - 3) {
                    checkPairs([r, c], [r + 1, c], [r + 3, c]);
                }
                if (r >= 1 && c < board[0].length - 1 && c >= 1) {
                    checkPairs([r, c], [r - 1, c - 1], [r - 1, c + 1]);
                }
                if (r >= 1 && c < board[0].length - 1 && r < board.length - 1) {
                    checkPairs([r, c], [r - 1, c + 1], [r + 1, c + 1]);
                }
                if (c < board[0].length - 1 && r < board.length - 1 && c >= 1) {
                    checkPairs([r, c], [r + 1, c + 1], [r + 1, c - 1]);
                }
                if (c >= 1 && r >= 1 && r < board.length - 1) {
                    checkPairs([r, c], [r + 1, c - 1], [r - 1, c - 1]);
                }
                if (r < board.length - 1 && c < board[0].length - 2) {
                    checkPairs([r, c], [r, c + 1], [r + 1, c + 2]);
                }
                if (r >= 1 && c < board[0].length - 2) {
                    checkPairs([r, c], [r, c + 1], [r - 1, c + 2]);
                }
                if (r < board.length - 1 && c >= 1 && c < board[0].length - 1) {
                    checkPairs([r + 1, c - 1], [r, c], [r, c + 1]);
                }
                if (r >= 1 && c >= 1 && c < board[0].length - 1) {
                    checkPairs([r - 1, c - 1], [r, c], [r, c + 1]);
                }
                if (c < board[0].length - 1 && r < board.length - 2) {
                    checkPairs([r, c], [r + 1, c], [r + 2, c + 1]);
                }
                if (c >= 1 && r < board.length - 2) {
                    checkPairs([r, c], [r + 1, c], [r + 2, c - 1]);
                }
                if (r >= 1 && c >= 1 && r < board.length - 1) {
                    checkPairs([r - 1, c - 1], [r, c], [r + 1, c]);
                }
                if (r >= 1 && c < board[0].length - 1 && r < board.length - 1) {
                    checkPairs([r - 1, c + 1], [r, c], [r + 1, c]);
                }
            }
        }
    }

    return pairs.size === 0 ? bomb_set : pairs;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function get_ready() {
    let ready = re_expand();
    while (ready.size > 0) {
        crush(ready);
        await new_drop();
        ready = re_expand();
    }
    ready_flag = true;
}
