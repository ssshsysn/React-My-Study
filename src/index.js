import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return(
    <button className={'square' + (props.isWinnerCell ? ' winner-cell':'')} 
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, isWinnerCell) {
    return (
      <Square
        key={i} 
        value={this.props.squares[i]}
        isWinnerCell={isWinnerCell}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const rows = [0, 1, 2];
    const cols = [0, 1, 2];
    return (
      <div>
        {rows.map(row => {
          return (
            <div
              className="board-row"
              key={row}
            >
              {cols.map(col => this.renderSquare(row * 3 + col, this.props.winnerLine.indexOf(row * 3 + col) !== -1))}
            </div>
          );
        })}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        location:{
          col:null,
          row:null,
        },
      }],
      stepNumber:0,
      xIsNext: true,
      isHistoryAscending: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const winnerInfo = calculateWinner(squares);
    if (winnerInfo || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        location:{
          col: i%3,
          row: Math.trunc(i/3),
        },
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  handleHistoryOrder(){
    const isHistoryAscending = !this.state.isHistoryAscending;
    this.setState({
      isHistoryAscending: isHistoryAscending,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerInfo = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move 
          + '[col:' + step.location.col + ']'
          + '[row:' + step.location.row + ']':
        'Go to game start';
        return (
          <li key={move}>
            <button
              className = {move === this.state.stepNumber ? 'selected-item-bold' : ''}
              onClick={() => this.jumpTo(move)}
            >
              {desc}
            </button>
          </li>
        );
    });

    let status;
    if (winnerInfo) {
      if (winnerInfo.isDraw) {
        status = 'Draw';
      } else {
        status = 'Winner: ' + winnerInfo.winner;
      }
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    if(!this.state.isHistoryAscending){
      moves.reverse();
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winnerLine={winnerInfo ? winnerInfo.line : []}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.handleHistoryOrder()}>Historys Toggle</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        isDraw: false,
        winner : squares[a],
        line: lines[i],
      }
    }
  }

  if(!squares.includes(null)) {
    return {
      isDraw: true,
      winner: null,
      line: [],
    }
  }

  return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
