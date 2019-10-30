const Command = require("../structures/Command");

class Cleanup extends Command {
    constructor() {
        super("cleanup");
        this.description = "Purges any completed shows from this channel's watch list.";
    }

    async run(message, args, client, data) {
        const channelData = data[message.channel.id];
        if (!channelData || !channelData.shows || channelData.shows.length === 0) {
            message.addReaction("👎");
            return;
        }

        await handlePage();

        const finished = [];
        async function handlePage(page = 0) {
            const res = await query(requireText("./query/Watching.graphql", require), { watched: channelData.shows, page });
            res.data.Page.media.filter((e) => e.status === "FINISHED").forEach(e => finished.push(e));
            if (res.data.Page.pageInfo.hasNextPage)
                await handlePage(res.data.Page.pageInfo.currentPage + 1);
        }

        finished.forEach((e) => {
            while (channelData.shows[channelData.shows.indexOf(e.id)])
                delete channelData.shows[channelData.shows.indexOf(e.id)];
        });

        message.channel.createMessage(`Removed ${finished.length} shows from the list.`);

        data[message.channel.id] = channelData;
        message.addReaction("👍");

        return data;
    }
}

module.exports = Cleanup;