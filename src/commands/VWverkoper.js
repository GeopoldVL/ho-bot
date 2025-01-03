const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getTotalSalesBySalesman } = require('../controllers/dbController');

function formatNumber(num) {
    if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'M';
    }
    if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toString();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('totaleverkoop')
        .setDescription('Bekijk de totale verkoop van een verkoper')
        .addUserOption(option =>
            option.setName('verkoper')
                .setDescription('De verkoper waarvan je de totale verkoop wilt zien')
                .setRequired(true)),
    async execute(interaction) {
        const verkoper = interaction.options.getUser('verkoper');
        const totalSales = await getTotalSalesBySalesman(verkoper.id);

        const embed = new EmbedBuilder()
            .setTitle(`Totale verkoop van verkoper ${verkoper.displayName}`)
            .setDescription(`**Totale verkoop:** ${formatNumber(totalSales)}`)
            .setColor(0x00AE86);

        interaction.reply({ embeds: [embed] });
    }
};