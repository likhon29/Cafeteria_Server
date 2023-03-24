const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const SSLCommerzPayment = require("sslcommerz-lts");
require("dotenv").config();
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = false;
console.log(store_id, store_passwd, is_live);
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
    // all orders of the system
    app.get("/orders", async (req, res) => {
      const query = {};
      // console.log(query);
      const orders = await ordersCollection.find(query).toArray();
      res.send(orders);
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

    // booking-payment
    app.post("/booking-payment", async (req, res) => {
      const bookingId = req.body;
      const bookingInfo = await bookingCollection.findOne({
        _id: new ObjectId(bookingId),
      });
      const transactionId = new ObjectId().toString();
      const data = {
        total_amount: bookingInfo.price,
        currency: "BDT",
        tran_id: transactionId, // use unique tran_id for each api call
        success_url: `http://localhost:5000/payment/success?transactionId=${transactionId}`,
        fail_url: "http://localhost:3030/fail",
        cancel_url: "http://localhost:3030/cancel",
        ipn_url: "http://localhost:3030/ipn",
        shipping_method: "Courier",
        product_name: "Food Items",
        product_category: "Reservation",
        product_profile: "Regular",
        cus_name: bookingInfo?.customerName,
        cus_email: bookingInfo?.customerEmail,
        cus_add1: bookingInfo?.shippingAddress,
        cus_add2: "JU",
        cus_city: "JU",
        cus_state: "JU",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: bookingInfo?.customerPhone,
        cus_fax: bookingInfo?.customerPhone,
        ship_name: bookingInfo?.customerName,
        // ship_add1: bookingInfo?.shippingAddress,
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };
      console.log(data);
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL;
        console.log(GatewayPageURL);
        res.send({ url: GatewayPageURL });
      });

      // const result = await ordersCollection.insertOne({
      //   ...bookingInfo,
      //   transactionId,
      //   paid: false,
      // });
      // res.send(result);
    });

    app.delete("/reservation/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reservationCollection.deleteOne(query);
      res.send(result);
    });

    // food order

    app.post("/orders", async (req, res) => {
      const order = req.body;

      const transactionId = new ObjectId().toString();
      const data = {
        total_amount: order.price,
        currency: "BDT",
        tran_id: transactionId, // use unique tran_id for each api call
        success_url: `http://localhost:5000/payment/success?transactionId=${transactionId}`,
        fail_url: "http://localhost:3030/fail",
        cancel_url: "http://localhost:3030/cancel",
        ipn_url: "http://localhost:3030/ipn",
        shipping_method: "Courier",
        product_name: "Food Items",
        product_category: "food",
        product_profile: "Regular",
        cus_name: order.customName,
        cus_email: order.customerEmail,
        cus_add1: order.shippingAddress,
        cus_add2: "JU",
        cus_city: "JU",
        cus_state: "JU",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: order.customerPhone,
        cus_fax: order.customerPhone,
        ship_name: order.customerName,
        ship_add1: order.shippingAddress,
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL;
        res.send({ url: GatewayPageURL });
      });

      const result = await ordersCollection.insertOne({
        ...order,
        transactionId,
        paid: false,
      });
      // res.send(result);
    });

    //success route
    app.post("/payment/success", async (req, res) => {
      const { transactionId } = req.query;
      const result = await ordersCollection.updateOne(
        { transactionId },
        { $set: { paid: true, paidAt: new Date() } }
      );

      if (result.modifiedCount > 0) {
        res.redirect(
          `http://localhost:3000/dashboard/payment/success?transactionID=${transactionId}`
        );
      }
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
