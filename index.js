const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());

// Cookies parsers
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://freelancehub-45daa.web.app",
      "https://freelancehub-45daa.firebaseapp.com",
    ],
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

    // verify token and grant access
    const gateman = (req, res, next) => {
      const token = req?.cookies?.token;
      console.log(token);

      // if client does not send token
      if (!token) {
        return res.status(401).send({ message: "You are not authorized" });
      }
      // verify a token symmetric
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        function (err, decoded) {
          if (err) {
            return res.status(401).send({ message: "You are not authorized" });
          }
          //  attached decoded user so that others can get it
          req.user = decoded;
          next();
        }
      );
    };

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
    app.post("/api/v1/user/create-booking", gateman, async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      console.log("Booking data:", result);
      res.send(result);
    });

    // get the applied job/booking data from db
    app.get("/api/v1/user/find-booking", gateman, async (req, res) => {
      const cursor = bookingCollection.find();
      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });

    // Update the applied/booking jobs
    app.patch("/api/v1/user/update-booking/:id", gateman, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      // Check if id is a valid ObjectId
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ObjectId" });
      }

      const updatedData = req.body; // This should contain the fields you want to update

      const updateDoc = {
        $set: updatedData, // Use $set to update specific fields
      };

      const result = await bookingCollection.updateOne(query, updateDoc);
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
      // console.log("User-specific job data:", result);
      res.send(result);
    });

    // update the job
    app.patch("/api/v1/user/Update-jobs/:jobID", gateman, async (req, res) => {
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

    // Corrected DELETE endpoint
    app.delete("/api/v1/user/delete-job/:jobID", gateman, async (req, res) => {
      const id = req.params.jobID;
      const query = { _id: new ObjectId(id) };
      console.log("Deleting job with ID:", id);
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });

    // auth related api
    app.post("/api/v1/auth/access-token", (req, res) => {
      const user = req.body;
      console.log("User", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
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
