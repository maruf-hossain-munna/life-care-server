const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// Middle wares
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jfb2tzn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next){
    // console.log(req.headers.authorization);
    const authHead = req.headers.authorization;
    if( !authHead) {
        res.status(401).send({message : 'Unauthorized access'})
    }
    const token = authHead.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            res.status(401).send({message : 'Unauthorized access'})
        }
        req.decoded = decoded;
        next();
    })
} 

async function run() {
    try {
        const serviceCollection = client.db('lifeCare').collection('services');
        const reviewCollection = client.db('lifeCare').collection('reviews');

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        app.get('/allServices', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const allServices = await cursor.toArray();
            res.send(allServices);
        })

        app.get('/allServices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })

        app.post('/allServices', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })



        // reviews api 
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        })

        app.get('/myReviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            console.log('inside decoded', decoded);
            if( decoded.email !== req.query.email){
                res.status(403).send({message : 'Forbidden Access'})
            }
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        })

        app.delete('/myReviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

        app.patch('/myReviews/:id', async (req, res) => {
            const id = req.params.id;
            const reviewText = req.body;
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    reviewText: reviewText.updateReviewText
                }
            }
            const result = await reviewCollection.updateOne(query, updateDoc);
            res.send(result);
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result)
        })


        // JWT api
        app.post('/jwt',  async (req, res) => {
            const user = req.body;
            // console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' });
            res.send({token})
        })


    }
    finally {

    }
}
run().catch(err => console.error(err))



app.get('/', (req, res) => {
    res.send('Life care server is running');
});

app.listen(port, () => {
    console.log(`This server running on ${port}`);
})



