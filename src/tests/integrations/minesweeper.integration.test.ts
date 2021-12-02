import { PlatformTest } from "@tsed/common";
import * as SuperTest from "supertest";
import { Server } from "../../server";
import { TypeORMService } from "@tsed/typeorm";
import { CellState, GameState } from "../../models/Game";

describe("Rest", () => {
  // bootstrap your Server to load all endpoints before run your test
  let request: SuperTest.SuperTest<SuperTest.Test>;

  beforeAll(PlatformTest.bootstrap(Server));
  beforeAll(() => {
    request = SuperTest(PlatformTest.callback());
  });
  // afterAll(PlatformTest.reset);
  beforeEach(async () => {
    const db = new TypeORMService();
    const connection = db.get("default");
    await connection.dropDatabase();
    await connection.synchronize();
  });
  afterAll(async () => {
    await PlatformTest.reset();
  });
  const bodyRegister = {
    firstName: "dd",
    lastName: "cc",
    email: "qq22223s2",
    password: "aa",
  };

  const bodyLogin = {
    email: "qq22223s2",
    password: "aa",
  };

  describe("Post /user/register", () => {
    it("Register user", async () => {
      const response = await request.post("/api/user/register").send(bodyRegister).set("Accept", "application/json").expect(200);
    });
  });

  describe("Post Login /user/register", () => {
    it("Register and loign user", async () => {
      // const response = await request.post("/api/user/register").send(body).set('Accept', 'application/json'); // OPTION 1
      await request.post("/api/user/register").send(bodyRegister).set("Accept", "application/json").expect(200);
      const response = await request.post("/api/user/login").send(bodyLogin).set("Accept", "application/json").expect(200);
      expect(JSON.parse(response.text)["authorization"]).toBeTruthy();
      // expect(typeof response.body).toEqual("array");
    });
  });

  describe("Post /games", () => {
    it("Register and loign user and create game.", async () => {
      await request.post("/api/user/register").send(bodyRegister).set("Accept", "application/json").expect(200);
      const response = await request.post("/api/user/login").send(bodyLogin).set("Accept", "application/json").expect(200);
      const token = JSON.parse(response.text)["authorization"];
      const newGameData = {
        rows: 1,
        columns: 1,
        amountOfMines: 0,
      };
      const newGame = await request
        .post("/api/games")
        .send(newGameData)
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      expect(JSON.parse(newGame.text)["matrix"]).toBeTruthy();
    });
  });

  describe("Patch /games/:id/click", () => {
    it("Register and loign user, create game and win game.", async () => {
      await request.post("/api/user/register").send(bodyRegister).set("Accept", "application/json").expect(200);
      const response = await request.post("/api/user/login").send(bodyLogin).set("Accept", "application/json").expect(200);
      const token = JSON.parse(response.text)["authorization"];
      const newGameData = {
        rows: 1,
        columns: 1,
        amountOfMines: 0,
      };
      const newGame = await request
        .post("/api/games")
        .send(newGameData)
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      expect(JSON.parse(newGame.text)["matrix"]).toBeTruthy();
      const updatedGame = await request
        .patch(`/api/games/${JSON.parse(newGame.text)["gameId"]}/click`)
        .send({ x: 0, y: 0 })
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      expect(JSON.parse(updatedGame.text)["state"]).toBe(GameState.Won);
    });
  });

  describe("Patch CLICK /games/:id/click", () => {
    it("Register and loign user, create game and lose game.", async () => {
      await request.post("/api/user/register").send(bodyRegister).set("Accept", "application/json").expect(200);
      const response = await request.post("/api/user/login").send(bodyLogin).set("Accept", "application/json").expect(200);
      const token = JSON.parse(response.text)["authorization"];
      const newGameData = {
        rows: 4,
        columns: 5,
        amountOfMines: 1,
      };
      const newGame = await request
        .post("/api/games")
        .send(newGameData)
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      expect(JSON.parse(newGame.text)["matrix"]).toBeTruthy();
      const updatedGame = await request
        .patch(`/api/games/${JSON.parse(newGame.text)["gameId"]}/click`)
        .send({ x: 0, y: 0 })
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
        expect(JSON.parse(updatedGame.text)["matrix"][0][0]["state"]).toBe(CellState.Checked); // TOOD: SOMETIMES IT FAILS BECAUSE OF THE RANDOM MINE AND WHEN THE GAMES ENDS MATRIX IS UNDEFINED
    });
  });

  describe("Patch QUESTION /games/:id/click", () => {
    it("Register and loign user, create game and lose game.", async () => {
      await request.post("/api/user/register").send(bodyRegister).set("Accept", "application/json").expect(200);
      const response = await request.post("/api/user/login").send(bodyLogin).set("Accept", "application/json").expect(200);
      const token = JSON.parse(response.text)["authorization"];
      const newGameData = {
        rows: 1,
        columns: 1,
        amountOfMines: 1,
      };
      const newGame = await request
        .post("/api/games")
        .send(newGameData)
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      expect(JSON.parse(newGame.text)["matrix"]).toBeTruthy();
      const updatedGame = await request
        .patch(`/api/games/${JSON.parse(newGame.text)["gameId"]}/click`)
        .send({ x: 0, y: 0, type: "Question" })
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      expect(JSON.parse(updatedGame.text)["matrix"][0][0]["state"]).toBe(CellState.Question);
    });
  });

  describe("Patch FLAGGED /games/:id/click", () => {
    it("Register and loign user, create game and lose game.", async () => {
      await request.post("/api/user/register").send(bodyRegister).set("Accept", "application/json").expect(200);
      const response = await request.post("/api/user/login").send(bodyLogin).set("Accept", "application/json").expect(200);
      const token = JSON.parse(response.text)["authorization"];
      const newGameData = {
        rows: 1,
        columns: 1,
        amountOfMines: 1,
      };
      const newGame = await request
        .post("/api/games")
        .send(newGameData)
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      expect(JSON.parse(newGame.text)["matrix"]).toBeTruthy();
      const updatedGame = await request
        .patch(`/api/games/${JSON.parse(newGame.text)["gameId"]}/click`)
        .send({ x: 0, y: 0, type: "Flagged" })
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
        expect(JSON.parse(updatedGame.text)["matrix"][0][0]["state"]).toBe(CellState.Flagged);
    });
  });

  describe("Patch /games/:id/state", () => {
    it("Register and loign user, create game, save it and then resume it.", async () => {
      await request.post("/api/user/register").send(bodyRegister).set("Accept", "application/json").expect(200);
      const response = await request.post("/api/user/login").send(bodyLogin).set("Accept", "application/json").expect(200);
      const token = JSON.parse(response.text)["authorization"];
      const newGameData = {
        rows: 1,
        columns: 1,
        amountOfMines: 1,
      };
      const newGame = await request
        .post("/api/games")
        .send(newGameData)
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      expect(JSON.parse(newGame.text)["matrix"]).toBeTruthy();
      expect(JSON.parse(newGame.text)["state"]).toBe(GameState.InProgress);
      const stoppedGame = await request
        .patch(`/api/games/${JSON.parse(newGame.text)["gameId"]}/state`)
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      expect(JSON.parse(stoppedGame.text)["state"]).toBe(GameState.Stopped);
      const resumedGame = await request
        .patch(`/api/games/${JSON.parse(newGame.text)["gameId"]}/state`)
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      expect(JSON.parse(resumedGame.text)["state"]).toBe(GameState.InProgress);
    });
  });

  describe("Get /games/ongoing", () => {
    it("Register and loign user, create game, stop game and gather all stopped games.", async () => {
      await request.post("/api/user/register").send(bodyRegister).set("Accept", "application/json").expect(200);
      const response = await request.post("/api/user/login").send(bodyLogin).set("Accept", "application/json").expect(200);
      const token = JSON.parse(response.text)["authorization"];
      const newGameData = {
        rows: 1,
        columns: 1,
        amountOfMines: 1,
      };
      const newGame = await request
        .post("/api/games")
        .send(newGameData)
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      const onGoingGames = await request.get("/api/games/ongoing").set("Accept", "application/json").set("authorization", token).expect(200);
      expect(JSON.parse(onGoingGames.text)["games"]).toHaveLength(0);
      await request
        .patch(`/api/games/${JSON.parse(newGame.text)["gameId"]}/state`)
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      const stoppedGame = await request.get("/api/games/ongoing").set("Accept", "application/json").set("authorization", token).expect(200);
      expect(JSON.parse(stoppedGame.text)["games"]).toHaveLength(1);
    });
  });

  describe("Get /games", () => {
    it("Register and login user, create game, a get all games.", async () => {
      await request.post("/api/user/register").send(bodyRegister).set("Accept", "application/json").expect(200);
      const response = await request.post("/api/user/login").send(bodyLogin).set("Accept", "application/json").expect(200);
      const token = JSON.parse(response.text)["authorization"];
      const newGameData = {
        rows: 1,
        columns: 1,
        amountOfMines: 1,
      };
      const newGame = await request
        .post("/api/games")
        .send(newGameData)
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      expect(JSON.parse(newGame.text)["matrix"]).toBeTruthy();
      const allGames = await request.get("/api/games").set("Accept", "application/json").set("authorization", token).expect(200)
      expect(JSON.parse(allGames.text)["games"]).toHaveLength(1);
    });
  });

  describe("Get /games/:id", () => {
    it("Register and loign user, create game, a get it.", async () => {
      await request.post("/api/user/register").send(bodyRegister).set("Accept", "application/json").expect(200);
      const response = await request.post("/api/user/login").send(bodyLogin).set("Accept", "application/json").expect(200);
      const token = JSON.parse(response.text)["authorization"];
      const newGameData = {
        rows: 1,
        columns: 1,
        amountOfMines: 1,
      };
      const newGame = await request
        .post("/api/games")
        .send(newGameData)
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      expect(JSON.parse(newGame.text)["state"]).toBe(GameState.InProgress);
      const createdGame = await request
        .get(`/api/games/${JSON.parse(newGame.text)["gameId"]}`)
        .set("Accept", "application/json")
        .set("authorization", token)
        .expect(200);
      expect(JSON.parse(createdGame.text)["matrix"]).toBeTruthy();
      expect(JSON.parse(createdGame.text)["state"]).toBe(GameState.InProgress);
    });
  });
});
