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
    app.post("/api/v1/jobs", async (req, res) => {
      const job = req.body;
      const result = await jobsCollection.insertOne(job);
      console.log({ result });
      res.send(result);
    });

    // insert applied job/booking data to db
    app.post("/api/v1/user/create-booking", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      console.log("Booking data:", result);
      res.send(result);
    });

    // get the applied job/booking data from db
    app.get("/api/v1/user/find-booking", async (req, res) => {
      const cursor = bookingCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // update the applied jobs

    app.patch("/api/v1/user/update-booking/:id", async (req, res) => {
      const id = req.params.jobID;
      const query = { _id: new ObjectId(id) };

      const result = userCollection.updateOne(query);
      res.send(result);
    });

    // get user specific job data
    app.get("/api/v1/user/jobs", async (req, res) => {
      const queryEmail = req.query.email;

      let query = {};
      if (queryEmail) {
        query.email = queryEmail;
      }

      const result = await jobsCollection.find(query).toArray();
      console.log("User-specific job data:", result);
      res.send(result);
    });

    // update the job
    app.patch("/api/v1/user/Update-jobs/:jobID", async (req, res) => {
      const id = req.params.jobID;
      const filter = { _id: new ObjectId(id) };
      const UpdatedBooking = req.body;
      console.log(UpdatedBooking);

      const updateDoc = {
        $set: {
          jobTitle: UpdatedBooking.jobTitle,
          deadline: UpdatedBooking.deadline,
          description: UpdatedBooking.description,
          category: UpdatedBooking.category,
          priceRange: UpdatedBooking.priceRange,
        },
      };
      const result = await jobsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // delete the job
    app.patch("/api/v1/user/delete-job/:jobID", async (req, res) => {
      const id = req.params.jobID;
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await jobsCollection.deleteOne(query);
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
