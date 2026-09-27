import { Board } from './ui/Board';
import { NewRoundButton } from './ui/NewRoundButton';
import { StatusRegion } from './ui/StatusRegion';
import { useGame } from './game/useGame';
import styles from './App.module.css';

export function App() {
  const { board, status, isCellPlayable, playCell, newRound, firstCellRef } =
    useGame();

  return (
    <main className={styles.app}>
      <h1>Tic-Tac-Toe</h1>
      <StatusRegion message={status} />
      <Board
        board={board}
        isCellPlayable={isCellPlayable}
        onPlay={playCell}
        firstCellRef={firstCellRef}
      />
      <NewRoundButton onClick={newRound} />
    </main>
  );
}

export default App;
