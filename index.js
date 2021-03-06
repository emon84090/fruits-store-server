const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const Objectid = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
require('dotenv').config();


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('assignment 11 server is running');
})

const verifyjwt = (req, res, next) => {
    const autheader = req.headers.authorization;
    if (!autheader) {
        return res.status(401).send({ message: 'unauthorize' })
    }
    const token = autheader.split(' ')[1];


    jwt.verify(token, process.env.PRIVATE_KEY, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;

        next();
    });


}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q1k3m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect();

        app.get('/fruits', verifyjwt, async (req, res) => {
            const fruitstore = client.db("fruitStore").collection("fruits");
            const decodemail = req.decoded.email;
            const queryemail = req.query.email;
            const query = { email: queryemail };

            if (decodemail == queryemail) {
                const cursor = fruitstore.find(query);
                const result = await cursor.toArray();
                res.send(result)
            } else {
                res.status(403).send({ message: 'forbidden access' })
            }


        })


        app.get('/allfruits', async (req, res) => {
            const fruitstore = client.db("fruitStore").collection("fruits");

            const query = {};
            const cursor = fruitstore.find(query);
            const result = await cursor.toArray();
            res.send(result)

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
            const quantity = req.body.updateqty;

            const filter = { _id: Objectid(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    qty: quantity
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


        app.post('/login', (req, res) => {
            const user = req.body;

            const accesstoken = jwt.sign(user, process.env.PRIVATE_KEY, {
                expiresIn: '1d'
            })
            res.send({ accesstoken })
        })


    }
    finally {

    }

}

run().catch(console.dir);


app.listen(port, () => {
    console.log(`your server is runnings on ${port}`);
})