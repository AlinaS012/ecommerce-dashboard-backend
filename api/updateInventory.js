const clientPromise = require('./connect.js');

module.exports = async (req, res) => {
    try {
        if (req.method !== 'PUT') {
            return res.status(405).json({ error: 'Method Not Allowed. Use PUT.' });
        }
        const client = await clientPromise;
        const db = client.db();

        const { asin } = req.query;
        const {
            stock_level,
            low_inventory_threshold,
            restock_recommended
        } = req.body;

        if (!asin) {
            return res.status(400).json({ error: "ASIN parameter is required." });
        }

        const updateFields = {
            ...(stock_level !== undefined && { stock_level }),
            ...(low_inventory_threshold !== undefined && { low_inventory_threshold }),
            ...(restock_recommended !== undefined && { restock_recommended })
        };

        const result = await db.collection('inventories').updateOne(
            { asin },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "No inventory found with this ASIN." });
        }

        res.status(200).json({
            message: "Inventory updated successfully",
            updatedCount: result.modifiedCount
        });

    } catch (err) {
        console.error("Update inventory error:", err);
        res.status(500).json({ error: err.message });
    }
};
