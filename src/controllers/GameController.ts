import { Controller, Get, Patch, Post, BodyParams, Inject, PathParams, HeaderParams } from "@tsed/common";
import { GameCoreService } from "../core/GameCore";
import { CellState, Game } from "../models/Game";
import { TokenHeader } from "../models/Session";
import { GameService } from "../services/GameService";
import { SessionService } from "../services/SessionService";

type CellStatesToModify = CellState.Flagged | CellState.Question | CellState.Checked;

@Controller("/games")
export class GameController {
  @Inject()
  gameService: GameService;
  @Inject()
  sessionService: SessionService;
  @Inject()
  gameCoreService: GameCoreService;

  @Post()
  async createNewGame(
    @BodyParams() body: { rows: number; columns: number; amountOfMines: number },
    @HeaderParams() header: TokenHeader
  ): Promise<Game | undefined> {
    const { rows, columns, amountOfMines } = body;
    const token = header["authorization"];
    console.log(header);
    const userId = await this.sessionService.gatherUserIdByToken(token);
    const result = await this.gameService.createNewGame(rows, columns, amountOfMines, userId);
    return result;
  }

  @Get()
  async findAll(@HeaderParams() header: TokenHeader): Promise<{ games: Game[] }> {
    const userId = await this.sessionService.gatherUserIdByToken(header.authorization);
    const result = await this.gameService.findAll(userId);
    return { games: result };
  }

  @Get("/ongoing")
  async findAllNotFinished(@HeaderParams() header: TokenHeader): Promise<{ games: Game[] }> {
    const userId = await this.sessionService.gatherUserIdByToken(header.authorization);
    const result = await this.gameService.findAllNotFinished(userId);
    return { games: result };
  }

  @Get("/:id")
  async find(@HeaderParams() header: TokenHeader, @PathParams() params: { id: string }): Promise<Game> {
    const userId = await this.sessionService.gatherUserIdByToken(header.authorization);
    const result = await this.gameService.findOne(params.id, userId);
    return result;
  }

  @Patch("/:id/click")
  async clickCell(
    @BodyParams() body: { x: number; y: number; type?: CellStatesToModify },
    @PathParams() params: { id: string },
    @HeaderParams() header: TokenHeader
  ): Promise<Game | undefined> {
    const userId = await this.sessionService.gatherUserIdByToken(header.authorization);
    const { x, y, type } = body;
    const game = await this.gameService.findOne(params.id, userId);
    if (game.matrix) {
      if (type && (type === CellState.Flagged || type === CellState.Question)) {
        this.gameCoreService.setCellStatus(game.matrix, x, y, type);
        const result = await this.gameService.updateGame(params.id, game.matrix);
        return result;
      }
      else {
        const result = await this.gameService.clickCell(params.id, x, y);
        return result;
      }
    }
  }

  @Patch("/:id/state")
  async switchState(@PathParams() params: { id: string }): Promise<Game> {
    const result = await this.gameService.switchState(params.id);
    return result;
  }
}
