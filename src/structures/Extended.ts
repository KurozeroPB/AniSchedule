import { Channel, User, Member } from "eris";

Object.defineProperty(Channel.prototype, "isGuildChannel", {
    get: function () {
        switch (this.type) {
            case 0: return true; // TextChannel
            case 2: return true; // VoiceChannel
            case 4: return true; // CategoryChannel
            case 5: return true; // NewsChannel
            case 6: return true; // StoreChannel
            default: return false;
        }
    }
});

Object.defineProperty(Channel.prototype, "isDMChannel", {
    get: function () {
        switch (this.type) {
            case 1: return true;
            default: return false;
        }
    }
});

Object.defineProperty(User.prototype, "tag", {
    get: function () {
        return `${this.username}#${this.discriminator}`;
    }
});

Object.defineProperty(Member.prototype, "tag", {
    get: function () {
        return `${this.username}#${this.discriminator}`;
    }
});
