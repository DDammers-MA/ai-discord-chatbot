require('dotenv/config');
const { Client, GatewayIntentBits } = require('discord.js');
const { default: OpenAI } = require('openai');



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
