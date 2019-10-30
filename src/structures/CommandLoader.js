const Command = require("../structures/Command");
const { Collection } = require("@kurozero/collection");
const { promises: fs } = require("fs");

class CommandLoader {
    constructor() {
        this.commands = new Collection(Command);
    }

    /**
     * Load commands
     * @param {string} commandDir 
     */
    async load(commandDir) {
        const files = await fs.readdir(commandDir);
        for (const file of files) {
            if (file.endsWith(".js")) {
                await this._add(`${commandDir}/${file}`);
            }
        }
        return this.commands;
    }

    /**
     * Add new command
     * @param {string} commandPath 
     */
    async _add(commandPath) {
        try {
            const cmd = require(commandPath);
            const command = new cmd();

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

module.exports = CommandLoader;