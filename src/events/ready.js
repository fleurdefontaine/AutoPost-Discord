const { initMessage, createMain } = require('../utils/menuBuilder');
const { getAllAccounts } = require('../utils/database');

let messageCache = null;

async function updateEmbed(client, forceNewMessage = false) {
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    if (!channel) return;

    try {
        const accounts = await getAllAccounts();
        const embed = initMessage(client, accounts.length);
        const menu = createMain();

        if (!forceNewMessage && messageCache) {
            await messageCache.edit({
                embeds: [embed],
                components: [menu]
            });
            return;
        }

        const messages = await channel.messages.fetch({ limit: 100 });
        const botMessage = messages.find(msg => 
            msg.author.id === client.user.id && 
            msg.embeds.length > 0 &&
            msg.embeds[0].title.includes('Auto Post Discord')
        );

        if (botMessage) {
            await botMessage.edit({
                embeds: [embed],
                components: [menu]
            });
            messageCache = botMessage;
        } else {
            const newMessage = await channel.send({
                embeds: [embed],
                components: [menu]
            });
            messageCache = newMessage;
        }
    } catch (error) {
        console.error('Error managing Auto Post embed:', error);
    }
}

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        await updateEmbed(client, true);

        setInterval(() => updateEmbed(client), 10000);
    }
};
