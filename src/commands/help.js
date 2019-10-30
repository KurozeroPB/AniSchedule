const Command = require("../structures/Command");

class Help extends Command {
    constructor() {
        super("help");
        this.description = "Prints out all available commands with a short description.";
    }

    async run(message, args, client, data) {
        const embed = {
            title: "WeebSchedule Commands",
            author: {
                name: "AniSchedule",
                url: "https://anilist.co",
                icon_url: client.user.avatarURL
            },
            color: 4044018,
            description: "[Author](https://anilist.co/user/TehNut/)\nCommands must be prefixed by `" + process.env.COMMAND_PREFIX + "`",
            footer: {
                text: "BETA"
            },
            fields: []
        };

        client.commands.forEach((v) => embed.fields.push({ name: v.name, value: v.description, inline: true }));

        message.channel.createMessage({ embed });
    }
}

module.exports = Help;