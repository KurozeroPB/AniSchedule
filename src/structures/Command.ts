import { Client, Message, AnyGuildChannel } from "eris";
import { query } from "../util";
import { IMediaResponse } from "src/interfaces/IMedia";

const alIdRegex = /anilist\.co\/anime\/(.\d*)/u;
const malIdRegex = /myanimelist\.net\/anime\/(.\d*)/u;

export default abstract class Command {
    public _key: string;
    public name: string;
    public abstract description: string;

    constructor(name: string) {
        this._key = name;
        this.name = name;
    }

    abstract async run(msg: Message, args: string[], client: Client, serverData: {}): Promise<any>;

    checkModifyPermission(message: Message): boolean {
        if (message.channel.isGuildChannel) {
            const channel = message.channel as AnyGuildChannel;
            switch (process.env.PERMISSION_TYPE) {
                case "CHANNEL_MANAGER":
                    return channel.permissionsOf(message.author.id).has("manageChannels");
                case "SERVER_OWNER":
                    return message.author.id === channel.guild.ownerID;
                default:
                    return true;
            }
        }
        return false;
    }

    getPermissionString(): string {
        switch (process.env.PERMISSION_TYPE) {
            case "CHANNEL_MANAGER":
                return "Requires the Channel Manager permission.";
            case "SERVER_OWNER":
                return "May only be used by the server owner.";
            default:
                return "";
        }
    }

    async getMediaId(input: string): Promise<number | null> {
        // First we try directly parsing the input in case it's the standalone ID
        const output = parseInt(input);
        if (output) return output;

        // If that fails, we try parsing it with regex to pull the ID from an AniList link
        let match = alIdRegex.exec(input);
        // If there's a match, parse it and return that
        if (match) return parseInt(match[1]);

        // If that fails, we try parsing it with another regex to get an ID from a MAL link
        match = malIdRegex.exec(input);
        // If we can't find a MAL ID in the URL, just return null;
        if (!match) return null;

        const res = await query("query($malId: Int){Media(idMal:$malId){id}}", { malId: match[1] }) as IMediaResponse;
        if (res.errors) {
            console.log(JSON.stringify(res.errors));
            return null;
        }

        return res.data ? res.data.Media.id : null;
    }
}
