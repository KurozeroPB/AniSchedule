import RealCommand from "../../structures/Command";
import { Collection as RealCollection } from "@kurozero/collection";

declare module "eris" {
    interface Client {
        commands: RealCollection<RealCommand>;
    }

    interface Channel {
        isGuildChannel: boolean;
        isDMChannel: boolean;
    }

    interface User {
        tag: string;
    }

    interface Member {
        tag: string;
    }
}
