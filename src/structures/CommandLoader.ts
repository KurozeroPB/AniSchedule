import Command from "../structures/Command";
import { Collection } from "@kurozero/collection";
import { promises as fs } from "fs";

export default class CommandLoader {
    public commands: Collection<Command>;

    constructor() {
        this.commands = new Collection(Command);
    }

    async load(commandDir: string): Promise<Collection<Command>> {
        const files = await fs.readdir(commandDir);
        for (const file of files) {
            if (file.endsWith(".ts") || file.endsWith(".js")) {
                await this._add(`${commandDir}/${file}`);
            }
        }
        return this.commands;
    }

    async _add(commandPath: string): Promise<void> {
        try {
            const cmd = await import(commandPath);
            const command: Command = new cmd.default();

            if (this.commands.has(command.name)) {
                console.warn(`A command with the name ${command.name} already exists and has been skipped`);
            } else {
                this.commands.add(command);
            }
        } catch (e) {
            console.warn(`${commandPath} - ${e.stack}`);
        }
    }
}
