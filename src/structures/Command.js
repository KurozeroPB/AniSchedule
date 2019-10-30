const alIdRegex = /anilist\.co\/anime\/(.\d*)/;
const malIdRegex = /myanimelist\.net\/anime\/(.\d*)/;

class Command {
    /**
     * 
     * @param {string} name
     */
    constructor(name) {
        this._key = name;
        this.name = name;
    }

    async run(msg, args, client, serverData) {}

    checkModifyPermission(message) {
        switch (process.env.PERMISSION_TYPE) {
            case "CHANNEL_MANAGER":
                return message.channel.permissionsFor(message.author).has("MANAGE_CHANNELS");
            case "SERVER_OWNER":
                return message.author.id === message.guild.ownerID;
            default:
                return true;
        }
    }

    getPermissionString() {
        switch (process.env.PERMISSION_TYPE) {
            case "CHANNEL_MANAGER":
                return "Requires the Channel Manager permission.";
            case "SERVER_OWNER":
                return "May only be used by the server owner.";
            default:
                return null;
        }
    }

    async getMediaId(input) {
        // First we try directly parsing the input in case it's the standalone ID
        const output = parseInt(input);
        if (output)
            return output;
    
        // If that fails, we try parsing it with regex to pull the ID from an AniList link
        let match = alIdRegex.exec(input);
        // If there's a match, parse it and return that
        if (match)
            return parseInt(match[1]);
    
        // If that fails, we try parsing it with another regex to get an ID from a MAL link
        match = malIdRegex.exec(input);
        // If we can't find a MAL ID in the URL, just return null;
        if (!match)
            return null;
    
        const res =  await query("query($malId: Int){Media(idMal:$malId){id}}", { malId: match[1] });
        if (res.errors) {
            console.log(JSON.stringify(res.errors));
            return;
        }
    
        return res.data.Media.id;
    }
}

module.exports = Command;