const clientPromise = require('./connect.js')

module.exports = async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
        }
        const client = await clientPromise;
        const db = client.db();

        const {
            asin,
            category,
            product_title,
            product_price,
            product_original_price,
            product_photo,
            delivery,
            stock_level,
            low_inventory_threshold,
            restock_recommended,
        } = req.body;
        if (!asin || !product_title || !product_price) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newProduct = {
            asin,
            product_title,
            product_price,
            product_original_price,
            product_photo,
            delivery,
            createdAt: new Date()
        };

        const result1 = await db.collection('products').insertOne(newProduct);
        const result2 = await db.collection('categories').updateOne(
            { category: category },
            {
                $addToSet: { products: asin }
            }
        );
        const result3 = await db.collection('inventories').insertOne({
            asin, stock_level, restock_recommended, low_inventory_threshold
        })
        res.status(201).json({
            message: "Product added successfully",
            insertedId: result1.insertedId,
            product: newProduct,
            category: result2,
            inventory: result3
        });
    } catch (err) {
        console.log("Fetch products error:", err)
        res.status(500).json({ error: err });
    }
}
