const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const { getSalesData } = require('../controllers/dbController');

function formatNumber(num) {
    if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'M';
    }
    if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toString();
}

function translatePeriod(period) {
    const translations = {
        week: 'week',
        month: 'maand'
    };
    return translations[period] || period;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('overzicht')
        .setDescription('Krijg een verkoopoverzicht voor de laatste week of maand')
        .addStringOption(option =>
            option.setName('periode')
                .setDescription('Periode om het overzicht voor te krijgen')
                .setRequired(true)
                .addChoices(
                    { name: 'Week', value: 'week' },
                    { name: 'Maand', value: 'month' }
                )),
    async execute(interaction) {
        const periode = interaction.options.getString('periode');
        const now = moment().tz('Europe/Brussels');
        const startDate = periode === 'week' ? now.clone().subtract(1, 'weeks').toDate() : now.clone().subtract(1, 'months').toDate();

        const salesData = await getSalesData(startDate, now.toDate());

        if (salesData.totalSales === 0) {
            return interaction.reply('Geen verkoopgegevens beschikbaar voor de geselecteerde periode.');
        }

        const topSalesmen = salesData.topSalesmen.map((salesman, index) => {
            return `${index + 1}. <@${salesman._id}> - ${formatNumber(salesman.totalSales)}`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle(`Verkoopoverzicht van de laatste ${translatePeriod(periode)}`)
            .addFields(
                { name: 'Totale Verkoop', value: formatNumber(salesData.totalSales) },
                { name: 'Top 3 Verkopers', value: topSalesmen }
            )
            .setColor(0x00AE86);

        interaction.reply({ embeds: [embed] });
    }
};