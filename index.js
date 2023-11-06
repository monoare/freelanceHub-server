const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qfcfzds.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
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

    const jobsCollection = client.db("freelanceHubDB").collection("jobs");

    //   Web Development related ServerApiVersion
    app.get("/api/v1/jobs", async (req, res) => {
      let queryObj = {};
      const category = req.query.category;
      console.log({ category });
      if (category) {
        queryObj.category = category;
      }
      const cursor = jobsCollection.find(queryObj);
      const result = await cursor.toArray();
      console.log({ result });
      res.send(result);
    });

    // app.get("/api/v1/jobs/category", async (req, res) => {
    //   const category = req.body.category;
    //   let query = {};
    //   if (category) {
    //     query.category = category;
    //   }
    //   console.log({ query });
    //   const result = await jobsCollection.find(query).toArray();
    //   console.log({ result });
    //   res.send(result);
    // });

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
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`FreelanceHub is listening on port ${port}`);
});
