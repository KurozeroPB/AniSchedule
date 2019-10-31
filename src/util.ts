import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { EmbedBase } from "eris";
import { ISchedule, IScheduleResponse } from "./interfaces/ISchedule";
import { IWatchingResponse } from "./interfaces/IWatching";

const streamingSites = [
    "Amazon",
    "Crunchyroll",
    "Hidive",
    "Netflix"
];

const rBlockedStreamingSites = [
    "Animelab",
    "Funimation",
    "Viz",
    "Hulu"
];

export function requireText(name: string): string {
    return fs.readFileSync(path.join(__dirname, name), "utf8").toString(); // eslint-disable-line no-sync
}

export async function query(q: string, variables: Record<string|number|symbol, any>): Promise<IScheduleResponse | IWatchingResponse> {
    const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            query: q,
            variables
        })
    });
    return await res.json();
}

export function getFromNextDays(days = 1): Date {
    return new Date(new Date().getTime() + (24 * 60 * 60 * 1000 * days));
}

export function getAnnouncementEmbed(entry: ISchedule, date: Date, upNext = false): EmbedBase {
    let description = `Episode ${entry.episode} of [${entry.media.title.romaji}](${entry.media.siteUrl})${upNext ? " is next." : " started airing / has just aired."}`;
    if (entry.media.externalLinks && entry.media.externalLinks.length > 0) {
        let streamLinks = "";
        let rBlockedstreamLinks = "";
        let multipleSites = false;
        entry.media.externalLinks.forEach((site) => {
            if (streamingSites.includes(site.site)) {
                streamLinks += `${multipleSites ? " | " : ""} [${site.site}](${site.url})`;
                multipleSites = true;
            }
            if (rBlockedStreamingSites.includes(site.site)) {
                rBlockedstreamLinks += `${multipleSites ? " | " : ""} [${site.site}](${site.url})`;
                multipleSites = true;
            }
        });

        if (streamLinks.length > 0) {
            description += `\n\nSimulcast: ${streamLinks}\n(1h~2h para legenda, *geralmente*)`;
        } else if (rBlockedstreamLinks.length > 0) {
            description += `\n\nO Kawaii koto, simulcasts restrito no brasil: ${rBlockedstreamLinks}`;
        } else {
            description += "\n\nAra Ara, nenhum simulcast detectado ou anilist está dormindo.";
        }
    }


    let source = (entry.media.source.length > 0) ? `Source: ${entry.media.source}` : "N/A";
    let studio = (entry.media.studios.edges.length > 0 && entry.media.studios.edges[0].node.name) ? `Studio: ${entry.media.studios.edges[0].node.name}` : "No studio found";

    return {
        color: entry.media.coverImage.color ? parseInt(entry.media.coverImage.color.substr(1), 16) : 5336051,
        thumbnail: {
            url: entry.media.coverImage.large
        },
        author: {
            name: "Anúncio",
            //url: "https://anilist.co",
            icon_url: "https://i.imgur.com/mYFVGLM.png"
        },
        description,
        timestamp: date.toISOString(),
        footer: {
            text: `${source} | ${studio} `
        }
    };
}
