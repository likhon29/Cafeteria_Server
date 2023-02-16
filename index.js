const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.epizi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const usersCollection = client.db("JU-cafe").collection("userCollection");
    const foodCollection = client.db("JU-cafe").collection("foodCollection");
    const ordersCollection = client
      .db("JU-cafe")
      .collection("ordersCollection");
    const adminCollection = client.db("JU-cafe").collection("adminCollection");

    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await userCollection.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    //get all users

    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });
    // get customer
    app.get("/allCustomer", async (req, res) => {
      const query = { role: "customer" };
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });
    //check admin user
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    // save user info
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // get admin user
    app.get("/admin", async (req, res) => {
      const query = { role: "customer" };
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });
    // create admin
    app.post("/admin", async (req, res) => {
      const user = req.body;
      const result = await adminCollection.insertOne(user);
      res.send(result);
    });
    // get food item list
    app.get("/food", async (req, res) => {
      const query = {};
      const users = await foodCollection.find(query).toArray();
      res.send(users);
    });
    //  all order of a particular user
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      

      const query = {
        customerEmail: email,
      };
      // console.log(query);
      const orders = await ordersCollection.find(query).toArray();
      res.send(orders);
    });
    // get a particular order of user

   
    // food order

    app.post("/orders", async (req, res) => {
      const orders = req.body;

      const result = await ordersCollection.insertOne(orders);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Ju Cafeteria server is running");
});

app.listen(port, () => {
  console.log(`Ju cafe running on port ${port}`);
});
