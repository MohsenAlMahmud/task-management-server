const express = require('express');
const cors = require('cors');
require('dotenv').config();
// var jwt = require('jsonwebtoken');
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

// app.post('/jwt', async (req, res) => {
//     const user = req.body;
//     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
//     res.send({ token });
// });

//middlewares
// const verifyToken = (req, res, next) => {
//     console.log('inside verify token', req.headers.authorization);
//     if (!req.headers.authorization) {
//         return res.status(401).send({ message: 'Unauthorized Access' });
//     }
//     const token = req.headers.authorization.split(' ')[1];
//     console.log(token);
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).send({ message: 'Unauthorized access' })
//         }
//         req.decoded = decoded;
//         next();
//     })

// };


async function run() {
    try {
        // await client.connect();
        const taskCollection = client.db("taskDB").collection("tasks");
        const profileCollection = client.db("taskDB").collection("profiles");

        app.get('/', (req, res) => {
            res.send('SIMPLE CRUD IS RUNNING');
        });

        // app.get("/tasks", async (req, res) => {
        //     const result = await blogCollection.find().toArray();
        //     res.send(result);
        // });

        app.get('/tasks', async (req, res) => {
            const userEmail = req.query.email;
            const result = await taskCollection.find({ email: userEmail }).toArray();
            res.send(result);
        });

        app.post('/tasks', async (req, res) => {
            const task = req.body;
            task.createdAt = new Date();
            // task.userId = req.decoded._id;
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

        //profile collection

        app.get('/profiles', async (req, res) => {
            const userEmail = req.query.email;
            const result = await profileCollection.find({ email: userEmail }).toArray();
            res.send(result);
        });

        app.get('/', async (req, res) => {
            try {
                const userEmail = req.query.email;
                console.log('User Email:', userEmail);
        
                if (!userEmail) {
                    return res.status(400).json({ error: 'Email parameter is required.' });
                }
        
                const result = await profileCollection.findOne({ email: userEmail });
                console.log('Profile Result:', result);
        
                if (!result) {
                    return res.status(404).json({ error: 'Profile not found.' });
                }
        
                res.json(result);
            } catch (error) {
                console.error('Error fetching profile:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.post('/profiles', async (req, res) => {
            const profile = req.body;
            profile.createdAt = new Date();
            const result = await profileCollection.insertOne(profile);
            res.send(result);
        });
        //  app.post('/profiles', async (req, res) => {
        //     const profile = req.body;
        //     profile.createdAt = new Date();
        //     console.log('new profile', profile);
        //     const result = await profileCollection.insertOne(profile);
        //     console.log(result);
        //     res.send(result);
        // });

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