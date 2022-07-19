const express = require("express");
const cors = require("cors")
require("dotenv").config()
const port = process.env.PORT || 5000;

const app = express()

// middleware
app.use(cors())
app.use(express.json())

// get root port
app.get("/", (req, res)=>{
    res.send("Best Tools Parts Project Running Server side")
})

// listen prot 
app.listen(port, ()=>{
    console.log("listen port: ", port)
})