const express = require('express')    //importing express
const { MongoClient, ServerApiVersion } = require('mongodb');  //importing mongodb


const app = express()
const port = 3000                    //defining port number

const uri = "mongodb+srv://mdzuneadabedineidmum:cyadfcayyYL1RxAb@practice.x1enzr7.mongodb.net/?retryWrites=true&w=majority";      //database url

const client = new MongoClient(uri, {       //making a mongo client
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("panda").command({ ping: 1 });
      const database = client.db("panda");     //connected to db
      const products = database.collection("products"); //connected to products table
      //get rest methods
      app.get('/products',async(req,res)=>{
        const query = {};
        const result=await products.find(query).toArray();
        res.status(200).send(result);
      })
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
     
    }
  }
  run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})