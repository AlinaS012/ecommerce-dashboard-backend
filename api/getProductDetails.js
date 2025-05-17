// const clientPromise = require('./connect.js')

// module.exports = async (req, res) => {
//     try {
//         const client = await clientPromise;
//         const db = client.db();
//         const products = db.collection('products').aggregate([
//             {
//                 $lookup: {
//                     from: "inventories",
//                     localField: "asin",
//                     foreignField: "asin",
//                     as: "inventory_info"
//                 }
//             },
//             {
//                 $unwind: "$inventory_info"
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     asin: 1,
//                     product_title: 1,
//                     product_price: 1,
//                     product_original_price: 1,
//                     currency: 1,
//                     product_star_rating: 1,
//                     product_num_ratings: 1,
//                     product_url: 1,
//                     product_photo: 1,
//                     product_num_offers: 1,
//                     product_minimum_offer_price: 1,
//                     is_best_seller: 1,
//                     is_amazon_choice: 1,
//                     is_prime: 1,
//                     climate_pledge_friendly: 1,
//                     sales_volume: 1,
//                     delivery: 1,
//                     has_variations: 1,
//                     product_badge: 1,
//                     inventory: {
//                         stock_level: "$inventory_info.stock_level",
//                         low_inventory_threshold: "$inventory_info.low_inventory_threshold",
//                         restock_recommended: "$inventory_info.restock_recommended"
//                     }
//                 }
//             }
//         ]).toArray();

//         res.status(200).json(products);
//     } catch (err) {
//         console.log("Fetch products error:", err)
//         res.status(500).json({ error: err });
//     }
// }

const clientPromise = require('./connect.js');

module.exports = async (req, res) => {
    try {
        const { search = "", sort = "asc" } = req.query;

        const client = await clientPromise;
        const db = client.db();

        const products = await db.collection('products').aggregate([
            {
                $lookup: {
                    from: "inventories",
                    localField: "asin",
                    foreignField: "asin",
                    as: "inventory_info"
                }
            },
            {
                $unwind: "$inventory_info"
            },
            // {
            //     $addFields: {
            //         product_price_number: {
            //             $toDouble: {
            //                 $replaceAll: {
            //                     input: "$product_price",
            //                     find: "$",
            //                     replacement: ""
            //                 }
            //             }
            //         }
            //     }
            // },
            {
                $match: {
                    $or: [
                        { product_title: { $regex: search, $options: "i" } },
                        { product_price: { $regex: search, $options: "i" } },
                        { delivery: { $regex: search, $options: "i" } }
                    ]
                }
            },
            {
                $sort: {
                    product_price_number: sort === "desc" ? -1 : 1
                }
            },
            {
                $project: {
                    _id: 1,
                    asin: 1,
                    product_title: 1,
                    product_price: 1,
                    product_original_price: 1,
                    currency: 1,
                    product_star_rating: 1,
                    product_num_ratings: 1,
                    product_url: 1,
                    product_photo: 1,
                    product_num_offers: 1,
                    product_minimum_offer_price: 1,
                    is_best_seller: 1,
                    is_amazon_choice: 1,
                    is_prime: 1,
                    climate_pledge_friendly: 1,
                    sales_volume: 1,
                    delivery: 1,
                    has_variations: 1,
                    product_badge: 1,
                    // product_price_number: 1,
                    inventory: {
                        stock_level: "$inventory_info.stock_level",
                        low_inventory_threshold: "$inventory_info.low_inventory_threshold",
                        restock_recommended: "$inventory_info.restock_recommended"
                    }
                }
            }
        ]).toArray();

        res.status(200).json(products);
    } catch (err) {
        console.error("Fetch products error:", err);
        res.status(500).json({ error: err.message });
    }
};
