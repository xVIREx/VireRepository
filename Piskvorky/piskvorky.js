var canvas = document.getElementById("canvas01");
var c = canvas.getContext('2d');

var text = document.getElementById("text01")

var board = [];
var availablePositions = [];
var neighborsOffs = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0]
]

var multiplier;
var circleRadius;

var w = 20;
var h = 20;

var playerTurn = true;

var mark = {
  X: 0,
  O: 1
}

function Setup() {
  canvas.width = 1200;
  canvas.height = 1200;

  multiplier = canvas.width / w;
  circleRadius = multiplier / 3.5;

  for (var i = 0; i < w; i++) {
    var _array = [];
    for (var j = 0; j < h; j++) {
      _array.push('');
    }
    board.push(_array);
  }

  c.strokeStyle = "#000";
  c.lineWidth = 3;
  for (var i = 1; i < w; i++) {
    c.beginPath();
    c.moveTo(i * multiplier, 0)
    c.lineTo(i * multiplier, h * multiplier);
    c.stroke();
  }
  for (var i = 1; i < h; i++) {
    c.beginPath();
    c.moveTo(0, i * multiplier);
    c.lineTo(w * multiplier, i * multiplier);
    c.stroke();
  }

  canvas.addEventListener('click', PlayerMove, false);
}

function PlayerMove(event) {

  if (!playerTurn) {
    return;
  }

  var rect = canvas.getBoundingClientRect();

  var _x = Math.floor((event.clientX - rect.left) / multiplier);
  var _y = Math.floor((event.clientY - rect.top) / multiplier);

  if (availablePositions.length > 0 && !isArrayInArray(availablePositions, [_x, _y])) {
    return;
  }

  playerTurn = false;

  board[_x][_y] = 'X';

  var _index = findArrayInArray(availablePositions, [_x, _y]);
  if (_index > -1) {
    availablePositions.splice(_index, 1);
  }

  DrawCross(_x * multiplier, _y * multiplier);

  var win = CheckWinner();
  if (win) {
    text.textContent = "Winner is Player!!!";
    console.log("Winner is Player with total score of: " + GetBoardScore(board));
  } else {
    text.textContent = "AI's turn.";
    UpdateAvailablePositions(availablePositions, _x, _y);
    setTimeout(AIMove, 500);
  }

}

function AIMove() {
  bestMove = Minimax(board.slice(0), availablePositions.slice(0), -Infinity, Infinity, 1, true);

  board[bestMove[0]][bestMove[1]] = 'O';

  DrawCircle(bestMove[0] * multiplier, bestMove[1] * multiplier);

  var win = CheckWinner();
  if (win) {
    text.textContent = "Winner is AI!!!";
    console.log("Winner is AI with total score of: " + GetBoardScore(board));
  } else {
    text.textContent = "Player's turn.";
    UpdateAvailablePositions(availablePositions, bestMove[0], bestMove[1]);
    playerTurn = true;
  }

}

function Minimax(_board, _availablePositions, alpha, beta, depth, isMaximizing) {
  if (depth == 5) {
    return GetBoardScore(_board);
  }
  var worseScore = Infinity;
  if (isMaximizing) {
    var bestMove = [0, 0];
    var bestScore = -Infinity;
    for (var i = 0; i < _availablePositions.length; i++) {
      var pos = _availablePositions[i];
      var __availablePositions = _availablePositions.slice(0);
      UpdateAvailablePositions(__availablePositions, pos[0], pos[1]);
      _board[pos[0]][pos[1]] = 'O';
      var score = Minimax(_board, __availablePositions, alpha, beta, depth + 1, false);
      _board[pos[0]][pos[1]] = '';
      alpha = Math.max(alpha, score);
      if (score > bestScore) {
        bestScore = score;
        bestMove = pos;
      }
      if (score < worseScore) {
        worseScore = score;
      }
      if (beta <= alpha) {
        break;
      }

    }
    if (depth == 1) {
      console.log("picking " + bestScore);
      console.log("worse possible move " + worseScore);
      return bestMove;
    }
  }
  if (!isMaximizing) {
    var bestScore = Infinity;
    for (var i = 0; i < _availablePositions.length; i++) {
      var pos = _availablePositions[i];
      var __availablePositions = _availablePositions.slice(0);
      UpdateAvailablePositions(__availablePositions, pos[0], pos[1]);
      _board[pos[0]][pos[1]] = 'X';
      var score = Minimax(_board, __availablePositions, alpha, beta, depth + 1, true);
      _board[pos[0]][pos[1]] = '';
      beta = Math.min(beta, score);
      if (score < bestScore) {
        bestScore = score;
      }
      if (beta <= alpha) {
        break;
      }
    }
  }

  return bestScore + GetBoardScore(_board);

}

function UpdateAvailablePositions(arr, x, y) {
  arr.splice(findArrayInArray(arr, [x, y]), 1);
  for (var i = 0; i < neighborsOffs.length; i++) {
    var _neighborPos = [x - neighborsOffs[i][0], y - neighborsOffs[i][1]];
    if (isArrayInArray(arr, _neighborPos)) {
      continue;
    }
    if (_neighborPos[0] > -1 && _neighborPos[1] > -1 && _neighborPos[0] < w && _neighborPos[1] < h) {
      if (board[_neighborPos[0]][_neighborPos[1]] == '') {
        arr.push(_neighborPos);
      }
    }
  }
}

function GetBoardScore(_board) {
  var currentMark = '';
  var count = 0;

  var scores = [0, 0];

  var clean;

  for (var i = 0; i < w; i++) {

    //diagonally from top side to right side
    currentMark = '';
    count = 0;
    clean = false;
    for (var j = 0; i + 1 + j < w; j++) {
      if (_board[i + 1 + j][j] == '') {
        clean = true;
        currentMark = '';
        count = 0;
        continue;
      }
      if (_board[i + 1 + j][j] == currentMark) {
        count++;
      } else {
        if (count == 3 && clean) {
          scores[mark[currentMark]] -= 1;
        }
        if (count == 4) {
          scores[mark[currentMark]] -= 2;
        }
        if (currentMark != '') {
          clean = false;
        }
        currentMark = _board[i + 1 + j][j];
        count = 1;
      }

      if (count == 3 && clean) {
        scores[mark[currentMark]] += 1;
      }
      if (count == 4) {
        scores[mark[currentMark]] += 2;
      }
      if (count == 5) {
        scores[mark[currentMark]] += 3;
      }
    }

    //slopes
    currentMark = '';
    count = 0;
    clean = false;
    for (var j = 0; j < h; j++) {
      if (_board[i][j] == '') {
        clean = true;
        currentMark = '';
        count = 0;
        continue;
      }
      if (_board[i][j] == currentMark) {
        count++;
      } else {
        if (count == 3 && clean) {
          scores[mark[currentMark]] -= 1;
        }
        if (count == 4) {
          scores[mark[currentMark]] -= 2;
        }
        if (currentMark != '') {
          clean = false;
        }
        currentMark = _board[i][j];
        count = 1;
      }

      if (count == 3 && clean) {
        scores[mark[currentMark]] += 1;
      }
      if (count == 4) {
        scores[mark[currentMark]] += 2;
      }
      if (count == 5) {
        scores[mark[currentMark]] += 3;
      }
    }

    //diagonally from top side to left side
    currentMark = '';
    count = 0;
    clean = false;
    for (var j = 0; w - 2 - i - j > -1; j++) {
      if (_board[w - 2 - i - j][j] == '') {
        clean = true;
        currentMark = '';
        count = 0;
        continue;
      }
      if (_board[w - 2 - i - j][j] == currentMark) {
        count++;
      } else {
        if (count == 3 && clean) {
          scores[mark[currentMark]] -= 1;
        }
        if (count == 4) {
          scores[mark[currentMark]] -= 2;
        }
        if (currentMark != '') {
          clean = false;
        }
        currentMark = _board[w - 2 - i - j][j];
        count = 1;
      }

      if (count == 3 && clean) {
        scores[mark[currentMark]] += 1;
      }
      if (count == 4) {
        scores[mark[currentMark]] += 2;
      }
      if (count == 5) {
        scores[mark[currentMark]] += 3;
      }
    }
  }

  for (var i = 0; i < h; i++) {

    //diagonally from left side to botside
    currentMark = '';
    count = 0;
    clean = false;
    for (var j = 0; i + j < h; j++) {
      if (_board[j][i + j] == '') {
        clean = true;
        currentMark = '';
        count = 0;
        continue;
      }
      if (_board[j][i + j] == currentMark) {
        count++;
      } else {
        if (count == 3 && clean) {
          scores[mark[currentMark]] -= 1;
        }
        if (count == 4) {
          scores[mark[currentMark]] -= 2;
        }
        if (currentMark != '') {
          clean = false;
        }
        currentMark = _board[j][i + j];
        count = 1;
      }

      if (count == 3 && clean) {
        scores[mark[currentMark]] += 1;
      }
      if (count == 4) {
        scores[mark[currentMark]] += 2;
      }
      if (count == 5) {
        scores[mark[currentMark]] += 3;
      }
    }

    //diagonally from right side to botside
    currentMark = '';
    count = 0;
    clean = false;
    for (var j = 0; i + j < h; j++) {
      if (_board[w - 1 - j][i + j] == '') {
        clean = true;
        currentMark = '';
        count = 0;
        continue;
      }
      if (_board[w - 1 - j][i + j] == currentMark) {
        count++;
      } else {
        if (count == 3 && clean) {
          scores[mark[currentMark]] -= 1;
        }
        if (count == 4) {
          scores[mark[currentMark]] -= 2;
        }
        if (currentMark != '') {
          clean = false;
        }
        currentMark = _board[w - 1 - j][i + j];
        count = 1;
      }

      if (count == 3 && clean) {
        scores[mark[currentMark]] += 1;
      }
      if (count == 4) {
        scores[mark[currentMark]] += 2;
      }
      if (count == 5) {
        scores[mark[currentMark]] += 3;
      }
    }

    //rows
    currentMark = '';
    count = 0;
    clean = false;
    for (var j = 0; j < w; j++) {
      if (_board[j][i] == '') {
        clean = true;
        currentMark = '';
        count = 0;
        continue;
      }
      if (_board[j][i] == currentMark) {
        count++;
      } else {
        if (count == 3 && clean) {
          scores[mark[currentMark]] -= 1;
        }
        if (count == 4) {
          scores[mark[currentMark]] -= 2;
        }
        if (currentMark != '') {
          clean = false;
        }
        currentMark = _board[j][i];
        count = 1;
      }

      if (count == 3 && clean) {
        scores[mark[currentMark]] += 1;
      }
      if (count == 4) {
        scores[mark[currentMark]] += 2;
      }
      if (count == 5) {
        scores[mark[currentMark]] += 3;
      }
    }

  }

  return scores[1] - scores[0];
}

function CheckWinner() {
  var currentMark = '';
  var count = 0;

  for (var i = 0; i < w; i++) {

    //diagonally from top side to right side
    currentMark = '';
    count = 0;
    for (var j = 0; i + j < w; j++) {
      if (board[i + j][j] == '') {
        currentMark = '';
        count = 0;
        continue;
      }
      if (board[i + j][j] == currentMark) {
        count++;
      } else {
        currentMark = board[i + j][j];
        count = 1;
      }
      if (count == 5) {
        return true;
      }
    }

    //slopes
    currentMark = '';
    count = 0;
    for (var j = 0; j < h; j++) {
      if (board[i][j] == '') {
        currentMark = '';
        count = 0;
        continue;
      }
      if (board[i][j] == currentMark) {
        count++;
      } else {
        currentMark = board[i][j];
        count = 1;
      }
      if (count == 5) {
        return true;
      }
    }

    //diagonally from top side to left side
    currentMark = '';
    count = 0;
    for (var j = 0; w - 1 - i - j > -1; j++) {
      if (board[w - 1 - i - j][j] == '') {
        currentMark = '';
        count = 0;
        continue;
      }
      if (board[w - 1 - i - j][j] == currentMark) {
        count++;
      } else {
        currentMark = board[w - 1 - i - j][j];
        count = 1;
      }
      if (count == 5) {
        return true;
      }
    }
  }

  for (var i = 0; i < h; i++) {

    //diagonally from left side to botside
    currentMark = '';
    count = 0;
    for (var j = 0; i + j < h; j++) {
      if (board[j][i + j] == '') {
        currentMark = '';
        count = 0;
        continue;
      }
      if (board[j][i + j] == currentMark) {
        count++;
      } else {
        currentMark = board[j][i + j];
        count = 1;
      }
      if (count == 5) {
        return true;
      }
    }

    //diagonally from right side to botside
    currentMark = '';
    count = 0;
    for (var j = 0; i + j < h; j++) {
      if (board[w - 1 - j][i + j] == '') {
        currentMark = '';
        count = 0;
        continue;
      }
      if (board[w - 1 - j][i + j] == currentMark) {
        count++;
      } else {
        currentMark = board[w - 1 - j][i + j];
        count = 1;
      }
      if (count == 5) {
        return true;
      }

    }

    //rows
    currentMark = '';
    count = 0;
    for (var j = 0; j < w; j++) {
      if (board[j][i] == '') {
        currentMark = '';
        count = 0;
        continue;
      }
      if (board[j][i] == currentMark) {
        count++;
      } else {
        currentMark = board[j][i];
        count = 1;
      }
      if (count == 5) {
        return true;
      }
    }
  }

  return false;
}

function DrawCross(x, y) {
  c.beginPath();
  c.moveTo(x + multiplier / 4, y + multiplier / 4);
  c.lineTo(x + multiplier / 4 * 3, y + multiplier / 4 * 3);
  c.moveTo(x + multiplier / 4 * 3, y + multiplier / 4);
  c.lineTo(x + multiplier / 4, y + multiplier / 4 * 3);
  c.stroke();
}

function DrawCircle(x, y) {
  c.beginPath();
  c.arc(x + multiplier / 2, y + multiplier / 2, circleRadius, 0, 360, false);
  c.stroke();
}

Setup();

function isArrayInArray(array, item) {
  var item_as_string = JSON.stringify(item);

  var contains = array.some(function (ele) {
    return JSON.stringify(ele) === item_as_string;
  });
  return contains;
}

function findArrayInArray(array, item) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][0] == item[0] && array[i][1] == item[1]) {
      return i;
    }
  }
  return -1;
}