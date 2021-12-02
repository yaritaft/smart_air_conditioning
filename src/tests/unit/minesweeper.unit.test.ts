import { GameCoreService } from '../../core/GameCore';
import { CellState, GameState } from '../../models/Game';
  
describe("MATRIX", ()=>{
  test('Create new Game and Win', () => {
    // const mockFn = (amountOfMines: number, rows: number, columns: number) => ;
    const game = new GameCoreService();
    jest.spyOn(game, "generateRandomMineCells").mockReturnValue([{ x: 2, y: 3 }]);
    const newGame = game.createNewGame(1, 4, 4, "aa");
    console.log(game.generateRandomMineCells(1,2,3))
    game.clickCell(newGame, 0, 0);
    game.clickCell(newGame, 1, 0);
    game.clickCell(newGame, 3, 3);
    expect(newGame.state).toEqual(GameState.Won);
  });
  test('Create new Game and lose', () => {
    // const mockFn = (amountOfMines: number, rows: number, columns: number) => ;
    const game = new GameCoreService();
    jest.spyOn(game, "generateRandomMineCells").mockReturnValue([{ x: 2, y: 3 }]);
    const newGame = game.createNewGame(1, 4, 4, "aa");
    console.log(game.generateRandomMineCells(1,2,3))
    game.clickCell(newGame, 2, 3);
    expect(newGame.state).toEqual(GameState.Lost);
  });
  test('Create new Game and flag one cell, in progress. Cell flagged not checked.', () => {
    // const mockFn = (amountOfMines: number, rows: number, columns: number) => ;
    const game = new GameCoreService();
    jest.spyOn(game, "generateRandomMineCells").mockReturnValue([{ x: 2, y: 3 }]);
    const newGame = game.createNewGame(1, 4, 4, "aa");
    console.log(game.generateRandomMineCells(1,2,3))
    game.setCellStatus(newGame.matrix, 1,3, CellState.Flagged)
    game.clickCell(newGame, 0, 0);
    game.clickCell(newGame, 1, 0);
    game.clickCell(newGame, 3, 3);
    expect(newGame.state).toEqual(GameState.InProgress);
  });
  test('Create new Game and flag one cell, in progress. Cell question not checked.', () => {
    // const mockFn = (amountOfMines: number, rows: number, columns: number) => ;
    const game = new GameCoreService();
    jest.spyOn(game, "generateRandomMineCells").mockReturnValue([{ x: 2, y: 3 }]);
    const newGame = game.createNewGame(1, 4, 4, "aa");
    console.log(game.generateRandomMineCells(1,2,3))
    game.setCellStatus(newGame.matrix, 1,3, CellState.Question)
    game.clickCell(newGame, 0, 0);
    game.clickCell(newGame, 1, 0);
    game.clickCell(newGame, 3, 3);
    expect(newGame.state).toEqual(GameState.InProgress);
  });
})