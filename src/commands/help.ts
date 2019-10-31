import Command from "../structures/Command";
import { Message, Client, EmbedBase } from "eris";

export default class Help extends Command {
    public description: string;

    constructor() {
        super("help");
        this.description = "Prints out all available commands with a short description.";
    }

    async run(message: Message, _args: string[], client: Client): Promise<void> {
        const embed: EmbedBase = {
            title: "WeebSchedule Commands",
            author: {
                name: "AniSchedule",
                url: "https://anilist.co",
                icon_url: client.user.avatarURL
            },
            color: 4044018,
            description: `[Author](https://anilist.co/user/KurozeroPB/)\nCommands must be prefixed by \`${process.env.COMMAND_PREFIX}\``,
            footer: {
                text: "BETA"
            },
            fields: []
        };

        client.commands.forEach((v) => (embed.fields || []).push({ name: v.name, value: v.description, inline: true }));

        message.channel.createMessage({ embed });
    }
}
