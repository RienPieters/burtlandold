const { Client, GatewayIntentBits, Collection} = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const db = require('./db');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
})
client.commands = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync('./src/functions');
for (const folder of functionFolders) {
    const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter(file => file.endsWith('.js'));
    for (const file of functionFiles) 
    require(`./functions/${folder}/${file}`)(client, db);
    }

const token = process.env.DISCORD_TOKEN;



client.handleEvents();
client.handleCommands();
client.login(token);