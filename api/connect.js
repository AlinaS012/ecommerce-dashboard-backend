const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://alinasmehdi:GcBY3BN59PzotKKS@cluster0.yx0b1e9.mongodb.net/Ecommerce?retryWrites=true&w=majority&appName=Cluster0"
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true, 
};

let client;
let clientPromise;


if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

module.exports = clientPromise;
