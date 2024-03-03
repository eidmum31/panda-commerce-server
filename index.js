const express = require("express"); //importing express
const cors = require("cors"); //importing cors
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb"); //importing mongodb

const app = express();
const port=process.env.PORT||3000;//defining port number

//middlewars
app.use(express.json());
app.use(cors());

const uri =
  "mongodb+srv://mdzuneadabedineidmum:QvBebqm9i8sDWEgm@practice.x1enzr7.mongodb.net/?retryWrites=true&w=majority"; //database url

const client = new MongoClient(uri, {
  //making a mongo client
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("panda").command({ ping: 1 });
    const database = client.db("panda"); //connected to db
    const products = database.collection("products"); //connected to products table
    const orders = database.collection("orders"); //connected to orders table
    const promotions = database.collection("promotions"); //connected to promotions table
    //get rest methods
    app.get("/products", async (req, res) => {
      const filter = {};
      const result = await products.find(filter).toArray(); //get all the products
      res.status(200).send(result);
    });

    app.get("/orders", async (req, res) => {
      const query = req.query;        //get orders based on category
      let filter = {};
      if (query.category === "pending") filter = { status: "pending" };
      if (query.category === "confirmed") filter = { status: "confirmed" };
      if (query.category === "cancelled") filter = { status: "cancelled" };
      const result = await orders.find(filter).toArray();
      res.send(result);
    });

    app.get("/promotions", async (req, res) => {
      let filter = {};  //get all the promotions
      const result = await promotions.find(filter).toArray();
      res.send(result);
    });

    app.get("/promotions/:id", async (req, res) => {
      const id = req.params.id;  //get a specific promotion by id
      let filter = { _id: new ObjectId(id) };
      const result = await promotions.findOne(filter);
      res.send(result);
    });

    app.get("/promos", async (req, res) => {
      const promo = req.query.promo;    //validate promo for not found,limit reached,expired or deactive
      const filter = { promo };
      const result = await promotions.findOne(filter);
      var givenDate = new Date(result?.end); // Example: February 17, 2024

      // Get the current date
      var currentDate = new Date();
      const newResult = {};
      if (!result) {
        newResult.message = "Promo is not exist";
        newResult.success = false;
        console.log(newResult);
        res.send(newResult);
      } 
      else if(!result.use){
        newResult.message = "Promo reached it's limit";
        newResult.success = false;
        res.send(newResult);
      }
      
      else if (!result.active) {
        newResult.message = "Promo is not active";
        newResult.success = false;
        console.log(newResult);
        res.send(newResult);
      } else if (givenDate < currentDate) {
        
        newResult.message = "Promo is expired";
        newResult.success = false;
        console.log(newResult);
        res.send(newResult);
      } else {
        newResult.success = true;
        newResult.rate = result.rate;
        await promotions.updateOne(filter,{$set:{use:parseInt(result.use)-1}});
        console.log(newResult);
        res.send(newResult);
      }
    });

    //post request
    app.post("/products", async (req, res) => {
      const data = req.body;       //add a new product
      console.log(data);
      const result = await products.insertOne(data);
      res.status(201).send(result);
    });

    app.post("/promotions", async (req, res) => {
      const data = req.body;
      console.log(data);          //add a new promotion
      const result = await promotions.insertOne(data);
      res.status(201).send(result);
    });

    app.post("/orders", async (req, res) => {
      const data = req.body;           //post a new order
      const result = await orders.insertOne(data);
      res.status(201).send(result);
    });

    //patch apis
    app.patch("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;           //update order status from pending to confirmed or cancelled
      const result = await orders.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );
      res.send(result);
    });

    app.patch("/promotions/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;        //update promotions  or toogle promotion active status
      const result = await promotions.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );
      res.send(result);
    });
    //Delete api
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;       //delete a product
      const result = await products.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

  
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
