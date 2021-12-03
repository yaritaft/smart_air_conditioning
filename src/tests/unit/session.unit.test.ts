// import { GameCoreService } from '../../core/ReportCore';
// import { CellState, GameState } from '../../models/Game';

// describe("MATRIX", ()=>{
//   test('Login success', () => {
//     const game = new GameCoreService();
//     jest.spyOn(game, "generateRandomMineCells").mockReturnValue([{ x: 2, y: 3 }]);
//     const newGame = game.createNewGame(1, 4, 4, "aa");
//     console.log(game.generateRandomMineCells(1,2,3))
//     game.clickCell(newGame, 0, 0);
//     game.clickCell(newGame, 1, 0);
//     game.clickCell(newGame, 3, 3);
//     expect(newGame.state).toEqual(GameState.Won);
//   });
//   test('Login wrong', () => {
//     const game = new GameCoreService();
//     jest.spyOn(game, "generateRandomMineCells").mockReturnValue([{ x: 2, y: 3 }]);
//     const newGame = game.createNewGame(1, 4, 4, "aa");
//     console.log(game.generateRandomMineCells(1,2,3))
//     game.clickCell(newGame, 0, 0);
//     game.clickCell(newGame, 1, 0);
//     game.clickCell(newGame, 3, 3);
//     expect(newGame.state).toEqual(GameState.Won);
//   });
// })
