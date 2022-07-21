const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const toolCollection = client.db("best_tools_parts").collection("tools");
    const reviewCollection = client.db("best_tools_parts").collection("review");
    const orderCollection = client.db("best_tools_parts").collection("order");

    // tools
    app.get("/tools", async (req, res) => {
      const query = {};
      const result = await toolCollection.find(query).toArray();
      res.send(result);
    });

    // tools id
    app.get("/tool/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await toolCollection.findOne(query);
      res.send(result);
    });

    // update tool quantity
    app.put("/tool/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const avaQuantity = req.body.avaQuantity;
      const updateDoc = {
        $set: {
          avaQuantity: avaQuantity,
        },
      };
      const result = await toolCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // order summary post
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // order summary get user email
    app.get("/orders", async(req,res)=>{
      const userEmail = req.query.userEmail
      const query ={userEmail: userEmail};
      const result = await orderCollection.find(query).toArray()
      res.send(result)
    })

    // review post
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // review get
    app.get("/reviews", async (req, res) => {
      const query = {};
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });

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
