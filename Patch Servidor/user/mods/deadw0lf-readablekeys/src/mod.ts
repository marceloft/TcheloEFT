import { DependencyContainer } from "tsyringe";

import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { InstanceManager } from "./Refs/InstanceManager";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { IProps } from "@spt/models/eft/common/tables/ITemplateItem";

class ReadableKeys implements IPreSptLoadMod, IPostDBLoadMod {

    private mod = require("../package.json");
    private modLabel = `[${this.mod.name}@${this.mod.version}]`;
    private instance: InstanceManager = new InstanceManager();
    private modConfig = require("../config/config.json");//mapWithKeys
    private mapWithKeys = require("../config/mapWithKeys.json");
    public preSptLoad(container: DependencyContainer): void {
        this.instance.preSptLoad(container, "Redable Keys");
    }

    postDBLoad(container: DependencyContainer): void {
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const tables: IDatabaseTables = databaseServer.getTables();
        const items = Object.values(tables.templates.items);
        const locales = tables.locales.global;
        const mapWithItems = this.mapWithKeys as Record<string, string[]>;

        const logger = container.resolve<ILogger>("WinstonLogger");
        // logger.log(`${this.modLabel} Loading....`, LogTextColor.GREEN)

        for (const item in items) {
            const itemProps = items[item]._props;
            const itemId = items[item]._id;
            const itemNameLocal = `${locales["en"][`${itemId} Name`]}`;

            if (this.isModifiable(items[item]._parent)) {
                if (this.modConfig.config[itemId]) {
                    const mapName = this.findMapForItem(itemNameLocal, mapWithItems, logger);
                    if (mapName) {
                        this.updateShortName(itemId, itemProps, mapName, locales, logger);
                        this.updateUsageCount(itemId, itemProps);
                    }
                }
            }

        }
        logger.log(`${this.modLabel} Load Successful...`, LogTextColor.GREEN);
    }

    updateUsageCount(itemId: string, itemProps: IProps) {
        if (!this.modConfig.changeNoOfUse) return;
        itemProps.MaximumNumberOfUsage = this.modConfig.config[itemId]?.noofuse ? this.modConfig.config[itemId]?.noofuse : itemProps.MaximumNumberOfUsage;
        if (this.modConfig.keyUsageMultiplier > 0) {
            itemProps.MaximumNumberOfUsage = itemProps.MaximumNumberOfUsage * this.modConfig.keyUsageMultiplier;
        }
    }

    updateShortName(itemId: string, itemProps: IProps, mapName: string, locales: Record<string, Record<string, string>>, logger: ILogger) {
        if (!this.modConfig.changeShortName) return;
        itemProps.ShortName = `${mapName}: ${itemProps.ShortName}`;
        const newShortName = mapName !== 'RESERVE' ? this.modConfig.prefix[mapName] + "-" + locales[this.modConfig.locales][`${itemId} ShortName`] : locales[this.modConfig.locales][`${itemId} ShortName`];
        locales[this.modConfig.locales][`${itemId} ShortName`] = newShortName;
        locales[this.modConfig.locales][`${itemId} Name`] = mapName + ": " + locales[this.modConfig.locales][`${itemId} Name`];
        locales[this.modConfig.locales][`${itemId} Description`] = mapName + ": " + locales[this.modConfig.locales][`${itemId} Description`];
    }

    findMapForItem(itemName: string, mapWithItems: Record<string, string[]>, logger: ILogger): string | null {
        for (const [mapName, items] of Object.entries(mapWithItems)) {
            if (items.includes(itemName)) {
                return mapName;
            }
        }
        return null;
    }

    isModifiable(_parent: string) {
        return _parent == BaseClasses.KEY_MECHANICAL || _parent == BaseClasses.KEYCARD;
    }
}

export const mod = new ReadableKeys();

