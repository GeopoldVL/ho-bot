const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const { saveDeal } = require('../controllers/dbController');

const units = {
    K: 1e3,
    M: 1e6
};

function parsePrice(price) {
    if (!price) {
        throw new Error('Price is required');
    }
    const match = price.match(/^(\d+(\.\d+)?)([KM])$/i);
    if (match) {
        const value = parseFloat(match[1]);
        const unit = match[3].toUpperCase();
        return value * units[unit];
    }
    return parseFloat(price);
}

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
        .setName('deal')
        .setDescription('Registreer een nieuwe deal')
        .addStringOption(option =>
            option.setName('klant')
                .setDescription('De naam van de klant')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('items')
                .setDescription('De items die verkocht zijn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('totale_prijs')
                .setDescription('De totale prijs van de deal')
                .setRequired(true)),
    async execute(interaction) {
        const klant = interaction.options.getString('klant');
        const items = interaction.options.getString('items');
        const totalePrijsInput = interaction.options.getString('totale_prijs');

        let totalePrijs;
        try {
            totalePrijs = parsePrice(totalePrijsInput);
        } catch (error) {
            return interaction.reply('Ongeldige prijs ingevoerd. Gebruik een getal gevolgd door K of M, bijvoorbeeld 1K of 1M.');
        }

        const deal = {
            DateTime: new Date(), 
            salesman: interaction.user.id,
            customer: klant,
            items: items,
            price: totalePrijs
        };

        const embed = new EmbedBuilder()
            .setTitle('Nieuwe Deal')
            .addFields(
                { name: 'Datum en tijd', value: moment(deal.DateTime).tz('Europe/Brussels').format('YYYY-MM-DD HH:mm:ss') }, // Convert to Belgian time
                { name: 'Verkoper', value: `<@${deal.salesman}>` },
                { name: 'Klant', value: deal.customer },
                { name: 'Items', value: deal.items },
                { name: 'Verkoopprijs', value: formatNumber(deal.price.toString()) }
            )
            .setColor(0x00AE86);

        await saveDeal(deal);

        interaction.reply({ embeds: [embed] });

        return deal;
    }
};