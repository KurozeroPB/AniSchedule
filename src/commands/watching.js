const Command = require("../structures/Command");
const { query, requireText } = require("../util");

class Watching extends Command {
    constructor() {
        super("watching");
        this.description = "Prints a list of all anime names being watched that are still currently airing.";
    }

    async run(message, args, client, data) {
        const self = this;
        
        const channelData = data[message.channel.id];
        if (!channelData || !channelData.shows || channelData.shows.length === 0) {
            message.react("👎");
            return;
        }


        await handleWatchingPage(0);

        async function handleWatchingPage(page) {
            const res = await query(requireText("../query/Watching.graphql", require), { watched: channelData.shows, page });
            let description = "";
            res.data.Page.media.forEach(m => {
                if (m.status !== "RELEASING")
                    return;

                const nextLine = `\n- [${m.title.romaji}](${m.siteUrl}) (\`${m.id}\`)`;
                if (1000 - description.length < nextLine.length) {
                    self.sendWatchingList(description, message.channel);
                    console.log(description.length);
                    description = "";
                }

                description += nextLine;
            });
            if (description.length !== 0)
                self.sendWatchingList(description, message.channel);

            if (res.data.Page.pageInfo.hasNextPage) {
                await handleWatchingPage(res.data.Page.pageInfo.currentPage + 1);
                return;
            }
            if (description.length === 0)
                message.channel.send("No currently airing shows are being announced.");
        }
    }

    sendWatchingList(description, channel) {
        const embed = {
            title: "Current announcements ",
            color: 4044018,
            author: {
                name: "AniList",
                url: "https://anilist.co",
                icon_url: "https://anilist.co/img/logo_al.png"
            },
            description
        };
        channel.send({ embed });
    }
}

module.exports = Watching;