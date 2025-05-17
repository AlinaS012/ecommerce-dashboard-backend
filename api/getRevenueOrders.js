// const clientPromise = require('./connect.js')

// module.exports = async (req, res) => {
//     try {
//         const { cateogory, startDate, endDate } = req.query;
//         const client = await clientPromise;
//         const db = client.db();
//         const sales = db.collection('sales').aggregate([
//             {
//                 $match: {
//                     category: cateogory
//                 }
//             },
//             {
//                 $project: {
//                     category: 1,
//                     asin: 1,
//                     filtered_sales_data: {
//                         $filter: {
//                             input: "$sales_data",
//                             as: "entry",
//                             cond: {
//                                 $and: [
//                                     { $gte: ["$$entry.date", startDate] },
//                                     { $lte: ["$$entry.date", endDate] }
//                                 ]
//                             }
//                         }
//                     }
//                 }
//             },
//             {
//                 $addFields: {
//                     total_sales: {
//                         $sum: {
//                             $map: {
//                                 input: "$filtered_sales_data",
//                                 as: "item",
//                                 in: "$$item.sales"
//                             }
//                         }
//                     },
//                     total_revenue: {
//                         $sum: {
//                             $map: {
//                                 input: "$filtered_sales_data",
//                                 as: "item",
//                                 in: "$$item.revenue"
//                             }
//                         }
//                     }
//                 }
//             }
//         ]).toArray()

//         res.status(200).json(sales);
//     } catch (err) {
//         console.log("Fetch sales error:", err)
//         res.status(500).json({ error: err });
//     }
// }
const clientPromise = require('./connect.js');

module.exports = async (req, res) => {
    try {
        const { category, startDate, endDate } = req.query;

        const client = await clientPromise;
        const db = client.db();

        const matchStage = {};
        if (category) {
            matchStage.category = category;
        }

        const filterConditions = [];
        if (startDate) {
            filterConditions.push({ $gte: ["$$entry.date", startDate] });
        }
        if (endDate) {
            filterConditions.push({ $lte: ["$$entry.date", endDate] });
        }

        const sales = await db.collection('sales').aggregate([
            {
                $match: matchStage
            },
            {
                $project: {
                    category: 1,
                    asin: 1,
                    filtered_sales_data: {
                        $filter: {
                            input: "$sales_data",
                            as: "entry",
                            cond: filterConditions.length > 0 ? { $and: filterConditions } : {}
                        }
                    }
                }
            },
            {
                $addFields: {
                    total_sales: {
                        $sum: {
                            $map: {
                                input: "$filtered_sales_data",
                                as: "item",
                                in: "$$item.sales"
                            }
                        }
                    },
                    total_revenue: {
                        $sum: {
                            $map: {
                                input: "$filtered_sales_data",
                                as: "item",
                                in: "$$item.revenue"
                            }
                        }
                    }
                }
            }
        ]).toArray();

        res.status(200).json(sales);
    } catch (err) {
        console.log("Fetch sales error:", err);
        res.status(500).json({ error: err.message });
    }
};
