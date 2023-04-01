const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const SSLCommerzPayment = require("sslcommerz-lts");
require("dotenv").config();
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
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
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
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
      const userInfo = req.body;
      const query = { email: userInfo.email };
      const user = await usersCollection.findOne(query);
      if (!user) {
        const result = await usersCollection.insertOne(userInfo);
        res.send(result);
      }
    });

    // get admin user
    app.get("/admin", async (req, res) => {
      const query = { role: "customer" };
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    app.get("/delivery-man", async (req, res) => {
      const query = { role: "deliveryMan" };
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
      const foods = await foodCollection.find(query).toArray();
      res.send(foods);
    });
    app.get("/food/title/:title", async (req, res) => {
      const title = req.params.title;
      const query = { title };
      const foods = await foodCollection.find(query).toArray();
      res.send(foods);
    });

    // get foods by type

    app.get("/food/:type", async (req, res) => {
      const type = req.params.type;
      const query = { type: type };
      const foods = await foodCollection.find(query).toArray();
      res.send(foods);
    });

    //   app.get('/bookingSlots', async (req, res) => {
    //     const date = req.query.date;
    //     const query = {};
    //     const options = ['afternoon','evening']

    //     // get the bookings of the provided date
    //     const bookingQuery = { reservationDate: date }
    //     const alreadyBooked = await bookingCollection.find(bookingQuery).toArray();
    //     console.log(alreadyBooked)
    //     // code carefully :D
    //     options.forEach(option => {
    //         const optionBooked = alreadyBooked.filter(book => book.slot === option);
    //         const bookedSlots = optionBooked.map(book => book.slot);
    //         const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
    //         option.slots = remainingSlots;
    //     })
    //     res.send(options);
    //     console.log(options)
    // });

    app.post("/add-food", async (req, res) => {
      const foodInfo = req.body;
      const result = await foodCollection.insertOne(foodInfo);
      res.send(result);
    });
    // all orders of the system
    app.get("/orders", async (req, res) => {
      const query = {};
      // console.log(query);
      const orders = await ordersCollection.find(query).toArray();
      res.send(orders);
    });

    app.get("/manager/orders", async (req, res) => {
      
      const query = {
       
      };
      const orders = await ordersCollection.find(query).toArray();
      console.log(orders);
      res.send(orders);
    });
    //  all order of a particular user
    // app.get("/orders", async (req, res) => {
    //   const email = req.query.email;
    //   console.log(email);
    //   const query = {
    //     customerEmail: email,
    //   };
    //   // console.log(query);
    //   const orders = await ordersCollection.find(query);
    //   res.send(orders);
    // });
    // get all order of user
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };

      // console.log(query);
      const orders = await ordersCollection.findOne(query);
      res.send(orders);
    });
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        customerEmail: email,
      };
      // console.log(query);
      const orders = await ordersCollection.find(query).toArray();
      res.send(orders);
    });
    // reservations

    app.post("/reservations", async (req, res) => {
      const bookingInfo = req.body;
      const transactionId = new ObjectId().toString();
      const data = {
        total_amount: bookingInfo.price,
        currency: "BDT",
        tran_id: transactionId, // use unique tran_id for each api call
        success_url: `http://localhost:5000/booking-payment/success?transactionId=${transactionId}`,
        fail_url: "http://localhost:3030/fail",
        cancel_url: "http://localhost:3030/cancel",
        ipn_url: "http://localhost:3030/ipn",
        shipping_method: "Courier",
        product_name: "Cafe Reservation",
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
        ship_add1: "Dhaka",
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

      // const result = await bookingCollection.updateOne(
      //   { bookingId },
      //   { $set: { paid: false, transactionId } }
      // );

      const result = await bookingCollection.insertOne({
        ...bookingInfo,
        transactionId,
        paid: false,
        pmr: false,
      });
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
      const bookingId = req.body.id;
      const bookingInfo = await bookingCollection.findOne({
        _id: new ObjectId(bookingId),
      });
      const transactionId = new ObjectId().toString();
      const data = {
        total_amount: bookingInfo.price,
        currency: "BDT",
        tran_id: transactionId, // use unique tran_id for each api call
        success_url: `http://localhost:5000/booking-payment/success?transactionId=${transactionId}`,
        fail_url: "http://localhost:3030/fail",
        cancel_url: "http://localhost:3030/cancel",
        ipn_url: "http://localhost:3030/ipn",
        shipping_method: "Courier",
        product_name: "Cafe Reservation",
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
        ship_add1: "Dhaka",
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

      const result = await bookingCollection.updateOne(
        { bookingId },
        { $set: { paid: false, transactionId } }
      );

      // const result = await bookingCollection.updateOne({

      //   ,
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
        pmr: false,
        processed: false,
        picked: false,
        delivered: false,
        shifted: false,
      });
      // res.send(result);
    });

    // update

    app.put("/cashier/orders/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          pmr: true,
        },
      };
      const result = await ordersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // assign delivery man

    app.put("/manager/orders", async (req, res) => {
      const id = req.query.id;
      const dm = req.query.dm;

      const userInfo = await usersCollection.findOne({
        _id: new ObjectId(dm),
      });
      console.log(userInfo);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          processed: true,
          dmEmail: userInfo.email,
        },
      };
      const result = await ordersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      console.log(result);
      res.send(result);
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

    //booking success
    app.post("/booking-payment/success", async (req, res) => {
      const { transactionId } = req.query;
      const result = await bookingCollection.updateOne(
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
