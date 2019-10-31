import { Client, Message } from "eris";
import { IDataGuild } from "src/interfaces/IData";

export default class CommandHandler {
    public client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async handleCommand(msg: Message, serverData: IDataGuild): Promise<any> {
        const parts = msg.content.split(" ");
        const name = parts[0].slice((process.env.COMMAND_PREFIX || "").length);

        const command = this.client.commands.find((cmd) => cmd.name === name);
        if (!command) return null; // Command doesn't exist

        const args = parts.splice(1);
        try {
            return await command.run(msg, args, this.client, serverData);
        } catch (error) {
            console.error(error);
            try {
                await msg.channel.createMessage({
                    embed: {
                        color: 0xDC143C,
                        description: error.toString()
                    }
                });
            } catch (e) {}
            return null;
        }
    }
}
