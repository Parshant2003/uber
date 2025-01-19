const dotenv =require('dotenv')
const express = require('express');
dotenv.config();
const app = express();
const cors=require('cors');
const connectTOdb=require("./db/db")
const userRoute=require("./routes/user.routes")



connectTOdb();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));



app.get('/',(req,res)=>{
    res.send("Helllo World");
})
app.use("/user",userRoute);

module.exports=app;