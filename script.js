const board = document.getElementById("board");
const status = document.getElementById("status");
const game = new Chess();
const stockfish = new Worker("stockfish.js");

function drawBoard() {
  board.innerHTML = "";
  const boardArray = game.board();
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const square = document.createElement("div");
      const piece = boardArray[i][j];
      square.className = "square " + ((i + j) % 2 === 0 ? "white" : "black");
      square.dataset.row = i;
      square.dataset.col = j;
      if (piece) square.textContent = getUnicode(piece);
      square.onclick = () => handleClick(i, j);
      board.appendChild(square);
    }
  }
  updateStatus();
}

function getUnicode(piece) {
  const codes = {
    p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
    P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔"
  };
  return codes[piece.color === "w" ? piece.type.toUpperCase() : piece.type];
}

let selected = null;

function handleClick(i, j) {
  const pos = "abcdefgh"[j] + (8 - i);
  if (!selected) {
    selected = pos;
  } else {
    const move = game.move({ from: selected, to: pos, promotion: 'q' });
    selected = null;
    if (move) {
      drawBoard();
      setTimeout(aiMove, 200);
    } else {
      drawBoard();
    }
  }
}

function aiMove() {
  stockfish.postMessage("position fen " + game.fen());
  stockfish.postMessage("go depth 15");

  stockfish.onmessage = (e) => {
    if (e.data.startsWith("bestmove")) {
      const move = e.data.split(" ")[1];
      game.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: 'q' });
      drawBoard();
    }
  };
}

function updateStatus() {
  if (game.in_checkmate()) status.textContent = "Checkmate!";
  else if (game.in_draw()) status.textContent = "Draw!";
  else status.textContent = game.turn() === "w" ? "White's turn" : "Black's turn";
}

drawBoard();
