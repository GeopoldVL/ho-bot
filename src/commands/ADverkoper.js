const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getDealsBySalesman } = require('../controllers/dbController');
const moment = require('moment-timezone');

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
        .setName('deals')
        .setDescription('Toon de 20 meest recente deals van een verkoper')
        .addUserOption(option =>
            option.setName('verkoper')
                .setDescription('De verkoper waarvan je de deals wilt zien')
                .setRequired(true)),
    async execute(interaction) {
        const verkoper = interaction.options.getUser('verkoper');

        const deals = await getDealsBySalesman(verkoper.id);

        if (deals.length === 0) {
            return interaction.reply(`Geen deals gevonden voor verkoper <@${verkoper.id}>.`);
        }

        const dealList = deals.map(deal => {
            return `**Datum:** ${moment(deal.DateTime).tz('Europe/Brussels').format('YYYY-MM-DD HH:mm:ss')}\n**Klant:** ${deal.customer}\n**Items:** ${deal.items}\n**Totale prijs:** ${formatNumber(deal.price)}`;
        }).join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle(`20 meest recente deals van verkoper ${verkoper.username}`)
            .setDescription(dealList)
            .setColor(0x00AE86);

        interaction.reply({ embeds: [embed] });
    }
};