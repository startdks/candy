//DONG KI, SIN & Harry
document.addEventListener("DOMContentLoaded", function () {
  var audio = new Audio("/mp3/Puzzle.mp3");
  var bomb_audio = new Audio("/mp3/bomb.mp3");
  var swap_audio = new Audio("/mp3/swap.mp3");
  var drop_audio = new Audio("/mp3/drop.mp3");
  drop_audio.volume = 0;
  swap_audio.volume = 0;
  bomb_audio.volume = 0;

  const board = [];
  const suits = {
    1: "🍬",
    2: "🍭",
    3: "🍩",
    4: "🍫",
    5: "🍒",
    6: "🍉",
    0: "💣",
    9: "",
  };

  for (let i = 0; i < 10; i++) {
    const row = [];
    for (let j = 0; j < 5; j++) {
      const randomSuitIndex = Math.floor(Math.random() * 6) + 1;
      row.push(suits[randomSuitIndex]);
    }
    board.push(row);
  }

  function show() {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 5; j++) {
        const buttonId = `button-${i}-${j}`;
        const myButton = document.getElementById(buttonId);
        myButton.value = board[i][j];
      }
    }
  }

  let selectedButton = null;

  function swapValues(selectedRow, selectedCol, clickedRow, clickedCol) {
    const temp = board[selectedRow][selectedCol];
    board[selectedRow][selectedCol] = board[clickedRow][clickedCol];
    board[clickedRow][clickedCol] = temp;
  }

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
        swap_audio.volume = 1;
        bomb_audio.volume = 1;
        drop_audio.volume = 1;
        selectedButton = null;
        button.style.backgroundColor = "";
        return;
      }
      if (selectedRow === 8 && selectedCol === 5) {
        audio.pause();
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
        show();
        swap_audio.play();
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
            el.removeEventListener("click", stopFunc, true); // stopFunc이 동일하게 구현되어있다는 가정하에
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

  const buttons = document.querySelectorAll("input[type='button']");
  buttons.forEach((button) => {
    button.addEventListener("click", () => handleClick(button));
  });

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
    return crushSet;
  }

  // function find() {
  //   const crushSet = new Set();
  //   for (let r = 0; r < board.length; r++) {
  //     for (let c = 0; c < board[0].length; c++) {
  //       if (
  //         r >= 1 &&
  //         r < board.length - 1 &&
  //         board[r - 1][c] === board[r][c] &&
  //         board[r][c] === board[r + 1][c]
  //       ) {
  //         crushSet.add(`${r - 1}-${c}`);
  //         crushSet.add(`${r}-${c}`);
  //         crushSet.add(`${r + 1}-${c}`);
  //       }
  //       if (
  //         c >= 1 &&
  //         c < board[0].length - 1 &&
  //         board[r][c - 1] === board[r][c] &&
  //         board[r][c] === board[r][c + 1]
  //       ) {
  //         crushSet.add(`${r}-${c - 1}`);
  //         crushSet.add(`${r}-${c}`);
  //         crushSet.add(`${r}-${c + 1}`);
  //       }
  //     }
  //   }

  //   return crushSet;
  // }
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
      board[r][c] = suits[0];
    });
  }

  async function crushsmoke(crushSet) {
    crushSet.forEach((coordinate) => {
      const [r, c] = coordinate.split("-").map(Number);
      board[r][c] = suits[9];
    });
  }

  async function new_drop() {
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[0].length; c++) {
        if (board[r][c] === suits[0]) {
          board[r][c] = "";
        }
      }
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
          const randomSuitIndex = Math.floor(Math.random() * 6) + 1;
          board[0][c] = suits[randomSuitIndex];
        }
      }
      if (drop) {
        show();
        drop_audio.play();
        await sleep(400);
      }
    }
  }

  function drop() {
    for (let c = 0; c < board[0].length; c++) {
      let rLevel = board.length - 1;
      for (let r = board.length - 1; r >= 0; r--) {
        if (board[r][c] !== suits[0]) {
          board[rLevel][c] = board[r][c];
          if (r !== rLevel) {
            board[r][c] = suits[0];
          }
          rLevel--;
        }
      }
    }
  }

  function replace() {
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[0].length; c++) {
        if (board[r][c] === suits[0]) {
          const randomSuitIndex = Math.floor(Math.random() * 6) + 1;
          board[r][c] = suits[randomSuitIndex];
        }
      }
    }
  }

  // function remove() {
  //   let crushSet = find();
  //   while (crushSet.size > 0) {
  //     crush(crushSet);
  //     drop();
  //     replace();
  //     crushSet = find();
  //     show();
  //   }
  // }

  function check_gameover() {
    const pairs = new Set();
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[0].length; c++) {
        if (c >= 2 && c < board[0].length - 1) {
          if (
            board[r][c - 2] === board[r][c] &&
            board[r][c] === board[r][c + 1]
          ) {
            pairs.add([`${r}-${c - 2}`, `${r}-${c}`, `${r}-${c + 1}`]);
          }
        }
        if (c < board[0].length - 3) {
          if (
            board[r][c] === board[r][c + 1] &&
            board[r][c + 1] === board[r][c + 3]
          ) {
            pairs.add([`${r}-${c}`, `${r}-${c + 1}`, `${r}-${c + 3}`]);
          }
        }
        if (r >= 2 && r < board.length - 1) {
          if (
            board[r - 2][c] === board[r][c] &&
            board[r][c] === board[r + 1][c]
          ) {
            pairs.add([`${r - 2}-${c}`, `${r}-${c}`, `${r + 1}-${c}`]);
          }
        }
        if (r < board.length - 3) {
          if (
            board[r][c] === board[r + 1][c] &&
            board[r + 1][c] === board[r + 3][c]
          ) {
            pairs.add([`${r}-${c}`, `${r + 1}-${c}`, `${r + 3}-${c}`]);
          }
        }
        if (r >= 1 && c < board[0].length - 1 && c >= 1) {
          if (
            board[r][c] === board[r - 1][c - 1] &&
            board[r - 1][c - 1] === board[r - 1][c + 1]
          ) {
            pairs.add([`${r}-${c}`, `${r - 1}-${c - 1}`, `${r - 1}-${c + 1}`]);
          }
        }
        if (r >= 1 && c < board[0].length - 1 && r < board.length - 1) {
          if (
            board[r][c] === board[r - 1][c + 1] &&
            board[r - 1][c + 1] === board[r + 1][c + 1]
          ) {
            pairs.add([`${r}-${c}`, `${r - 1}-${c + 1}`, `${r + 1}-${c + 1}`]);
          }
        }
        if (c < board[0].length - 1 && r < board.length - 1 && c >= 1) {
          if (
            board[r][c] === board[r + 1][c + 1] &&
            board[r + 1][c + 1] === board[r + 1][c - 1]
          ) {
            pairs.add([`${r}-${c}`, `${r + 1}-${c + 1}`, `${r + 1}-${c - 1}`]);
          }
        }
        if (c >= 1 && r >= 1 && r < board.length - 1) {
          if (
            board[r][c] === board[r + 1][c - 1] &&
            board[r + 1][c - 1] === board[r - 1][c - 1]
          ) {
            pairs.add([`${r}-${c}`, `${r + 1}-${c - 1}`, `${r - 1}-${c - 1}`]);
          }
        }

        if (r < board.length - 1 && c < board[0].length - 2) {
          if (
            board[r][c] === board[r][c + 1] &&
            board[r][c + 1] === board[r + 1][c + 2]
          ) {
            pairs.add([`${r}-${c}`, `${r}-${c + 1}`, `${r + 1}-${c + 2}`]);
          }
        }
        if (r >= 1 && c < board[0].length - 2) {
          if (
            board[r][c] === board[r][c + 1] &&
            board[r][c + 1] === board[r - 1][c + 2]
          ) {
            pairs.add([`${r}-${c}`, `${r}-${c + 1}`, `${r - 1}-${c + 2}`]);
          }
        }
        if (r < board.length - 1 && c >= 1 && c < board[0].length - 1) {
          if (
            board[r + 1][c - 1] === board[r][c] &&
            board[r][c] === board[r][c + 1]
          ) {
            pairs.add([`${r + 1}-${c - 1}`, `${r}-${c}`, `${r}-${c + 1}`]);
          }
        }
        if (r >= 1 && c >= 1 && c < board[0].length - 1) {
          if (
            board[r - 1][c - 1] === board[r][c] &&
            board[r][c] === board[r][c + 1]
          ) {
            pairs.add([`${r - 1}-${c - 1}`, `${r}-${c}`, `${r}-${c + 1}`]);
          }
        }
        if (c < board[0].length - 1 && r < board.length - 2) {
          if (
            board[r][c] === board[r + 1][c] &&
            board[r + 1][c] === board[r + 2][c + 1]
          ) {
            pairs.add([`${r}-${c}`, `${r + 1}-${c}`, `${r + 2}-${c + 1}`]);
          }
        }
        if (c >= 1 && r < board.length - 2) {
          if (
            board[r][c] === board[r + 1][c] &&
            board[r + 1][c] === board[r + 2][c - 1]
          ) {
            pairs.add([`${r}-${c}`, `${r + 1}-${c}`, `${r + 2}-${c - 1}`]);
          }
        }
        if (r >= 1 && c >= 1 && r < board.length - 1) {
          if (
            board[r - 1][c - 1] === board[r][c] &&
            board[r][c] === board[r + 1][c]
          ) {
            pairs.add([`${r - 1}-${c - 1}`, `${r}-${c}`, `${r + 1}-${c}`]);
          }
        }
        if (r >= 1 && c < board[0].length - 1 && r < board.length - 1) {
          if (
            board[r - 1][c + 1] === board[r][c] &&
            board[r][c] === board[r + 1][c]
          ) {
            pairs.add([`${r - 1}-${c + 1}`, `${r}-${c}`, `${r + 1}-${c}`]);
          }
        }
      }
    }
    return pairs;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function get_ready() {
    let ready = re_expand();
    while (ready.size > 0) {
      crush(ready);
      new_drop();
      ready = re_expand();
    }
  }
  get_ready();
  show();
});
