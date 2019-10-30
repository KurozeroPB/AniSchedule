const Command = require("../structures/Command");

class Unwatch extends Command {
    constructor() {
        super("unwatch");
        this.description = "Removes an anime from the list. Whatever channel this is used in is the channel the announcements will be made in."
        + (this.getPermissionString() ? " " + this.getPermissionString() : "")
        + "\nYou may provide an AniList entry link, a direct AniList media ID, or a MyAnimeList link.";
    }

    async run(message, args, client, data) {
        if (!this.checkModifyPermission(message)) {
            message.addReaction("👎");
            return;
        }


        const channelData = data[message.channel.id];
        if (!channelData || !channelData.shows || channelData.shows.length === 0) {
            message.addReaction("🤷");

            return;
        }

        const watchId = await this.getMediaId(args[0]);
        if (!watchId || !channelData.shows.includes(watchId)) {
            message.addReaction("👎");

            return;
        }
        channelData.shows = channelData.shows.filter(id => id !== watchId);
        data[message.channel.id] = channelData;
        message.addReaction("👍");

        return data;
    }
}

module.exports = Unwatch;