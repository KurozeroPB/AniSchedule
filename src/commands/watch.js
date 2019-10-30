const Command = require("../structures/Command");

class Watch extends Command {
    constructor() {
        super("watch");
        this.description = "Adds a new anime to watch for new episodes of. Whatever channel this is used in is the channel the announcements will be made in."
        + (this.getPermissionString() ? " " + this.getPermissionString() : "")
        + "\nYou may provide an AniList entry link, a direct AniList media ID, or a MyAnimeList link.";
    }

    async run(message, args, client, data) {
        if (!this.checkModifyPermission(message)) {
            message.react("👎");
            return;
        }


        const channelData = data[message.channel.id] || { shows: [] };
        const watched = channelData.shows || [];

        const watchId = await this.getMediaId(args[0]);
        if (!watchId || watched.includes(watchId)) {
            message.react("👎");
            return;
        }
        watched.push(watchId);
        channelData.shows = watched;
        data[message.channel.id] = channelData;
        message.channel.stopTyping();
        message.react("👍");
        return data;
    }
}

module.exports = Watch;