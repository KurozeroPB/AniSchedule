import Command from "../structures/Command";
import { Message, Client } from "eris";
import { IDataGuild } from "../interfaces/IData";
import { getFromNextDays, getAnnouncementEmbed, query, requireText } from "../util";
import { IScheduleResponse } from "src/interfaces/ISchedule";

export default class Next extends Command {
    public description: string;

    constructor() {
        super("next");
        this.description = "Displays the next anime to air (in the next 7 days) that the current channel is watching.";
    }

    async run(message: Message, args: string[], client: Client, data: IDataGuild): Promise<void> {
        const channelData = data[message.channel.id];
        if (!channelData || !channelData.shows || channelData.shows.length === 0) {
            message.addReaction("👎");
            return;
        }


        const q = await requireText("./query/Schedule.graphql");
        const res = await query(q, { page: 0, watched: channelData.shows, nextDay: Math.round(getFromNextDays(7).getTime() / 1000) }) as IScheduleResponse;
        if (res.errors) {
            console.log(JSON.stringify(res.errors));

            return;
        }

        if (!res.data) return;

        if (res.data.Page.airingSchedules.length === 0) {
            message.addReaction("👎");

            return;
        }

        const anime = res.data.Page.airingSchedules[0];
        const embed = getAnnouncementEmbed(anime, new Date(anime.airingAt * 1000), true);
        message.channel.createMessage({ embed });
    }
}
