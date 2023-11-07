const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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
    const bookingCollection = client
      .db("freelanceHubDB")
      .collection("bookings");

    //   Jobs related APIs
    app.get("/api/v1/jobs", async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();

      res.send(result);
    });

    app.get("/api/v1/jobs/:jobID", async (req, res) => {
      const id = req.params.jobID;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    // insert jobs data to db
    app.post("/api/v1/jobs", (req, res) => {
      const job = req.body;
      const result = jobsCollection.insertOne(job);
      console.log({ result });
      res.send(result);
    });

    // insert booking data to db
    app.post("/api/v1/user/create-booking", (req, res) => {
      const booking = req.body;
      const result = bookingCollection.insertOne(booking);
      res.send(result);
    });

    // get user specific job data
    app.get("/api/v1/user/jobs", (req, res) => {
      const queryEmail = req.query.email;
      const result = jobsCollection.find(queryEmail);
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
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`FreelanceHub is listening on port ${port}`);
});
