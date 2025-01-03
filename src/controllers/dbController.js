const mongoose = require('mongoose');
const Deal = require('../models/dealModel');

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
    }
}

async function saveDeal(deal) {
    try {
        const newDeal = new Deal(deal);
        await newDeal.save();
        console.log('✅ Deal saved to MongoDB');
    } catch (error) {
        console.error('❌ Error saving deal to MongoDB:', error);
    }
}

async function getTotalSalesBySalesman(salesmanId) {
    try {
        const totalSales = await Deal.aggregate([
            { $match: { salesman: salesmanId } },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);

        return totalSales.length > 0 ? totalSales[0].total : 0;
    } catch (error) {
        console.error('❌ Error calculating total sales:', error);
        return 0;
    }
}

async function getTopSalesmen() {
    try {
        const topSalesmen = await Deal.aggregate([
            { $group: { _id: '$salesman', totalSales: { $sum: '$price' } } },
            { $sort: { totalSales: -1 } },
            { $limit: 5 }
        ]);

        return topSalesmen;
    } catch (error) {
        console.error('❌ Error fetching top salesmen:', error);
        return [];
    }
}
async function getSalesData(startDate, endDate) {
    try {
        const salesData = await Deal.aggregate([
            { $match: { DateTime: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
            { $group: { _id: '$salesman', totalSales: { $sum: '$price' } } },
            { $sort: { totalSales: -1 } }
        ]);

        const totalSales = salesData.reduce((sum, salesman) => sum + salesman.totalSales, 0);
        const topSalesmen = salesData.slice(0, 3);

        return { totalSales, topSalesmen };
    } catch (error) {
        console.error('❌ Error fetching sales data:', error);
        return { totalSales: 0, topSalesmen: [] };
    }
}

async function getDealsBySalesman(salesmanId) {
    try {
        const deals = await Deal.find({ salesman: salesmanId })
            .sort({ DateTime: -1 }) 
            .limit(20); 
        return deals;
    } catch (error) {
        console.error('❌ Error fetching deals by salesman:', error);
        return [];
    }
}

module.exports = {
    connectToDatabase,
    saveDeal,
    getTotalSalesBySalesman,
    getTopSalesmen,
    getSalesData,
    getDealsBySalesman
};