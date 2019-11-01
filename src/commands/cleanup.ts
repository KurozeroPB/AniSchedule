import Command from "../structures/Command";
import { Message, Client } from "eris";
import { IDataGuild, IDataChannel } from "../interfaces/IData";
import { requireText, query } from "../util";
import { IWatchingResponse, IWatchingMedia } from "src/interfaces/IWatching";

export default class Cleanup extends Command {
    public description: string;
    public finished: IWatchingMedia[] = []

    constructor() {
        super("cleanup");
        this.description = "Purges any completed shows from this channel's watch list.";
    }

    async run(message: Message, args: string[], client: Client, data: IDataGuild): Promise<IDataGuild | undefined> {
        const channelData = data[message.channel.id];
        if (!channelData || !channelData.shows || channelData.shows.length === 0) {
            message.addReaction("👎");
            return;
        }

        await this.handlePage(channelData);

        this.finished.forEach((e) => {
            while (channelData.shows[channelData.shows.indexOf(parseInt(e.id))])
                delete channelData.shows[channelData.shows.indexOf(parseInt(e.id))];
        });

        message.channel.createMessage(`Removed ${this.finished.length} shows from the list.`);

        data[message.channel.id] = channelData;
        message.addReaction("👍");

        return data;
    }

    async handlePage(channelData: IDataChannel, page = 0): Promise<void> {
        const q = await requireText("./query/Watching.graphql");
        const res = await query(q, { watched: channelData.shows, page }) as IWatchingResponse;
        if (!res.data) return;

        res.data.Page.media.filter((e) => e.status === "FINISHED").forEach((e) => this.finished.push(e));
        if (res.data.Page.pageInfo.hasNextPage)
            await this.handlePage(channelData, res.data.Page.pageInfo.currentPage + 1);
    }
}
