import { DependencyContainer } from "tsyringe";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { enableBotSpawning } from "../config/config.json";
import { buildWaves } from "./Spawning/Spawning";
import config from "../config/config.json";
import { globalValues } from "./GlobalValues";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { setupRoutes } from "./Routes/routes";
import checkPresetLogic from "./Tests/checkPresets";
import { setupSpawns } from "./SpawnZoneChanges/setupSpawn";
import { saveToFile } from "./utils";
import { deleteBotSpawn, updateAllBotSpawns } from "./Spawns/updateUtils";
import { BotSpawns } from "./Spawns";

class Moar implements IPostSptLoadMod, IPreSptLoadMod, IPostDBLoadMod {
  preSptLoad(container: DependencyContainer): void {
    if (enableBotSpawning) {
      setupRoutes(container);
      // Object.keys(BotSpawns).forEach((map) => {
      //   BotSpawns[map] = BotSpawns[map].map(({ x, y, z }) => ({
      //     x,
      //     y: y + 0.4,
      //     z,
      //   }));
      // });
      // updateAllBotSpawns(BotSpawns);
    }
  }

  postDBLoad(container: DependencyContainer): void {
    if (enableBotSpawning) {
      setupSpawns(container);
    }
  }

  postSptLoad(container: DependencyContainer): void {
    if (enableBotSpawning) {
      checkPresetLogic(container);
      globalValues.baseConfig = config;
      globalValues.overrideConfig = {};
      const logger = container.resolve<ILogger>("WinstonLogger");
      logger.info(
        "\n[MOAR]: Starting up, may the bots ever be in your favour!"
      );
      buildWaves(container);
    }
  }
}

module.exports = { mod: new Moar() };
