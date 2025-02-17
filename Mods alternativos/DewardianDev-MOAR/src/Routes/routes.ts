import { DependencyContainer } from "tsyringe";
import { buildWaves } from "../Spawning/Spawning";
import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
// import { DynamicRouterModService } from "@spt/services/mod/dynamicRouter/DynamicRouterModService";
import { globalValues } from "../GlobalValues";
import { kebabToTitle } from "../utils";
import PresetWeightingsConfig from "../../config/PresetWeightings.json";
import { Ixyz } from "@spt/models/eft/common/Ixyz";
import {
  deleteBotSpawn,
  updateBotSpawn,
  updatePlayerSpawn,
  updateSniperSpawn,
} from "../Spawns/updateUtils";

export const setupRoutes = (container: DependencyContainer) => {
  const staticRouterModService = container.resolve<StaticRouterModService>(
    "StaticRouterModService"
  );

  interface AddSpawnRequest {
    map: string;
    position: Ixyz;
  }

  staticRouterModService.registerStaticRouter(
    `moarAddBotSpawn`,
    [
      {
        url: "/moar/addBotSpawn",
        action: async (
          url: string,
          overrideConfig: AddSpawnRequest,
          sessionID,
          output
        ) => {
          updateBotSpawn(overrideConfig.map, overrideConfig.position);
          return "success";
        },
      },
    ],
    "moarAddBotSpawn"
  );

  staticRouterModService.registerStaticRouter(
    `moarAddSniperSpawn`,
    [
      {
        url: "/moar/addSniperSpawn",
        action: async (
          url: string,
          overrideConfig: AddSpawnRequest,
          sessionID,
          output
        ) => {
          updateSniperSpawn(overrideConfig.map, overrideConfig.position);
          return "success";
        },
      },
    ],
    "moarAddSniperSpawn"
  );

  staticRouterModService.registerStaticRouter(
    `moarDeleteBotSpawn`,
    [
      {
        url: "/moar/deleteBotSpawn",
        action: async (
          url: string,
          overrideConfig: AddSpawnRequest,
          sessionID,
          output
        ) => {
          deleteBotSpawn(overrideConfig.map, overrideConfig.position);
          return "success";
        },
      },
    ],
    "moarDeleteBotSpawn"
  );

  staticRouterModService.registerStaticRouter(
    `moarAddPlayerSpawn`,
    [
      {
        url: "/moar/addPlayerSpawn",
        action: async (
          url: string,
          overrideConfig: AddSpawnRequest,
          sessionID,
          output
        ) => {
          updatePlayerSpawn(overrideConfig.map, overrideConfig.position);
          return "success";
        },
      },
    ],
    "moarAddPlayerSpawn"
  );

  // Make buildwaves run on game end
  staticRouterModService.registerStaticRouter(
    `moarUpdater`,
    [
      {
        url: "/client/match/local/end",
        action: async (_url, info, sessionId, output) => {
          buildWaves(container);
          return output;
        },
      },
    ],
    "moarUpdater"
  );

  staticRouterModService.registerStaticRouter(
    `moarGetCurrentPreset`,
    [
      {
        url: "/moar/currentPreset",
        action: async () => {
          return globalValues.forcedPreset || "random";
        },
      },
    ],
    "moarGetCurrentPreset"
  );

  staticRouterModService.registerStaticRouter(
    `moarGetAnnouncePreset`,
    [
      {
        url: "/moar/announcePreset",
        action: async () => {
          if (globalValues.forcedPreset?.toLowerCase() === "random") {
            return globalValues.currentPreset;
          }
          return globalValues.forcedPreset || globalValues.currentPreset;
        },
      },
    ],
    "moarGetAnnouncePreset"
  );

  staticRouterModService.registerStaticRouter(
    `getDefaultConfig`,
    [
      {
        url: "/moar/getDefaultConfig",
        action: async () => {
          return JSON.stringify(globalValues.baseConfig);
        },
      },
    ],
    "getDefaultConfig"
  );

  staticRouterModService.registerStaticRouter(
    `getServerConfigWithOverrides`,
    [
      {
        url: "/moar/getServerConfigWithOverrides",
        action: async () => {
          return JSON.stringify({
            ...(globalValues.baseConfig || {}),
            ...(globalValues.overrideConfig || {}),
          });
        },
      },
    ],
    "getServerConfigWithOverrides"
  );

  staticRouterModService.registerStaticRouter(
    `getServerConfigWithOverrides`,
    [
      {
        url: "/moar/getServerConfigWithOverrides",
        action: async () => {
          return JSON.stringify({
            ...globalValues.baseConfig,
            ...globalValues.overrideConfig,
          });
        },
      },
    ],
    "getServerConfigWithOverrides"
  );

  staticRouterModService.registerStaticRouter(
    `moarGetPresetsList`,
    [
      {
        url: "/moar/getPresets",
        action: async () => {
          let result = [
            ...Object.keys(PresetWeightingsConfig).map((preset) => ({
              Name: kebabToTitle(preset),
              Label: preset,
            })),
            { Name: "Random", Label: "random" },
            { Name: "Custom", Label: "custom" },
          ];

          return JSON.stringify({ data: result });
        },
      },
    ],
    "moarGetPresetsList"
  );

  staticRouterModService.registerStaticRouter(
    "setOverrideConfig",
    [
      {
        url: "/moar/setOverrideConfig",
        action: async (
          url: string,
          overrideConfig: typeof globalValues.overrideConfig = {},
          sessionID,
          output
        ) => {
          globalValues.overrideConfig = overrideConfig;

          buildWaves(container);

          return "Success";
        },
      },
    ],
    "setOverrideConfig"
  );

  staticRouterModService.registerStaticRouter(
    "moarSetPreset",
    [
      {
        url: "/moar/setPreset",
        action: async (url: string, { Preset }, sessionID, output) => {
          globalValues.forcedPreset = Preset;
          buildWaves(container);

          return `Current Preset: ${kebabToTitle(
            globalValues.forcedPreset || "Random"
          )}`;
        },
      },
    ],
    "moarSetPreset"
  );
};
