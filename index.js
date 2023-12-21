const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;


//? Middleware 
app.use(cors())
app.use(express.json());

app.get('/', (req,res) => {
    res.send(`App is running on port ${port}`)
})

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster2.edqru7i.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const database = client.db('task-bud');
const usersCollection = database.collection('users')
const todoCollection = database.collection('todo')

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    //? User api
    //? Save the user to database.
     app.put('/users/:email', async (req, res) => {
        const email = req.params.email
        const user = req.body
        const query = { email: email }
        const options = { upsert: true }
        const isExist = await usersCollection.findOne(query)
        console.log('Is user exist', isExist)
        if (isExist) {
            return res.send(isExist)
          }
  
        const result = await usersCollection.updateOne(
          query,
          {
            $set: { ...user },
          },
          options
        )
        res.send(result)
      })


    //? Task related api
    app.post('/addTodo', async(req, res) => {
      const todo = req.body;
      const result = await todoCollection.insertOne(todo);
      res.send(result);
      console.log(todo);
    })

    //? Get all todo
    app.get('/todo', async(req, res) => {
      const email = req.query.email;
      const query = { email : email};
      const result = await todoCollection.find(query).toArray();
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log('App is running on port 5000');
})