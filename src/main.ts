import dotenv from "dotenv";
import fs from "fs";
import util from "util";
import express, { Request, Response } from "express";
import http from "http";
import CommandLoader from "./structures/CommandLoader";
import CommandHandler from "./structures/CommandHandler";
import { IData } from "./interfaces/IData";
import { Client, AnyGuildChannel, TextChannel } from "eris";
import { getAnnouncementEmbed, getFromNextDays, query, requireText } from "./util";
import { IPage, ISchedule } from "./interfaces/ISchedule";

import "./structures/Extended";

const existsAsync = util.promisify(fs.exists);

dotenv.config();

const app = express();

const client = new Client(process.env.BOT_TOKEN || "");
const commandLoader = new CommandLoader();
const commandHandler = new CommandHandler(client);

const commandPrefix = process.env.COMMAND_PREFIX || "!";
const dataFile = "./data.json";

let data: IData = {};
let ready = false;

function makeAnnouncement(entry: ISchedule, date: Date, upNext = false): void {
    const embed = getAnnouncementEmbed(entry, date, upNext);

    Object.values(data).forEach((serverData) => {
        Object.entries(serverData).forEach(([channelId, channelData]) => {
            if (!channelData.shows || channelData.shows.length === 0)
                return;

            if (channelData.shows.includes(entry.media.id)) {
                const channel = client.getChannel(channelId) as TextChannel;
                if (channel) {
                    console.log(`Announcing episode ${entry.media.title.romaji} to ${channel.guild.name}@${channel.id}`);
                    channel.createMessage({ embed });
                }
            }
        });
    });
}

function getAllWatched(): number[] {
    const watched: number[] = [];
    Object.values(data).forEach((server) => {
        Object.values(server).filter((c) => c.shows).forEach((c) => c.shows.forEach((s) => watched.push(s)));
    });
    return watched.flat();
}

function handleSchedules(time: number, page?: number): void {
    query(requireText("./query/Schedule.graphql"), { page: page, watched: getAllWatched(), nextDay: time }).then((res) => {
        if (res.errors) {
            console.log(JSON.stringify(res.errors));
            return;
        }

        if (!res.data) return;

        const Page = res.data.Page as IPage;
        Page.airingSchedules.forEach((e) => {
            const date = new Date(e.airingAt * 1000);
            console.log(`Scheduling announcement for ${e.media.title.romaji} on ${date}`);
            setTimeout(() => makeAnnouncement(e, date), e.timeUntilAiring * 1000);
        });

        // Gather any other pages
        if (res.data.Page.pageInfo.hasNextPage)
            handleSchedules(time, res.data.Page.pageInfo.currentPage + 1);
    });
}

client.on("ready", async () => {
    if (!ready) {
        console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`);

        const exists = await existsAsync(dataFile);
        if (exists) {
            const file = await fs.promises.readFile(dataFile, "utf8");
            data = JSON.parse(file);
        } else {
            await fs.promises.writeFile(dataFile, JSON.stringify({}));
        }

        client.commands = await commandLoader.load(`${__dirname}/commands`);

        handleSchedules(Math.round(getFromNextDays().getTime() / 1000)); // Initial run
        setInterval(() => handleSchedules(Math.round(getFromNextDays().getTime() / 1000)), 1000 * 60 * 60 * 24); // Schedule future runs every 24 hours

        ready = true;
    } else {
        console.log("Client reconnected");
    }
});

client.on("error", console.error);

client.on("messageCreate", async (msg) => {
    if (!ready) return; // Bot not ready yet
    if (!msg.channel.isGuildChannel) return;
    if (!msg.author) return;
    if (msg.author.bot) return;
    if (msg.author.discriminator === "0000") return; // Probably a webhook

    if (msg.content.startsWith(commandPrefix)) {
        const channel = msg.channel as AnyGuildChannel;
        const serverData = data[channel.guild.id] || {};
        const ret = await commandHandler.handleCommand(msg, serverData);
        if (ret) {
            data[channel.guild.id] = ret;
            fs.promises.writeFile(dataFile, JSON.stringify(data));
        }
    }
});

client.connect().catch(console.error);

app.use(express.static("public"));
app.listen(process.env.PORT, () => {
    //console.log(`Your app is listening on port ${listener.address().port}`)
});

app.get("/", (request: Request, response: Response) => {
    response.sendStatus(200);
});

setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
