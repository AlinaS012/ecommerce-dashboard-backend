const clientPromise = require('./connect.js')

module.exports = async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db();
    const products = db.collection('products');

    const data = await products.find({}).toArray();

    res.status(200).json(data);
  } catch (err) {
    console.log("Fetch products error:", err)
    res.status(500).json({ error: err });
  }
}
