//DONG KI, SIN & Harry
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the board
  board = initializeBoard();
  get_ready();
  show();

  // Defer attaching event listeners
  setTimeout(() => {
      const buttons = document.querySelectorAll("input[type='button']");
      buttons.forEach((button) => {
          button.addEventListener("click", () => handleClick(button));
      });
  }, 0);
});


var audio = new Audio("mp3/Puzzle.mp3");
var bomb_audio = new Audio("mp3/bomb.mp3");
var swap_audio = new Audio("mp3/swap.mp3");
var drop_audio = new Audio("mp3/drop.mp3");
var big_audio = new Audio("mp3/bigBomb.mp3");
drop_audio.volume = 0;
swap_audio.volume = 0;
bomb_audio.volume = 0;
big_audio.volume = 0;

// Board
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

// Initialize board
function initializeBoard() {
    const newBoard = [];
    for (let i = 0; i < 10; i++) {
        const row = Array.from({ length: 5 }, () => getRandomSuit());
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
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 5; j++) {
            const buttonId = `button-${i}-${j}`;
            const myButton = document.getElementById(buttonId);
            myButton.value = board[i][j];
        }
    }
}

// Select
let selectedButton = null;

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

let hint_num = 3;

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
        if (board[selectedRow][selectedCol] === suits[8]) {
            let crush_set = small_bomb(selectedRow, selectedCol, new Set());
            let small_bomb_flag = true;
            var all = document.querySelectorAll("*");
            for (var idx in all) {
                var el = all[idx];
                if (el.addEventListener) {
                    el.addEventListener("click", stopFunc, true);
                }
            }
            while (crush_set.size > 0) {
                for (let i = 0; i < 2; i++) {
                    red(crush_set);
                    await sleep(300);
                    unred(crush_set);
                    await sleep(300);
                }
                red(crush_set);
                crush(crush_set);
                if (small_bomb_flag) {
                    big_audio.play();
                    small_bomb_flag = false;
                } else {
                    bomb_audio.play();
                }
                show();
                await sleep(500);
                unred(crush_set);
                await new_drop();
                show();
                crush_set = re_expand();
            }
            selectedButton = null;
            button.style.backgroundColor = "";
            var all = document.querySelectorAll("*");
            for (var idx in all) {
                var el = all[idx];
                if (el.removeEventListener) {
                    el.removeEventListener("click", stopFunc, true);
                }
            }
            return;
        }
        if (board[selectedRow][selectedCol] === suits[7]) {
            var all = document.querySelectorAll("*");
            for (var idx in all) {
                var el = all[idx];
                if (el.addEventListener) {
                    el.addEventListener("click", stopFunc, true);
                }
            }
            let crush_set = bomb(selectedRow, selectedCol, new Set());
            let big_bomb = true;
            while (crush_set.size > 0) {
                for (let i = 0; i < 2; i++) {
                    red(crush_set);
                    await sleep(300);
                    unred(crush_set);
                    await sleep(300);
                }
                red(crush_set);
                crush(crush_set);
                if (big_bomb) {
                    big_audio.play();
                    big_bomb = false;
                } else {
                    bomb_audio.play();
                }
                show();
                await sleep(500);
                unred(crush_set);
                await new_drop();
                show();
                crush_set = re_expand();
            }
            selectedButton = null;
            button.style.backgroundColor = "";
            var all = document.querySelectorAll("*");
            for (var idx in all) {
                var el = all[idx];
                if (el.removeEventListener) {
                    el.removeEventListener("click", stopFunc, true);
                }
            }
            return;
        }
        if (selectedRow === 9 && selectedCol === 5) {
            if (hint_num > 0) {
                hint_num--;
                const element = document.getElementById("button-9-5");
                element.value = hint_num;
                let hint = check_gameover();
                await hint_delay(hint);
                selectedButton = null;
                button.style.backgroundColor = "";
                return;
            } else {
                selectedButton = null;
                button.style.backgroundColor = "";
                return;
            }
        }
        if (selectedRow === 7 && selectedCol === 5) {
            audio.play();
            audio.loop = true;
            big_audio.volume = 1;
            swap_audio.volume = 1;
            bomb_audio.volume = 1;
            drop_audio.volume = 1;
            selectedButton = null;
            button.style.backgroundColor = "";
            return;
        }
        if (selectedRow === 8 && selectedCol === 5) {
            audio.pause();
            big_audio.volume = 0;
            drop_audio.volume = 0;
            swap_audio.volume = 0;
            bomb_audio.volume = 0;
            audio.currentTime = 0;
            selectedButton = null;
            button.style.backgroundColor = "";
            return;
        }
        button.style.backgroundColor = "lightblue";
    } else {
        const selectedRow = parseInt(selectedButton.getAttribute("data-row"));
        const selectedCol = parseInt(selectedButton.getAttribute("data-col"));
        const clickedRow = parseInt(button.getAttribute("data-row"));
        const clickedCol = parseInt(button.getAttribute("data-col"));
        selectedButton.style.backgroundColor = "";
        selectedButton = null;
        if (areAdjacent(selectedRow, selectedCol, clickedRow, clickedCol)) {
            swapValues(selectedRow, selectedCol, clickedRow, clickedCol);
            let crush_set = new Set();
            let first = expand(selectedRow, selectedCol);
            let second = expand(clickedRow, clickedCol);
            if (first.size === 0 && second.size === 0) {
                swapValues(selectedRow, selectedCol, clickedRow, clickedCol);
                selectedButton.style.backgroundColor = "";
                selectedButton = null;
                return;
            }
            if (swap_audio.volume != 0) {
                swap_audio.play();
            }
            show();
            var all = document.querySelectorAll("*");
            for (var idx in all) {
                var el = all[idx];
                if (el.addEventListener) {
                    el.addEventListener("click", stopFunc, true);
                }
            }
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
                    red(crush_set);
                    await sleep(300);
                    unred(crush_set);
                    await sleep(300);
                }
                red(crush_set);
                crush(crush_set);
                bomb_audio.play();
                show();
                await sleep(500);
                unred(crush_set);
                await new_drop();
                show();
                crush_set = re_expand();
            }
            let hint = check_gameover();
            if (hint.size === 0) {
                alert("Game Over");
            }
            var all = document.querySelectorAll("*");
            for (var idx in all) {
                var el = all[idx];
                if (el.removeEventListener) {
                    el.removeEventListener("click", stopFunc, true);
                }
            }
            await startTimer(hint);
        }
    }
}

async function hint_delay(hint) {
    let hint_array = give_hint(hint);
    for (let i = 0; i < 3; i++) {
        hint_blue(hint_array);
        await sleep(400);
        hint_unblue(hint_array);
        await sleep(400);
    }
}

let timer;
async function startTimer(hint) {
    timer = setTimeout(function () {
        hint_delay(hint);
    }, 15000);
}

function give_hint(hint) {
    const hint_array = Array.from(hint);
    const randomSuitIndex = Math.floor(Math.random() * hint_array.length);
    console.log(randomSuitIndex);
    console.log(hint_array[randomSuitIndex]);
    return hint_array[randomSuitIndex];
}

function hint_blue(hint_array) {
    hint_array.forEach((coordinate) => {
        const [row, col] = coordinate.split("-").map(Number);
        const buttonId = `button-${row}-${col}`;
        const myButton = document.getElementById(buttonId);
        myButton.style.backgroundColor = "lightblue";
    });
}

function hint_unblue(hint_array) {
    hint_array.forEach((coordinate) => {
        const [row, col] = coordinate.split("-").map(Number);
        const buttonId = `button-${row}-${col}`;
        const myButton = document.getElementById(buttonId);
        myButton.style.backgroundColor = "";
    });
}

function small_bomb(dr, dc, crush_set) {
    if (crush_set.has(`${dr}-${dc}`)) {
        return crush_set;
    }
    crush_set.add(`${dr}-${dc}`);
    if (
        dr + 1 < board.length &&
        dc + 1 < board[0].length &&
        !crush_set.has(`${dr + 1}-${dc + 1}`)
    ) {
        if (board[dr + 1][dc + 1] === suits[8]) {
            small_bomb(dr + 1, dc + 1, crush_set);
        }
        if (board[dr + 1][dc + 1] === suits[7]) {
            let big_bomb = bomb(dr + 1, dc + 1, crush_set);
            big_bomb.forEach((item) => {
                crush_set.add(item);
            });
        }
        crush_set.add(`${dr + 1}-${dc + 1}`);
    }
    if (
        dr + 1 < board.length &&
        dc - 1 >= 0 &&
        !crush_set.has(`${dr + 1}-${dc - 1}`)
    ) {
        if (board[dr + 1][dc - 1] === suits[8]) {
            small_bomb(dr + 1, dc - 1, crush_set);
        }
        if (board[dr + 1][dc - 1] === suits[7]) {
            let big_bomb = bomb(dr + 1, dc - 1, crush_set);
            big_bomb.forEach((item) => {
                crush_set.add(item);
            });
        }
        crush_set.add(`${dr + 1}-${dc - 1}`);
    }
    if (dr - 1 >= 0 && dc - 1 >= 0 && !crush_set.has(`${dr - 1}-${dc - 1}`)) {
        if (board[dr - 1][dc - 1] === suits[8]) {
            small_bomb(dr - 1, dc - 1, crush_set);
        }
        if (board[dr - 1][dc - 1] === suits[7]) {
            let big_bomb = bomb(dr - 1, dc - 1, crush_set);
            big_bomb.forEach((item) => {
                crush_set.add(item);
            });
        }
        crush_set.add(`${dr - 1}-${dc - 1}`);
    }
    if (
        dr - 1 >= 0 &&
        dc + 1 < board[0].length &&
        !crush_set.has(`${dr - 1}-${dc + 1}`)
    ) {
        if (board[dr - 1][dc + 1] === suits[8]) {
            small_bomb(dr - 1, dc + 1, crush_set);
        }
        if (board[dr - 1][dc + 1] === suits[7]) {
            let big_bomb = bomb(dr - 1, dc + 1, crush_set);
            big_bomb.forEach((item) => {
                crush_set.add(item);
            });
        }
        crush_set.add(`${dr - 1}-${dc + 1}`);
    }
    if (dr + 1 < board.length && !crush_set.has(`${dr + 1}-${dc}`)) {
        if (board[dr + 1][dc] === suits[8]) {
            small_bomb(dr + 1, dc, crush_set);
        }
        if (board[dr + 1][dc] === suits[7]) {
            let big_bomb = bomb(dr + 1, dc, crush_set);
            big_bomb.forEach((item) => {
                crush_set.add(item);
            });
        }
        crush_set.add(`${dr + 1}-${dc}`);
    }
    if (dr - 1 >= 0 && !crush_set.has(`${dr - 1}-${dc}`)) {
        if (board[dr - 1][dc] === suits[8]) {
            small_bomb(dr - 1, dc, crush_set);
        }
        if (board[dr - 1][dc] === suits[7]) {
            let big_bomb = bomb(dr - 1, dc, crush_set);
            big_bomb.forEach((item) => {
                crush_set.add(item);
            });
        }
        crush_set.add(`${dr - 1}-${dc}`);
    }
    if (dc + 1 < board[0].length && !crush_set.has(`${dr}-${dc + 1}`)) {
        if (board[dr][dc + 1] === suits[8]) {
            small_bomb(dr, dc + 1, crush_set);
        }
        if (board[dr][dc + 1] === suits[7]) {
            let big_bomb = bomb(dr, dc + 1, crush_set);
            big_bomb.forEach((item) => {
                crush_set.add(item);
            });
        }
        crush_set.add(`${dr}-${dc + 1}`);
    }
    if (dc - 1 >= 0 && !crush_set.has(`${dr}-${dc - 1}`)) {
        if (board[dr][dc - 1] === suits[8]) {
            small_bomb(dr, dc - 1, crush_set);
        }
        if (board[dr][dc - 1] === suits[7]) {
            let big_bomb = bomb(dr, dc - 1, crush_set);
            big_bomb.forEach((item) => {
                crush_set.add(item);
            });
        }
        crush_set.add(`${dr}-${dc - 1}`);
    }
    return crush_set;
}

function bomb(dr, dc, crush_set) {
    if (crush_set.has(`${dr}-${dc}`)) {
        return crush_set;
    }
    crush_set.add(`${dr}-${dc}`);
    for (let r = 0; r < board.length; r++) {
        if (board[r][dc] === suits[7] && !crush_set.has(`${r}-${dc}`)) {
            bomb(r, dc, crush_set);
        }
        if (board[r][dc] === suits[8] && !crush_set.has(`${r}-${dc}`)) {
            let sm_bomb = small_bomb(r, dc, crush_set);
            sm_bomb.forEach((item) => {
                crush_set.add(item);
            });
        }
        crush_set.add(`${r}-${dc}`);
    }

    for (let c = 0; c < board[0].length; c++) {
        if (board[dr][c] === suits[7] && !crush_set.has(`${dr}-${c}`)) {
            bomb(dr, c, crush_set);
        }
        if (board[dr][c] === suits[8] && !crush_set.has(`${dr}-${c}`)) {
            let sm_bomb = small_bomb(dr, c, crush_set);
            sm_bomb.forEach((item) => {
                crush_set.add(item);
            });
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
        while (
            right + 1 < board[0].length &&
            board[r][right] === board[r][right + 1]
        ) {
            leftRight.add(`${r}-${right + 1}`);
            right++;
        }
        while (left - 1 >= 0 && board[r][left] === board[r][left - 1]) {
            leftRight.add(`${r}-${left - 1}`);
            left--;
        }

        if (upDown.size >= 3) {
            upDownFlag = true;
        }
        if (leftRight.size >= 3) {
            leftRightFlag = true;
        }

        if (upDownFlag) {
            upDown.forEach((item) => {
                crush.add(item);
            });
        }
        if (leftRightFlag) {
            leftRight.forEach((item) => {
                crush.add(item);
            });
        }
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
                while (
                    up + 1 < board.length &&
                    board[up][c] === board[up + 1][c]
                ) {
                    upDown.add(`${up + 1}-${c}`);
                    up++;
                }
                while (down - 1 >= 0 && board[down][c] === board[down - 1][c]) {
                    upDown.add(`${down - 1}-${c}`);
                    down--;
                }
                while (
                    right + 1 < board[0].length &&
                    board[r][right] === board[r][right + 1]
                ) {
                    leftRight.add(`${r}-${right + 1}`);
                    right++;
                }
                while (left - 1 >= 0 && board[r][left] === board[r][left - 1]) {
                    leftRight.add(`${r}-${left - 1}`);
                    left--;
                }

                if (upDown.size >= 3) {
                    upDownFlag = true;
                }
                if (leftRight.size >= 3) {
                    leftRightFlag = true;
                }

                if (upDownFlag) {
                    upDown.forEach((item) => {
                        crushSet.add(item);
                    });
                }
                if (leftRightFlag) {
                    leftRight.forEach((item) => {
                        crushSet.add(item);
                    });
                }
            }
        }
    }
    return crushSet;
}

function red(crushSet) {
    crushSet.forEach((coordinate) => {
        const [r, c] = coordinate.split("-").map(Number);
        const buttonId = `button-${r}-${c}`;
        const myButton = document.getElementById(buttonId);
        myButton.style.backgroundColor = "red";
    });
}

function unred(crushSet) {
    crushSet.forEach((coordinate) => {
        const [r, c] = coordinate.split("-").map(Number);
        const buttonId = `button-${r}-${c}`;
        const myButton = document.getElementById(buttonId);
        myButton.style.backgroundColor = "";
    });
}

async function crush(crushSet) {
    crushSet.forEach((coordinate) => {
        const [r, c] = coordinate.split("-").map(Number);
        board[r][c] = suits[9];
    });
}

let ready_flag = false;

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
        const slide = new Set();
        for (let c = 0; c < board[0].length; c++) {
            if (board[r][c] === "") {
                drop = true;
                let row = r;
                while (row - 1 >= 0) {
                    board[row][c] = board[--row][c];
                    slide.add(`${row}-${c}`);
                }
                const random_number = Math.floor(Math.random() * 6) + 1;
                const special_bomb_number_random =
                    Math.floor(Math.random() * 10) + 1;
                const special_bomb_number_random_match =
                    Math.floor(Math.random() * 4) + 1;
                if (
                    special_bomb_number_random === 7 &&
                    special_bomb_number_random_match === 1
                ) {
                    board[0][c] = suits[7];
                } else if (
                    special_bomb_number_random === 8 &&
                    special_bomb_number_random_match === 1
                ) {
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
