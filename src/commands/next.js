const Command = require("../structures/Command");
const { getFromNextDays, getAnnouncementEmbed, query, requireText } = require("../util");

class Next extends Command {
    constructor() {
        super("next");
        this.description = "Displays the next anime to air (in the next 7 days) that the current channel is watching.";
    }

    async run(message, args, client, data) {
        const channelData = data[message.channel.id];
        if (!channelData || !channelData.shows || channelData.shows.length === 0) {
            message.react("👎");
            return;
        }


        const res = await query(requireText("../query/Schedule.graphql", require), { page: 0, watched: channelData.shows, nextDay: Math.round(getFromNextDays(7).getTime() / 1000) });
        if (res.errors) {
            console.log(JSON.stringify(res.errors));

            return;
        }

        if (res.data.Page.airingSchedules.length === 0) {
            message.react("👎");

            return;
        }

        const anime = res.data.Page.airingSchedules[0];
        const embed = getAnnouncementEmbed(anime, new Date(anime.airingAt * 1000), true);
        message.channel.send({ embed });
    }
}

module.exports = Next;