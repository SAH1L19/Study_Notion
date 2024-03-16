const mongoose = require("mongoose");
require("dotenv").config();

const connect= async()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser :true,
        useUnifiedTopology:true,
    })
    .then(console.log("Connected successfully"))
    .catch((error)=>{
        console.log(error);
        process.exit(1);
    })
}
module.exports = { connect };