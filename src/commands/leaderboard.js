const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getTopSalesmen } = require('../controllers/dbController');

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
        .setName('topverkopers')
        .setDescription('Toon de top 5 verkopers'),
    async execute(interaction) {
        const topSalesmen = await getTopSalesmen();
        if (topSalesmen.length === 0) {
            return interaction.reply('Geen verkoopgegevens beschikbaar.');
        }

        const leaderboard = topSalesmen.map((salesman, index) => {
            return `${index + 1}. <@${salesman._id}> - ${formatNumber(salesman.totalSales)}`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('Top 5 Verkopers')
            .setDescription(leaderboard)
            .setColor(0x00AE86);

        interaction.reply({ embeds: [embed] });
    }
};