const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Coffee server is getting hotter");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.glnanjr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0;`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const coffeeCollection = client.db("coffeeDB").collection("coffee");

    app.get("/coffee", async (req, res) => {
      const results = await coffeeCollection.find().toArray();
      res.send(results);
    });

    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const results = await coffeeCollection.findOne(query);
      res.send(results);
    });

    app.post("/coffee", async (req, res) => {
      const newCoffee = req.body;
      console.log("Received new coffee data:", newCoffee);
      const results = await coffeeCollection.insertOne(newCoffee);
      res.send(results);
    });

    app.put("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCoffee = req.body;
      const updatedDoc = {
        $set: updatedCoffee,
      };
      const results = await coffeeCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(results);
    });

    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const results = await coffeeCollection.deleteOne(query);
      res.send(results);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Coffee server is running on port: ${port}`);
});
