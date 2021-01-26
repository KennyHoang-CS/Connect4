/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

let currPlayer = 1;             // active player: 1 or 2.
let board = [];                 // array of rows, each row is array of cells  (board[y][x])
let countMoves = 0;             // used to determine if the game is a tie.

// Store the width and height settings into localStorage for game reloads.
let WIDTH = JSON.parse(localStorage.getItem('WIDTH'));
let HEIGHT = JSON.parse(localStorage.getItem('HEIGHT'));

// Get a reference to the players' scores. 
const myP1 = document.querySelector('#p1');
const myP2 = document.querySelector('#p2');

// Get a reference to the message that is above of the Connect 4 game. 
const title = document.querySelector('h1');
const widthInput = document.querySelector('#wInput');     // Ref. to width input.
const heightInput = document.querySelector('#hInput');    // Ref. to height input.
const updateBtn = document.querySelector('#update');      // Ref. to update setting button.
const restartBtn = document.querySelector('#restart');    // Ref. to restart game button.
const resetBtn = document.querySelector('#reset');        // Ref. to reset all data button.
const stop = document.querySelector('.stop');             // Ref. to the top of the board.

// Load in default height and/or width depending on localStorage data. 
if(!WIDTH && !HEIGHT){
    WIDTH = 7;
    HEIGHT = 6;
} else if (!HEIGHT){
  HEIGHT = 6;
} else{
  WIDTH = 7;
}

// Load in players' win/lost ratio from localStorage. 
let p1W = JSON.parse(localStorage.getItem('p1W')) || 0;
let p2L = JSON.parse(localStorage.getItem('p2L')) || 0;
let p2W = JSON.parse(localStorage.getItem('p2W')) || 0;
let p1L = JSON.parse(localStorage.getItem('p1L')) || 0;
myP1.innerText = `Player 1: ${p1W}-${p1L}`;
myP2.innerText = `Player 2: ${p2W}-${p2L}`;

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

function makeBoard() {
    // Create a row with the given width, and set elements to undefined. 
    let boardRow = [];
    for(let i = 0; i < WIDTH; i++){
        boardRow.push(undefined);
    }
    for(let i = 0; i < HEIGHT; i++){
        board.push([...boardRow]);
    }
}

/** makeHtmlBoard: make HTML table and row of column tops. */
function makeHtmlBoard() {
  
    const htmlBoard = document.getElementById('board');
    // Creating a html element 'tr' to define a row of elements with the name 'top'.
    const top = document.createElement("tr");
    // 'top' will have an id identifier named 'column-top'.
    top.setAttribute("id", "column-top");
    // 'adding a click event for that row element named 'top'. 
    top.addEventListener("click", handleClick);

    // Create the very top row for players' click events to drop the pieces. 
    for (let x = 0; x < WIDTH; x++) {
        const headCell = document.createElement("td");
        headCell.setAttribute("id", x);
        top.append(headCell);
    }
    htmlBoard.append(top);
  
    // Iterate through the board from up, the given HEIGHT, to down. 
    for (let y = 0; y < HEIGHT; y++) {
        // Create a new html element 'tr' to contain a row of elements. 
        const row = document.createElement("tr");
    
       // Iterate through the individual cells starting from the left to right horizontally.
        for (let x = 0; x < WIDTH; x++) {
      
        // Create a new html element 'td' that will contain the data. 
        const cell = document.createElement("td");
        // Set that individual cell with its given board position for its id identifier
        // 0-0, 0-1, 0-2, ..., 0-6
        // ...
        // 5-0, 5-1, 5-2, ..., 5-6 
        cell.setAttribute("id", `${y}-${x}`);
        // Add that individual cell to its current row dictated by 'y'. 
        row.append(cell);
        }
        htmlBoard.append(row);
    }
}

/** findSpotForCol: given column x, return top empty y (null if filled) */
function findSpotForCol(x) {
    
    // Start from the very bottom in the column, x, to see if there is an empty slot. 
    for(let y = HEIGHT - 1; y >= 0; y--){
        if(!board[y][x]){
        return y;
        }
    }
    return null;  // if no empty slots, return null. 
}

/** placeInTable: update DOM to place piece into HTML table of board */
function placeInTable(y, x) {
    // Create the div element.
    const token = document.createElement('div');
    // Add the visual effect to the board of the current player's color. 
    token.classList.add('piece');
    token.classList.add(`p${currPlayer}`);
    // Add the token to the board with its respectve column and row index.
    const slotPosition = document.getElementById(`${y}-${x}`);
    slotPosition.append(token);
    countMoves++;
}

/** endGame: announce game end */
function endGame(msg) {
  
  // Set the message on top of the board to see which player won. 
  title.innerText = msg;
  
  // Adjust the players' win/lost ratio and save it to localStorage. 
  if(currPlayer === 1){
      title.style.color = 'red';
      localStorage.setItem('p1W', JSON.stringify(++p1W));
      localStorage.setItem('p2L', JSON.stringify(++p2L));
  } else if(currPlayer === 2){
    title.style.color = 'black';
    localStorage.setItem('p2W', JSON.stringify(++p2W));
    localStorage.setItem('p1L', JSON.stringify(++p1L));
  }

    // Update the players' visual score on the game background.
    myP1.innerText = `Player 1: ${p1W}-${p1L}`;
    myP2.innerText = `Player 2: ${p2W}-${p2L}`;

    // Change the message on top of the game to a blinking effect after 3 seconds.  
    setTimeout(()=>{
      title.classList.add('blink-text');
      title.innerText = 'Play Again?';
    }, 3000);
}

/** handleClick: handle click of column top to play piece */
function handleClick(evt) { 
    // get x from ID of clicked cell
    const x = +evt.target.id;
    // get next spot in column (if none, ignore click)
    const y = findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table 
    board[y][x] = currPlayer;
    placeInTable(y, x);
  
    // check for win
    if (checkForWin()) {
        stop.classList.add('stopClicks');
        return endGame(`Player ${currPlayer} won!`);
    } 

    // check for tie  
    if(countMoves === (WIDTH * HEIGHT)){
        title.innerText = 'It is a tie!';
        setTimeout(()=>{
            title.classList.add('restart');
            title.innerText = 'Play Again?';
        }, 3000);
    }

  // switch players
  currPlayer = currPlayer === 1 ? 2 : 1;
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */
function checkForWin() {
    function _win(cells) {
        // Check four cells to see if they're all color of current player
        //  - cells: list of four (y, x) cells
        //  - returns true if all are legal coordinates & all match currPlayer
        return cells.every(
        ([y, x]) =>
            y >= 0 &&
            y < HEIGHT &&
            x >= 0 &&
            x < WIDTH &&
            board[y][x] === currPlayer
    );}

    // Check winning conditions: horizontal, vertical, diagonal left/right. 
    for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      /* See if there is a horizonal win in 4 slots.
      / - - - - ... - - - -
        ...
        - - - - ... - - - - 
      */
      const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      
      /* See if there is a vertical win in 4 slots.
        - ... - 
        -     -
        -     -
        - ... -
      */
      const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      
      /* See if there is a diagonal right win in 4 slots. 
        - . . . -
          -       -
            -       -
              - . . . -
      */
      const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      
      /* See if there is a diagonal left win in 4 slots. 
            - ... -
           -     -
          -     -  
         - ... -
      */
      const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];
      /* Determine where the 'win' occurred in any of the 4 areas: 
              horizontal, vertical, right diagonal, left diagonal.
      */
      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
      }
    }
  }
}

/* Save the width/height inputs to localStorage by an input event listener. */
widthInput.addEventListener('input', e =>{
    localStorage.setItem('WIDTH', JSON.stringify(e.target.value));
})
heightInput.addEventListener('input', e =>{
    localStorage.setItem('HEIGHT', JSON.stringify(e.target.value));
})

/* Add the events to get the width/height from localStorage then reload the browser. */
updateBtn.addEventListener('click', e => {
    WIDTH = JSON.parse(localStorage.getItem('WIDTH'));
    HEIGHT = JSON.parse(localStorage.getItem('HEIGHT'));
    location.reload();
})
restartBtn.addEventListener('click', e => {
    WIDTH = JSON.parse(localStorage.getItem('WIDTH'));
    HEIGHT = JSON.parse(localStorage.getItem('HEIGHT'))
    location.reload();
})

/* Add the event to the reset button to clear all data back to default, 
no new height/widths and players' win/lost ratio */
resetBtn.addEventListener('click', e =>{
    reset();
})

// To clear all data. 
function reset(){
    window.localStorage.clear();
    myP1.innerText = 'Player 1: 0-0';
    myP2.innerText = 'Player 2: 0-0';
    heightInput.value = '';
    widthInput.value = '';
    WIDTH = JSON.parse(localStorage.getItem('WIDTH'));
    HEIGHT = JSON.parse(localStorage.getItem('HEIGHT'))
    location.reload();
}

// Load the game. 
makeBoard();
makeHtmlBoard();