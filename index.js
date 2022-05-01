const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const Objectid = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
require('dotenv').config();


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('assignment 11 server is running');
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q1k3m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect();

        app.get('/fruits', async (req, res) => {
            const fruitstore = client.db("fruitStore").collection("fruits");

            if (req.query.email) {
                const query = { email: req.query.email };
                const cursor = fruitstore.find(query);
                const result = await cursor.toArray();
                res.send(result)
            } else {
                const query = {};
                const cursor = fruitstore.find(query);
                const result = await cursor.toArray();
                res.send(result)
            }



        })

        app.get('/fruit/:id', async (req, res) => {
            const fruitstore = client.db("fruitStore").collection("fruits");
            const id = req.params.id;
            const query = { _id: Objectid(id) }
            const result = await fruitstore.findOne(query);
            res.send(result)

        })

        app.put('/updateqty', async (req, res) => {
            const fruitstore = client.db("fruitStore").collection("fruits");
            const id = req.body.id;
            const quantity = parseInt(req.body.qty);
            const exist_qty = parseInt(req.body.exist_qty);


            const filter = { _id: Objectid(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    qty: quantity + exist_qty
                },
            };
            const result = await fruitstore.updateOne(filter, updateDoc, options);
            res.send(result)

        })


        app.put('/decreaseqty', async (req, res) => {
            const fruitstore = client.db("fruitStore").collection("fruits");
            const id = req.body.id;
            const exist_qty = parseInt(req.body.exist_qty);

            const filter = { _id: Objectid(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    qty: exist_qty - 1,
                },
            };
            const result = await fruitstore.updateOne(filter, updateDoc, options);
            res.send(result)

        })

        app.delete('/delete/:id', async (req, res) => {

            const fruitstore = client.db("fruitStore").collection("fruits");
            const id = req.params.id;
            const query = { _id: Objectid(id) };

            const result = await fruitstore.deleteOne(query);
            res.send(result)

        })

        app.post('/addfoods', async (req, res) => {
            const body = req.body;
            const fruitstore = client.db("fruitStore").collection("fruits");
            const result = await fruitstore.insertOne(body);
            res.send(result)

        })

    }
    finally {

    }

}

run().catch(console.dir);


app.listen(port, () => {
    console.log(`your server is running on ${port}`);
})