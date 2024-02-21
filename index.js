const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

//middlewers
app.use(cookieParser());
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db("ZIOR").collection("productCollection");
    const cartCollection = client.db("ZIOR").collection("cartCollection");

    //get all products
    app.get("/products", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    //get productByid
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const productId = new ObjectId(id);
      const result = await productCollection.findOne(productId);
      res.send(result);
    });

    //get cartItems
    app.get("/myCart", async (req, res) => {
      const result = await cartCollection.find().toArray();
      res.send(result);
    });

    //add product
    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    //add to cart items
    app.post("/addToCart", async (req, res) => {
      const cartToProduct = req.body;
      const uniqId = uuidv4();
      cartToProduct._id = uniqId;
      const result = await cartCollection.insertOne(cartToProduct);
      res.send(result);
    });

    //update product

    app.put(`/updateProduct/:id`, async (req, res) => {
      const id = req.params.id;
      const update = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateProduct = {
        $set: {
          name : update.name,
          type : update.type,
          image : update.image,
          price : update.price,
          brand : update.brand,
          details : update.details,
          rating : update.rating,
        },
      };
      const result = await productCollection.updateOne(filter, updateProduct);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ZIOR server is running");
});

app.listen(port, () => {
  console.log(` ZIOR server running port ${port} `);
});
