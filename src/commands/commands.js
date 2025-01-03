const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commands')
        .setDescription('Toon alle beschikbare commando\'s'),
    async execute(interaction) {
        const commands = interaction.client.commands.map(command => command.data.name).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('Beschikbare Commando\'s')
            .setDescription(commands)
            .setColor(0x00AE86);

        interaction.reply({ embeds: [embed] });
    }
};