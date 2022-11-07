const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// Middle wares
app.use(cors());
app.use(express.json())

async function run() {
    try{

    }
    finally{

    }
}
run().catch(err => console.error(err))

app.get('/', (req,res) =>{
    res.send('Life care server is running');
});

app.listen(port, ()=>{
    console.log(`This server running on ${port}`);
})