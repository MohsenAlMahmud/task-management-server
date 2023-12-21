const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b5j4nsy.mongodb.net/?retryWrites=true&w=majority`;

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
        const taskCollection = client.db("taskDB").collection("tasks");

        app.get('/tasks', async (req, res) => {
            const result = await taskCollection.find().toArray();
            res.send(result);
          });
      
          app.post('/tasks', async (req, res) => {
            const task = req.body;
            task.createdAt = new Date();
            const result = await taskCollection.insertOne(task);
            res.send(result);
          });
      
          app.put('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const newStatus = req.body.status;
            const filter = { _id: new ObjectId(id) };
            const update = { $set: { status: newStatus } };
            const result = await taskCollection.updateOne(filter, update);
            res.send(result);
          });

          app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(filter);
            res.send(result);
          });
      
          console.log('Connected to MongoDB!');
        } finally {
          // Ensure that the client will close when you finish/error
          // await client.close();
        }
      }
      
      run().catch(console.dir);
      
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });