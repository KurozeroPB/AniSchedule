import Command from "../structures/Command";
import { Message, Client } from "eris";
import { IDataGuild } from "../interfaces/IData";

export default class Watch extends Command {
    public description: string;

    constructor() {
        super("watch");
        this.description = `Adds a new anime to watch for new episodes of. Whatever channel this is used in is the channel the announcements will be made in.${this.getPermissionString() ? ` ${this.getPermissionString()}` : ""}\nYou may provide an AniList entry link, a direct AniList media ID, or a MyAnimeList link.`;
    }

    async run(message: Message, args: string[], _client: Client, data: IDataGuild): Promise<IDataGuild | undefined> {
        if (!this.checkModifyPermission(message)) {
            message.addReaction("👎");
            return;
        }


        const channelData = data[message.channel.id] || { shows: [] };
        const watched = channelData.shows || [];

        const watchId = await this.getMediaId(args[0]);
        if (!watchId || watched.includes(watchId)) {
            message.addReaction("👎");
            return;
        }
        watched.push(watchId);
        channelData.shows = watched;
        data[message.channel.id] = channelData;
        message.addReaction("👍");
        return data;
    }
}
