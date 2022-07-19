const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p6gkl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

/* client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
console.log("env file is connected")
  client.close();
}); */

// run function
async function run() {
  try {
    await client.connect();
    const businessCollection = client
      .db("best_tools_parts")
      .collection("business_summary");
    //   console.log("mongo db connected")

    // business summary
    app.get("/business", async (req, res) => {
      const query = {};
      const result = await businessCollection.find(query).toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

// get root port
app.get("/", (req, res) => {
  res.send("Best Tools Parts Project Running Server side");
});

// listen prot
app.listen(port, () => {
  console.log("listen port: ", port);
});
