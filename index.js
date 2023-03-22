const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();
const SSLCommerzPayment = require("sslcommerz-lts");
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWD;
const is_live = false;

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
    const bookingCollection = client
      .db("JU-cafe")
      .collection("bookingCollection");

    // verify admin user
    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await userCollection.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };
    // verify customer user
    const verifyCustomer = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await userCollection.findOne(query);

      if (user?.role !== "customer") {
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
    // get customers
    app.get("/allCustomer", async (req, res) => {
      const query = { role: "customer" };
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    // check customer
    app.get("/users/customer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isCustomer: user?.role === "customer" });
    });
    // check manager
    app.get("/users/manager/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isManager: user?.role === "manager" });
    });
    // check cashier
    app.get("/users/cashier/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isCashier: user?.role === "cashier" });
    });
    // check deliveryman
    app.get("/users/deliveryman/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isDeliveryMan: user?.role === "deliveryMan" });
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

    // reservations

    app.post("/reservations", async (req, res) => {
      const reservationInfo = req.body;
      const result = await bookingCollection.insertOne(reservationInfo);
      res.send(result);
    });

    //  all reservation of a particular user
    app.get("/reservations", async (req, res) => {
      const email = req.query.email;

      const query = {
        customerEmail: email,
      };

      // console.log(query);
      const orders = await bookingCollection.find(query).toArray();
      res.send(orders);
    });




    app.delete("/reservation/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reservationCollection.deleteOne(query);
      res.send(result);
    });

    // food order

    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.send(result);
    });


//sslcommerz init
app.post('/init',async (req, res) => {
  const order=req.body;

  const bookingInfo = await bookingCollection.findOne({_id:new ObjectId(order.id)})

  console.log(bookingInfo)
  const data = {
      total_amount: 100,
      currency: 'BDT',
      tran_id: 'REF123', // use unique tran_id for each api call
      success_url: 'http://localhost:3030/success',
      fail_url: 'http://localhost:3030/fail',
      cancel_url: 'http://localhost:3030/cancel',
      ipn_url: 'http://localhost:3030/ipn',
      shipping_method: 'Courier',
      product_name: 'Computer.',
      product_category: 'Electronic',
      product_profile: 'general',
      cus_name: 'Customer Name',
      cus_email: 'customer@example.com',
      cus_add1: 'Dhaka',
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01711111111',
      cus_fax: '01711111111',
      ship_name: 'Customer Name',
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
  };
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
  sslcz.init(data).then(apiResponse => {
      // Redirect the user to payment gateway
      let GatewayPageURL = apiResponse.GatewayPageURL
      res.redirect(GatewayPageURL)
      console.log('Redirecting to: ', GatewayPageURL)
  });
})

    

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
