require('dotenv/config');
const { Client, GatewayIntentBits } = require('discord.js');
const { default: OpenAI } = require('openai');

const fs = require('fs');

const jsonData = fs.readFileSync('data.json', 'utf-8');
const messageObject = JSON.parse(jsonData);


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.on('ready', () => {
    console.log("The bot is online");
});

const openai = new OpenAI({
    apiKey: process.env.API_KEY,
});

let currentMessageIndex = 0;

const interval = 10 * 1000; // 24 hours
setInterval(() => {
    const currentMessageObj = messageObject.messages[currentMessageIndex];
    if (currentMessageObj) {
        const currentMessageKey = Object.keys(currentMessageObj)[0];
        const currentMessage = currentMessageObj[currentMessageKey];

        const channelId = process.env.CHANNEL_ID;
        const channel = client.channels.cache.get(channelId);

        if (channel) {
            channel.send(currentMessage);
        }
        
        currentMessageIndex = (currentMessageIndex + 1) % messageObject.messages.length;
    } else {
        console.error('Error: Messages array is empty or undefined.');
    }
}, interval);


client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== process.env.CHANNEL_ID) return;
    if (message.content.startsWith('!')) return;

    let conversationLog = [{ role: 'user', content: message.content }];

    conversationLog.push({
        role: 'user',
        content: message.content,
    });

    const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
    });

    message.reply(chatCompletion.choices[0].message.content);
});

client.login(process.env.TOKEN);
