const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

// verify token

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  // console.log(token)
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET_KEY,
    function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: "Forbidden access" });
      }
      req.decoded = decoded;

      next();
    }
  );
}

// run function
async function run() {
  try {
    await client.connect();
    const businessCollection = client
      .db("best_tools_parts")
      .collection("business_summary");
    const userCollection = client.db("best_tools_parts").collection("users");
    const toolCollection = client.db("best_tools_parts").collection("tools");
    const reviewCollection = client.db("best_tools_parts").collection("review");
    const orderCollection = client.db("best_tools_parts").collection("order");

    // all users show ui on admin page
    app.get("/users", verifyJWT, async (req, res) => {
      const query = {};
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    // user info put api
    app.put("/user/:email", async (req, res) => {
      const userEmail = req.params.email;
      const user = req.body;
      const filter = { userEmail: userEmail };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        {
          userEmail: userEmail,
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: "1d" }
      );
      res.send({ result, token });
    });

    // get admin
    app.get("/admin/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { userEmail: userEmail };
      const user = await userCollection.findOne(query);
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    // user Make a admin api
    app.put("/user/admin/:email", verifyJWT, async (req, res) => {
      const userEmail = req.params.email;

      // if a admin
      const requester = req.decoded.userEmail;
      const requesterAccount = await userCollection.findOne({
        userEmail: requester,
      });
      if (requesterAccount.role === "admin") {
        const filter = { userEmail: userEmail };
        const updateDoc = {
          $set: { role: "admin" },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      }
      else{
        res.status(403).send({message: "forbidden"})
      }
    });

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


    // tool post in api
    app.post("/tool",verifyJWT, async(req, res)=>{
      const tool = req.body;
      const result = await toolCollection.insertOne(tool)
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

    // order summary post
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // order summary get user email
    app.get("/orders", verifyJWT, async (req, res) => {
      const userEmail = req.query.userEmail;
      // here access verifyJWT token
      const decodedEmail = req.decoded.userEmail;
      if (userEmail === decodedEmail) {
        const query = { userEmail: userEmail };
        const result = await orderCollection.find(query).toArray();
        return res.send(result);
      } else {
        return res.status(403).send({ message: "forbidden access" });
      }
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
