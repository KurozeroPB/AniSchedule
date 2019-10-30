require("dotenv").config();
const fs = require("fs");
const CommandLoader = require("./structures/CommandLoader");
const CommandHandler = require("./structures/CommandHandler");
const { Client } = require("discord.js");
const { getAnnouncementEmbed, getFromNextDays, query, requireText } = require("./util");

const client = new Client();
const commandLoader = new CommandLoader();
const commandHandler = new CommandHandler(client);

const commandPrefix = process.env.COMMAND_PREFIX || "!";
const dataFile = "./data.json";
let data = {};
let ready = false;

client.on("ready", async () => {
    if (!ready) {
        console.log(`Logged in as ${client.user.tag}`);

        if (fs.existsSync(dataFile)) {
            data = JSON.parse(fs.readFileSync(dataFile));
        } else {
            fs.writeFileSync(dataFile, JSON.stringify({}));
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

client.on("message", async (msg) => {
    if (!ready) return; // Bot not ready yet
    if (!msg.guild) return;
    if (!msg.author) return;
    if (msg.author.bot) return;
    if (msg.author.discriminator === "0000") return; // Probably a webhook

    if (msg.content.startsWith(commandPrefix)) {
        const serverData = data[msg.guild.id] || {};
        const ret = await commandHandler.handleCommand(msg, serverData);
        if (ret) {
            data[msg.guild.id] = ret;
            fs.writeFileSync(dataFile, JSON.stringify(data));
        }
    }
});

client.login(process.env.BOT_TOKEN);

function handleSchedules(time, page) {
    query(requireText("./query/Schedule.graphql", require), { page: page, watched: getAllWatched(), nextDay: time }).then((res) => {
        if (res.errors) {
            console.log(JSON.stringify(res.errors));
            return;
        }

        res.data.Page.airingSchedules.forEach(e => {
            const date = new Date(e.airingAt * 1000);
            console.log(`Scheduling announcement for ${e.media.title.romaji} on ${date}`);
            setTimeout(() => makeAnnouncement(e, date), e.timeUntilAiring * 1000);
        });

        // Gather any other pages
        if (res.data.Page.pageInfo.hasNextPage)
            handleSchedules(time, res.data.Page.pageInfo.currentPage + 1);
    });
}

function getAllWatched() {
    const watched = [];
    Object.values(data).forEach(server => {
        Object.values(server).filter(c => c.shows).forEach(c => c.shows.forEach(s => watched.push(s)));
    });
    return watched.flat();
}

function makeAnnouncement(entry, date, upNext = false) {
    const embed = getAnnouncementEmbed(entry, date, upNext);

    Object.values(data).forEach(serverData => {
        Object.entries(serverData).forEach(([channelId, channelData]) => {
            if (!channelData.shows || channelData.shows.length === 0)
                return;

            if (channelData.shows.includes(entry.media.id)) {
                const channel = client.channels.find(v => v.id === channelId);
                if (channel) {
                    console.log(`Announcing episode ${entry.media.title.romaji} to ${channel.guild.name}@${channel.id}`);
                    channel.send({ embed });
                }
            }
        });
    });
}

const express = require("express");
const http = require("http");
const app = express();

app.use(express.static("public"))
app.listen(process.env.PORT, () => {
    //console.log(`Your app is listening on port ${listener.address().port}`)
})

app.get("/", (request, response) => {
    response.sendStatus(200);
});

setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
