const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const { connectToDatabase } = require('./controllers/dbController');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} is ready for use!`);

    await connectToDatabase();

    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    const commands = client.commands.map(command => command.data.toJSON());

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('✅ Loaded commands!');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.guildId !== process.env.GUILD_ID) {
        return interaction.reply({ content: 'This bot is not authorized to work in this server.', ephemeral: true });
    }

    const allowedChannelIds = process.env.ALLOWED_CHANNEL_IDS.split(',').map(id => id.trim());
    if (!allowedChannelIds.includes(interaction.channelId)) {
        return interaction.reply({ content: 'This bot is not authorized to work in this channel.', ephemeral: true });
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(process.env.TOKEN);