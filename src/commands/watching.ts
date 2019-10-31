import Command from "../structures/Command";
import { Message, Client, TextableChannel } from "eris";
import { IDataGuild, IDataChannel } from "../interfaces/IData";
import { IWatchingResponse } from "src/interfaces/IWatching";
import { query, requireText } from "../util";

export default class Watching extends Command {
    public description: string;

    constructor() {
        super("watching");
        this.description = "Prints a list of all anime names being watched that are still currently airing.";
    }

    async run(message: Message, _args: string[], _client: Client, data: IDataGuild): Promise<void> {
        const channelData = data[message.channel.id];
        if (!channelData || !channelData.shows || channelData.shows.length === 0) {
            message.addReaction("👎");
            return;
        }


        await this.handleWatchingPage(0, channelData, message);
    }

    async handleWatchingPage(page: number, channelData: IDataChannel, message: Message): Promise<void> {
        const res = await query(requireText("./query/Watching.graphql"), { watched: channelData.shows, page }) as IWatchingResponse;
        let description = "";
        if (res.data) {
            res.data.Page.media.forEach((m) => {
                if (m.status !== "RELEASING")
                    return;

                const nextLine = `\n- [${m.title.romaji}](${m.siteUrl}) (\`${m.id}\`)`;
                if (1000 - description.length < nextLine.length) {
                    this.sendWatchingList(description, message.channel);
                    console.log(description.length);
                    description = "";
                }

                description += nextLine;
            });
            if (description.length !== 0)
                this.sendWatchingList(description, message.channel);

            if (res.data.Page.pageInfo.hasNextPage) {
                await this.handleWatchingPage(res.data.Page.pageInfo.currentPage + 1, channelData, message);
                return;
            }
            if (description.length === 0)
                message.channel.createMessage("No currently airing shows are being announced.");
        }
    }

    sendWatchingList(description: string, channel: TextableChannel): void {
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
        channel.createMessage({ embed });
    }
}
