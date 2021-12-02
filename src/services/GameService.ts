import { Service } from "@tsed/di";
import { Injectable } from "@tsed/common";
import { Connection, Repository } from "typeorm";
import "reflect-metadata";
import { ORMService } from "./ORMService";
import { Cell, Game, GameState } from "../models/Game";
import { GameCoreService } from "../core/GameCore";
import { GameEntity } from '../entities/Game.entity';

@Service()
@Injectable()
export class GameService {
  private connection: Connection;
  private repository: Repository<Game>;
  constructor(private ormService: ORMService, private gameCoreService: GameCoreService) {
  }

  async createNewGame(rows: number, columns: number, amountOfMines: number, userId: string): Promise<Game> {
    const newGame = this.gameCoreService.createNewGame(amountOfMines, rows, columns, userId);
    const repository = this.ormService.connection.getRepository(GameEntity);
    let newGameInstance = new Game();
    newGameInstance = repository.merge(newGameInstance, newGame);
    const result = await this.ormService.upsert<Game>(repository, newGameInstance);
    return result;
  }

  async clickCell(gameId: string, x: number, y: number): Promise<Game> {
    const repository = this.ormService.connection.getRepository(GameEntity);
    const game = await repository.findOneOrFail({gameId});
    const updatedGame = this.gameCoreService.clickCell(game, x, y);
    await this.ormService.upsert<Game>(repository, updatedGame);
    return updatedGame;
  }

  async updateGame(gameId: string, matrix: Cell[][]): Promise<Game> {
    const repository = this.ormService.connection.getRepository(GameEntity);
    const game = await repository.findOneOrFail({gameId});
    const updatedGameInstance = repository.merge(game, {...game, matrix});
    const updatedGame = await this.ormService.upsert<Game>(repository, updatedGameInstance);
    return updatedGame;
  }

  async switchState(gameId: string): Promise<Game> {
    const repository = this.ormService.connection.getRepository(GameEntity);
    const game = await repository.findOneOrFail({gameId})
    if(game.state === GameState.Stopped){
      const updatedGame = this.gameCoreService.resumeGame(game);
      await this.ormService.upsert<Game>(repository, updatedGame);
      return updatedGame;
    }
    else if(game.state === GameState.InProgress){
      const updatedGame = this.gameCoreService.stopGame(game);
      await this.ormService.upsert<Game>(repository, updatedGame);
      return updatedGame;
    }
    else {
      throw new Error('State can only be changed from Stopped to InProgress and viceversa');
    }
  }

  async findAll(userId: string):Promise<Game[]> {
    const repository = this.ormService.connection.getRepository(Game);
    const games = await repository.find({where: []});
    return games;
  }

  async findOne(id: string, userId: string):Promise<Game> {
    const repository = this.ormService.connection.getRepository(Game);
    const games = await repository.findOneOrFail({where: [{gameId: id}]});
    return games;
  }

  async findAllNotFinished(userId: string):Promise<Game[]> {
    const repository = this.ormService.connection.getRepository(Game);
    const games = await repository.find({where: [{state: GameState.Stopped}]});
    return games;
  }
}
